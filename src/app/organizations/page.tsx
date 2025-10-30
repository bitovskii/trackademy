'use client';

import { useState, useEffect } from 'react';
import { Organization, OrganizationFormData } from '../../types/Organization';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { PhoneIcon, MapPinIcon, PencilIcon, TrashIcon, PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

import UniversalModal from '../../components/ui/UniversalModal';
import { useUniversalModal } from '../../hooks/useUniversalModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import OwnerProtectedRoute from '../../components/OwnerProtectedRoute';

function OrganizationsPage() {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingOrganization, setDeletingOrganization] = useState<Organization | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Универсальная система модалов для организаций
  const organizationModal = useUniversalModal('organization', {
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadOrganizations();
    }
  }, [isAuthenticated]);

  // Check authentication after all hooks are called
  if (!isAuthenticated) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>Требуется авторизация</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Войдите в систему для управления организациями
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="btn-primary"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AuthenticatedApiService.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      setError('Не удалось загрузить организации. Попробуйте еще раз.');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const organization = organizations.find(org => org.id === id);
    if (organization) {
      organizationModal.openEditModal({
        name: organization.name,
        phone: organization.phone || '',
        address: organization.address || ''
      });
    }
  };

  const handleSaveEdit = async (id: number, formData: OrganizationFormData) => {
    await AuthenticatedApiService.updateOrganization(id.toString(), formData);
    await loadOrganizations(); // Reload the list to show updated data
    organizationModal.closeModal();
  };

  const handleDelete = (id: number) => {
    const organization = organizations.find(org => org.id === id);
    if (organization) {
      setDeletingOrganization(organization);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCreate = () => {
    organizationModal.openCreateModal();
  };

  const handleSaveCreate = async (formData: OrganizationFormData) => {
    await AuthenticatedApiService.createOrganization(formData);
    await loadOrganizations(); // Reload the list to show new data
    organizationModal.closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrganization) return;
    
    try {
      await AuthenticatedApiService.deleteOrganization(deletingOrganization.id.toString());
      await loadOrganizations(); // Reload the list to show updated data
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingOrganization(null);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Организации</h1>
          <p className="page-subtitle">Управление образовательными организациями</p>
        </div>
        
        <div className="card text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadOrganizations}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header Card */}
        <PageHeaderWithStats
          title="Организации"
          subtitle="Управление образовательными организациями"
          icon={BuildingOfficeIcon}
          gradientFrom="indigo-500"
          gradientTo="purple-600"
          actionLabel="Добавить организацию"
          onAction={handleCreate}
          stats={[
            { label: "Всего организаций", value: organizations.length, color: "violet" },
            { label: "Активные", value: organizations.length, color: "purple" },
            { label: "Регионы", value: new Set(organizations.map(org => org.address.split(',')[0])).size, color: "indigo" }
          ]}
        />
        
{/* Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {organizations.length === 0 ? (
            <div className="text-center py-16 p-6">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Нет организаций</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Создайте первую организацию для начала работы
              </p>
              <button
                onClick={handleCreate}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Добавить организацию
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((organization) => (
                  <div
                    key={organization.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {organization.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(organization.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="Редактировать"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(organization.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="Удалить"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {organization.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {organization.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal Organization Modal */}
      <UniversalModal
        isOpen={organizationModal.isOpen}
        mode={organizationModal.mode}
        title={organizationModal.getConfig().title}
        subtitle={organizationModal.getConfig().subtitle}
        icon={organizationModal.getConfig().icon}
        gradientFrom={organizationModal.getConfig().gradientFrom}
        gradientTo={organizationModal.getConfig().gradientTo}
        maxWidth="lg"
        initialData={organizationModal.editData || {
          name: '',
          phone: '',
          address: ''
        }}
        onClose={organizationModal.closeModal}
        onSave={async (data: OrganizationFormData) => {
          if (organizationModal.mode === 'create') {
            await handleSaveCreate(data);
          } else {
            await handleSaveEdit(0, data); // ID будет получен из контекста
          }
        }}
        submitText={organizationModal.getConfig().submitText}
        loadingText={organizationModal.getConfig().loadingText}
      >
        {({ formData, setFormData }) => (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название организации
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Введите название организации"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Введите номер телефона"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Адрес
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Введите адрес организации"
                rows={3}
              />
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Удалить организацию"
        message={`Вы уверены, что хотите удалить организацию "${deletingOrganization?.name}"? Это действие нельзя отменить.`}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
}

// Wrap the entire component with OwnerProtectedRoute
function ProtectedOrganizationsPage() {
  return (
    <OwnerProtectedRoute>
      <OrganizationsPage />
    </OwnerProtectedRoute>
  );
}

export default ProtectedOrganizationsPage;
