'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { DocumentTextIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Material } from '../../types/Material';
import { Group } from '../../types/Group';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { BaseModal } from '../../components/ui/BaseModal';
import { useDebounce } from '../../hooks/useDebounce';

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.rtf', 
  '.ppt', '.pptx', '.xls', '.xlsx', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', 
  '.zip', '.rar', '.7z', '.epub', '.djvu'
];

const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

export default function MaterialsPage() {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const debouncedSearchTitle = useDebounce(searchTitle, 300);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    groupId: '',
    file: null as File | null
  });
  
  const [editData, setEditData] = useState({
    title: '',
    description: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user?.organizationId) return;
    
    try {
      const response = await AuthenticatedApiService.getGroups(user.organizationId, 1000);
      setGroups(response?.items || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, [user?.organizationId]);

  const loadMaterials = useCallback(async () => {
    if (!user?.organizationId) return;
    
    try {
      setLoading(true);
      const response = await AuthenticatedApiService.getMaterials(
        user.organizationId,
        currentPage,
        pageSize,
        selectedGroupId || undefined,
        debouncedSearchTitle || undefined
      );
      
      setMaterials(response.items);
      setTotalCount(response.totalCount);
      setTotalPages(Math.ceil(response.totalCount / response.pageSize));
    } catch (error) {
      console.error('Failed to load materials:', error);
      showError('Ошибка загрузки материалов');
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, currentPage, pageSize, selectedGroupId, debouncedSearchTitle, showError]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGroups();
    }
  }, [isAuthenticated, user, loadGroups]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMaterials();
    }
  }, [isAuthenticated, user, loadMaterials]);

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.groupId || !uploadData.file) {
      showError('Заполните все обязательные поля');
      return;
    }

    if (uploadData.title.length > 255) {
      showError('Название не должно превышать 255 символов');
      return;
    }

    if (uploadData.description && uploadData.description.length > 1000) {
      showError('Описание не должно превышать 1000 символов');
      return;
    }

    const fileExtension = '.' + uploadData.file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      showError('Недопустимый формат файла');
      return;
    }

    if (uploadData.file.size > MAX_FILE_SIZE) {
      showError('Размер файла не должен превышать 150 МБ');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('Title', uploadData.title);
      if (uploadData.description) {
        formData.append('Description', uploadData.description);
      }
      formData.append('GroupId', uploadData.groupId);
      formData.append('File', uploadData.file);

      await AuthenticatedApiService.uploadMaterial(formData);
      showSuccess('Материал успешно загружен');
      setIsUploadModalOpen(false);
      setUploadData({ title: '', description: '', groupId: '', file: null });
      loadMaterials();
    } catch (error) {
      console.error('Failed to upload material:', error);
      showError('Ошибка загрузки материала');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setEditData({
      title: material.title,
      description: material.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedMaterial || !editData.title) {
      showError('Название обязательно');
      return;
    }

    if (editData.title.length > 255) {
      showError('Название не должно превышать 255 символов');
      return;
    }

    if (editData.description && editData.description.length > 1000) {
      showError('Описание не должно превышать 1000 символов');
      return;
    }

    try {
      await AuthenticatedApiService.updateMaterial(selectedMaterial.id, {
        title: editData.title,
        description: editData.description || undefined
      });
      showSuccess('Материал обновлен');
      setIsEditModalOpen(false);
      loadMaterials();
    } catch (error) {
      console.error('Failed to update material:', error);
      showError('Ошибка обновления материала');
    }
  };

  const handleDelete = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;

    try {
      setDeleting(true);
      await AuthenticatedApiService.deleteMaterial(selectedMaterial.id);
      showSuccess('Материал удален');
      setIsDeleteModalOpen(false);
      setSelectedMaterial(null);
      loadMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      showError('Ошибка удаления материала');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      await AuthenticatedApiService.downloadMaterial(material.id, material.originalFileName);
    } catch (error) {
      console.error('Failed to download material:', error);
      showError('Ошибка скачивания файла');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const canEditDelete = (material: Material): boolean => {
    if (!user) return false;
    return user.id === material.uploadedById || 
           user.role === 'Administrator' || 
           user.role === 'Owner';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="w-full space-y-6 mt-16">
        <PageHeaderWithStats
          title="Учебные материалы"
          subtitle="Загрузка и управление учебными материалами для групп"
          icon={DocumentTextIcon}
          gradientFrom="purple-500"
          gradientTo="pink-600"
          actionLabel="Загрузить материал"
          onAction={() => setIsUploadModalOpen(true)}
          stats={[
            { label: "Всего материалов", value: totalCount, color: "purple" },
            { label: "На странице", value: materials.length, color: "pink" },
            { label: "Страниц", value: totalPages, color: "violet" }
          ]}
        />

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Фильтры</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Поиск по названию
              </label>
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Введите название..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Группа
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Все группы</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка...</div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Материалы не найдены
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-custom">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '20%' }}>
                      Название
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '20%' }}>
                      Файл
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '15%' }}>
                      Группа
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '15%' }}>
                      Загрузил
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '10%' }}>
                      Дата
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '120px' }}>
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {material.title}
                        </div>
                        {material.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {material.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {material.originalFileName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(material.fileSize)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white truncate">
                        {material.groupName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white truncate">
                        {material.uploadedByName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(material.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handleDownload(material)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5"
                          title="Скачать"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                        {canEditDelete(material) && (
                          <>
                            <button
                              onClick={() => handleEdit(material)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1.5"
                              title="Редактировать"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(material)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5"
                              title="Удалить"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Показать:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Назад
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <BaseModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadData({ title: '', description: '', groupId: '', file: null });
        }}
        title="Загрузить материал"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              maxLength={255}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Введите название материала"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Описание материала (опционально)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Группа <span className="text-red-500">*</span>
            </label>
            <select
              value={uploadData.groupId}
              onChange={(e) => setUploadData({ ...uploadData, groupId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Выберите группу</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Файл <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Максимальный размер: 150 МБ. Форматы: {ALLOWED_EXTENSIONS.join(', ')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadData({ title: '', description: '', groupId: '', file: null });
              }}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Отмена
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Edit Modal */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать материал"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              maxLength={255}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Отмена
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg"
            >
              Сохранить
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMaterial(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Удалить материал"
        message={`Вы уверены, что хотите удалить материал "${selectedMaterial?.title}"? Это действие необратимо.`}
        isLoading={deleting}
      />
    </div>
  );
}
