'use client';

import { useState, useEffect } from 'react';
import { Organization, OrganizationFormData } from '../../types/Organization';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { PhoneIcon, MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

import EditOrganizationModal from '../../components/EditOrganizationModal';
import CreateOrganizationModal from '../../components/CreateOrganizationModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import OwnerProtectedRoute from '../../components/OwnerProtectedRoute';

function OrganizationsPage() {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingOrganization, setDeletingOrganization] = useState<Organization | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          <h3 className="mt-2 text-sm font-medium text-gray-900 ">��������� �����������</h3>
          <p className="mt-1 text-sm text-gray-500 ">
            ������� � ������� ��� ���������� �������������
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ����� � �������
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
      setError('�� ������� ��������� �����������. ���������� ��� ���.');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const organization = organizations.find(org => org.id === id);
    if (organization) {
      setEditingOrganization(organization);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (id: number, formData: OrganizationFormData) => {
    await AuthenticatedApiService.updateOrganization(id.toString(), formData);
    await loadOrganizations(); // Reload the list to show updated data
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrganization(null);
  };

  const handleDelete = (id: number) => {
    const organization = organizations.find(org => org.id === id);
    if (organization) {
      setDeletingOrganization(organization);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async (formData: OrganizationFormData) => {
    await AuthenticatedApiService.createOrganization(formData);
    await loadOrganizations(); // Reload the list to show new data
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

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingOrganization(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrganizations}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ����������� �����
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-end items-center">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span>��������</span>
          </button>
        </div>
        
        {organizations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-500 ">����������� �� �������.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {organizations.map((org, index) => (
                <div key={org.id} className="bg-white p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{org.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{org.address}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100 ">
                    <button
                      onClick={() => handleEdit(org.id)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      �������������
                    </button>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                    >
                      �������
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-white-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      �
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      �����������
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      �������
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      �����
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      ��������
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 ">
                  {organizations.map((org, index) => (
                    <tr key={org.id} className="bg-white-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{org.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(org.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="������������� �����������"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(org.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="������� �����������"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      <EditOrganizationModal
        isOpen={isEditModalOpen}
        organization={editingOrganization}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleSaveCreate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удалить организацию"
        message="Вы действительно хотите удалить эту организацию? Все данные, связанные с организацией, будут безвозвратно потеряны."
        itemName={deletingOrganization?.name}
        danger={true}
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

export { ProtectedOrganizationsPage as default };
