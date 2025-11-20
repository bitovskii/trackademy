'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CurrencyDollarIcon, 
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { PaymentStats, StudentPaymentGroup, PaymentFilters } from '../../types/Payment';
import { PaymentApiService } from '../../services/PaymentApiService';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { StudentPaymentsModal } from '../../components/StudentPaymentsModal';
import { ColumnVisibilityControl, ColumnConfig } from '../../components/ui/ColumnVisibilityControl';
import { AuthenticatedApiService } from '@/services/AuthenticatedApiService';
import { Group } from '@/types/Group';
import { CreatePaymentModal } from '@/components/CreatePaymentModal';

export default function PaymentsPage() {
  const { isAuthenticated, user } = useAuth();
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [studentPayments, setStudentPayments] = useState<StudentPaymentGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedStudentPayments, setSelectedStudentPayments] = useState<StudentPaymentGroup | null>(null);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  
  // Create payment modal state
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Фильтры
  const [filters, setFilters] = useState<Partial<PaymentFilters>>({
    status: undefined,
    type: undefined,
    groupId: undefined,
    fromDate: undefined,
    toDate: undefined
  });

  // Управление видимостью колонок
  const [columnVisibility, setColumnVisibility] = useState({
    number: true,      // Обязательная
    student: true,     // Обязательная  
    lastPeriod: true,
    lastType: true,
    lastAmount: true,
    status: true,      // Обязательная
    paymentsCount: true,
    lastCreated: true,
    lastPaid: true
  });

  // Константы для фильтров
  const statusOptions = [
    { value: undefined, label: 'Все статусы' },
    { value: 1, label: 'Ожидает оплаты' },
    { value: 2, label: 'Оплачен' },
    { value: 3, label: 'Просрочен' },
    { value: 4, label: 'Отменен' },
    { value: 5, label: 'Возврат средств' }
  ];

  const typeOptions = [
    { value: undefined, label: 'Все типы' },
    { value: 1, label: 'Ежемесячный' },
    { value: 2, label: 'Разовый' }
  ];

  // Загрузка статистики платежей
  // Загрузка групп
  const loadGroups = useCallback(async () => {
    if (!isAuthenticated || !user?.organizationId) {
      return;
    }

    setLoadingGroups(true);
    try {
      const response = await AuthenticatedApiService.post<{ items: Group[] }>(
        '/Group/get-groups',
        { organizationId: user.organizationId }
      );
      setGroups(response.items);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [isAuthenticated, user?.organizationId]);

  const loadPaymentStats = useCallback(async () => {
    if (!isAuthenticated || !user?.organizationId) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await PaymentApiService.getPaymentStats(user.organizationId!);
      setPaymentStats(result);
    } catch (err) {
      console.error('Error loading payment stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки статистики платежей';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.organizationId]);

  // Загрузка списка платежей
  const loadPayments = useCallback(async (page: number = currentPage, customPageSize?: number) => {
    const actualPageSize = customPageSize ?? pageSize;
    if (!isAuthenticated || !user?.organizationId) {
      return;
    }

    setLoadingPayments(true);
    
    try {
      const paymentFilters: PaymentFilters = {
        organizationId: user.organizationId!,
        page,
        pageSize: actualPageSize,
        ...filters
      };
      
      const result = await PaymentApiService.getPayments(paymentFilters);
      setStudentPayments(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setCurrentPage(result.pageNumber);
    } catch (err) {
      console.error('Error loading payments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки платежей';
      setError(errorMessage);
    } finally {
      setLoadingPayments(false);
    }
  }, [isAuthenticated, user?.organizationId, currentPage, pageSize]); // Убрал filters из зависимостей

  // Функции для стилизации
  const getPaymentStatusStyle = (status: number) => {
    switch (status) {
      case 1: return 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 2: return 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 3: return 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 4: return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 5: return 'text-purple-800 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  // Функции для работы с модалкой
  const handleViewAllPayments = (studentPaymentGroup: StudentPaymentGroup) => {
    setSelectedStudentPayments(studentPaymentGroup);
    setShowPaymentsModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentsModal(false);
    setSelectedStudentPayments(null);
  };

  // Функции для работы с фильтрами
  const updateFilter = (key: keyof PaymentFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  };

  const resetFilters = () => {
    setFilters({
      status: undefined,
      type: undefined,
      groupId: undefined,
      fromDate: undefined,
      toDate: undefined
    });
    setCurrentPage(1);
  };

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    setFilters(prev => ({
      ...prev,
      fromDate: startDate,
      toDate: endDate
    }));
    setCurrentPage(1);
  };

  const clearDateRange = () => {
    setFilters(prev => ({
      ...prev,
      fromDate: undefined,
      toDate: undefined
    }));
    setCurrentPage(1);
  };

  // Управление видимостью колонок
  const columns: ColumnConfig[] = [
    { key: 'number', label: '№', visible: columnVisibility.number, required: true },
    { key: 'student', label: 'Студент', visible: columnVisibility.student, required: true },
    { key: 'lastPeriod', label: 'Последний период', visible: columnVisibility.lastPeriod },
    { key: 'lastType', label: 'Тип', visible: columnVisibility.lastType },
    { key: 'lastAmount', label: 'Сумма', visible: columnVisibility.lastAmount },
    { key: 'status', label: 'Статус', visible: columnVisibility.status, required: true },
    { key: 'paymentsCount', label: 'Всего платежей', visible: columnVisibility.paymentsCount },
    { key: 'lastCreated', label: 'Создано', visible: columnVisibility.lastCreated },
    { key: 'lastPaid', label: 'Оплачено', visible: columnVisibility.lastPaid }
  ];

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof typeof prev]
    }));
  };

  const applyFilters = () => {
    if (!isAuthenticated || !user?.organizationId) return;
    
    const paymentFilters: PaymentFilters = {
      organizationId: user.organizationId!,
      page: 1,
      pageSize,
      ...filters
    };
    
    setLoadingPayments(true);
    PaymentApiService.getPayments(paymentFilters)
      .then(result => {
        setStudentPayments(result.items);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
        setCurrentPage(result.pageNumber);
      })
      .catch(err => {
        console.error('Error loading payments:', err);
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки платежей';
        setError(errorMessage);
      })
      .finally(() => {
        setLoadingPayments(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      loadPaymentStats();
      loadPayments(1);
    }
  }, [isAuthenticated, user?.organizationId, loadPaymentStats]);

  // Подготовка статистических карточек
  const stats = paymentStats ? [
    {
      label: 'Всего платежей',
      value: paymentStats.totalPayments,
      color: 'blue' as const,
    },
    {
      label: 'Оплачено',
      value: paymentStats.paidPayments,
      color: 'green' as const,
    },
    {
      label: 'Ожидают оплаты',
      value: paymentStats.pendingPayments,
      color: 'yellow' as const,
    },
    {
      label: 'Просрочено',
      value: paymentStats.overduePayments,
      color: 'red' as const,
    },
    {
      label: 'Отменено',
      value: paymentStats.cancelledPayments,
      color: 'red' as const,
    },
    {
      label: 'Возвращено',
      value: paymentStats.refundedPayments,
      color: 'purple' as const,
    }
  ] : [];

  // Детальные карточки со статистикой
  const detailedStats = paymentStats ? [
    {
      title: 'Общая сумма',
      amount: paymentStats.totalAmount,
      icon: BanknotesIcon,
      color: 'bg-blue-500',
      description: 'Общая сумма всех платежей'
    },
    {
      title: 'Оплачено',
      amount: paymentStats.paidAmount,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      description: 'Сумма оплаченных платежей'
    },
    {
      title: 'Ожидают оплаты',
      amount: paymentStats.pendingAmount,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      description: 'Сумма платежей в ожидании'
    },
    {
      title: 'Просрочено',
      amount: paymentStats.overdueAmount,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      description: 'Сумма просроченных платежей'
    }
  ] : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md">
            <div className="text-blue-500 text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Требуется авторизация
            </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Войдите в систему для управления платежами
          </p>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 page-container">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeaderWithStats
          title="Платежи"
          subtitle="Управление платежами студентов"
          icon={CurrencyDollarIcon}
          gradientFrom="from-green-400"
          gradientTo="to-emerald-600"
          stats={stats}
        />

        {/* Основной контент */}
        <div className="mt-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка статистики...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Ошибка загрузки данных
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={loadPaymentStats}
                    className="mt-3 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentStats && !loading && (
            <>
              {/* Детальная статистика по суммам */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {detailedStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.amount.toLocaleString()}₸
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Панель фильтров */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Фильтры
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        loadGroups();
                        setShowCreatePaymentModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Создать платеж
                    </button>
                    <ColumnVisibilityControl
                      columns={columns}
                      onColumnToggle={handleColumnToggle}
                      variant="header"
                    />
                    <button
                      onClick={resetFilters}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Фильтр по статусу */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Статус
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => updateFilter('status', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value || 'all'} value={option.value || ''}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по типу */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Тип платежа
                    </label>
                    <select
                      value={filters.type || ''}
                      onChange={(e) => updateFilter('type', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value || 'all'} value={option.value || ''}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по диапазону дат */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Период
                    </label>
                    <div className="flex items-center gap-2">
                      <DateRangePicker
                        startDate={filters.fromDate}
                        endDate={filters.toDate}
                        onDateChange={handleDateRangeChange}
                        placeholder="Выберите период"
                      />
                      {(filters.fromDate || filters.toDate) && (
                        <button
                          onClick={clearDateRange}
                          className="px-2 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Кнопка применить */}
                  <div className="flex items-end">
                    <button
                      onClick={applyFilters}
                      disabled={loadingPayments}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      {loadingPayments ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        'Применить'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Заглушка для будущего функционала */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
                {/* Заголовок таблицы */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Список платежей
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Всего: {totalCount}
                    </div>
                  </div>
                </div>

                {/* Таблица */}
                <div className="overflow-x-auto">
                  {loadingPayments ? (
                    <div className="flex items-center justify-center py-12">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка платежей...</span>
                    </div>
                  ) : studentPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Платежи не найдены
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Попробуйте изменить фильтры или создать новый платеж
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                          {columnVisibility.number && (
                            <th className="px-3 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-16">
                              №
                            </th>
                          )}
                          {columnVisibility.student && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Студент
                            </th>
                          )}
                          {columnVisibility.lastPeriod && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Последний период
                            </th>
                          )}
                          {columnVisibility.lastType && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Тип
                            </th>
                          )}
                          {columnVisibility.lastAmount && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Сумма
                            </th>
                          )}
                          {columnVisibility.status && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Статус
                            </th>
                          )}
                          {columnVisibility.paymentsCount && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Всего платежей
                            </th>
                          )}
                          {columnVisibility.lastCreated && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Создано
                            </th>
                          )}
                          {columnVisibility.lastPaid && (
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Оплачено
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {studentPayments.map((studentPayment, index) => (
                          <tr 
                            key={studentPayment.studentId} 
                            onClick={() => handleViewAllPayments(studentPayment)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            {columnVisibility.number && (
                              <td className="px-3 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm mx-auto">
                                  {(currentPage - 1) * pageSize + index + 1}
                                </div>
                              </td>
                            )}
                            {columnVisibility.student && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {studentPayment.studentName}
                                </div>
                              </td>
                            )}
                            {columnVisibility.lastPeriod && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {studentPayment.lastPaymentPeriod}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {studentPayment.lastPaymentPeriodStart && studentPayment.lastPaymentPeriodEnd ? 
                                      `${new Date(studentPayment.lastPaymentPeriodStart).toLocaleDateString('ru-RU')} - ${new Date(studentPayment.lastPaymentPeriodEnd).toLocaleDateString('ru-RU')}` : 
                                      'Не указано'
                                    }
                                  </div>
                                </div>
                              </td>
                            )}
                            {columnVisibility.lastType && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {studentPayment.lastPaymentTypeName}
                                </span>
                              </td>
                            )}
                            {columnVisibility.lastAmount && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {studentPayment.lastPaymentAmount.toLocaleString('ru-RU')}₸
                                  </div>
                                  {studentPayment.lastPaymentDiscountPercentage > 0 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Скидка {studentPayment.lastPaymentDiscountPercentage}% (было {studentPayment.lastPaymentOriginalAmount.toLocaleString('ru-RU')}₸)
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                            {columnVisibility.status && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusStyle(studentPayment.lastPaymentStatus)}`}>
                                  {studentPayment.lastPaymentStatusName}
                                </span>
                              </td>
                            )}
                            {columnVisibility.paymentsCount && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {studentPayment.payments?.length || 0}
                                </span>
                              </td>
                            )}
                            {columnVisibility.lastCreated && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {studentPayment.lastPaymentCreatedAt ? new Date(studentPayment.lastPaymentCreatedAt).toLocaleDateString('ru-RU') : 'Не указано'}
                              </td>
                            )}
                            {columnVisibility.lastPaid && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {studentPayment.lastPaymentPaidAt ? new Date(studentPayment.lastPaymentPaidAt).toLocaleDateString('ru-RU') : 'Не оплачено'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Пагинация */}
                {(totalPages > 1 || totalCount > pageSize) && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Показано {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} из {totalCount}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            На странице:
                          </label>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              const newPageSize = Number(e.target.value);
                              setPageSize(newPageSize);
                              setCurrentPage(1);
                              loadPayments(1, newPageSize);
                            }}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={40}>40</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadPayments(currentPage - 1)}
                          disabled={currentPage === 1 || loadingPayments}
                          className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Назад
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                          {currentPage} из {totalPages}
                        </span>
                        <button
                          onClick={() => loadPayments(currentPage + 1)}
                          disabled={currentPage === totalPages || loadingPayments}
                          className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Далее
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for student payments */}
      {selectedStudentPayments && (
        <StudentPaymentsModal
          isOpen={showPaymentsModal}
          onClose={handleCloseModal}
          studentName={selectedStudentPayments.studentName}
          payments={selectedStudentPayments.payments || []}
          onPaymentUpdate={() => {
            console.log('Payment updated, reloading data...');
            // Перезагружаем данные после изменения статуса платежа
            loadPaymentStats();
            loadPayments(currentPage);
          }}
        />
      )}

      {/* Modal for creating payment - Group and Student selection */}
      {showCreatePaymentModal && !selectedGroup && !showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-black/30 dark:bg-black/50" 
              onClick={() => {
                setShowCreatePaymentModal(false);
                setGroupSearch('');
                setShowGroupDropdown(false);
              }}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700 relative z-10">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CurrencyDollarIcon className="h-6 w-6" />
                    Выберите группу
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreatePaymentModal(false);
                      setGroupSearch('');
                      setShowGroupDropdown(false);
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 px-6 py-5">
                {loadingGroups ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Загрузка групп...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search input */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Поиск по названию или коду группы..."
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Groups list */}
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {groups
                        .filter(group => 
                          group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
                          group.code.toLowerCase().includes(groupSearch.toLowerCase())
                        )
                        .map(group => (
                          <button
                            key={group.id}
                            onClick={() => {
                              console.log('Group selected:', group);
                              setSelectedGroup(group);
                            }}
                            className="w-full text-left px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group"
                          >
                            <div className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {group.name}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {group.code}
                              </span>
                              <span>•</span>
                              <span>
                                {typeof group.subject === 'object' ? group.subject?.subjectName : group.subject}
                              </span>
                              <span>•</span>
                              <span className="font-medium">{group.students?.length || 0} студентов</span>
                            </div>
                          </button>
                        ))}
                      {groups.filter(group => 
                        group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
                        group.code.toLowerCase().includes(groupSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-16">
                          <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🔍</div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Группы не найдены</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Попробуйте изменить запрос</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student selection modal */}
      {showCreatePaymentModal && selectedGroup && !showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-black/30 dark:bg-black/50" 
              onClick={() => {
                setSelectedGroup(null);
                setShowCreatePaymentModal(false);
                setGroupSearch('');
              }}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700 relative z-10">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CurrencyDollarIcon className="h-6 w-6" />
                      Выберите студента
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Группа: {selectedGroup.name} ({selectedGroup.code})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGroup(null);
                      setShowCreatePaymentModal(false);
                      setGroupSearch('');
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 px-6 py-5">
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    ← Назад к выбору группы
                  </button>

                  {/* Students list */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {selectedGroup.students && selectedGroup.students.length > 0 ? (
                      selectedGroup.students.map(student => (
                        <button
                          key={student.studentId}
                          onClick={() => {
                            setSelectedStudent({ id: student.studentId, name: student.studentName });
                            setShowPaymentModal(true);
                          }}
                          className="w-full text-left px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 group"
                        >
                          <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                              {student.studentName.charAt(0).toUpperCase()}
                            </div>
                            {student.studentName}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👥</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">В группе нет студентов</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Добавьте студентов в группу</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showPaymentModal && selectedStudent && selectedGroup && (
        <CreatePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
            setSelectedGroup(null);
            setShowCreatePaymentModal(false);
            setGroupSearch('');
          }}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          groupPrice={selectedGroup.monthlyPrice}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
            setSelectedGroup(null);
            setShowCreatePaymentModal(false);
            setGroupSearch('');
            loadPaymentStats();
            loadPayments(currentPage);
          }}
        />
      )}
    </div>
  );
}