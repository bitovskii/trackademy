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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { PaymentStats, StudentPaymentGroup, PaymentFilters } from '../../types/Payment';
import { PaymentApiService } from '../../services/PaymentApiService';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { StudentPaymentsModal } from '../../components/StudentPaymentsModal';
import { ColumnVisibilityControl, ColumnConfig } from '../../components/ui/ColumnVisibilityControl';

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
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

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
  const loadPayments = useCallback(async (page: number = currentPage) => {
    if (!isAuthenticated || !user?.organizationId) {
      return;
    }

    setLoadingPayments(true);
    
    try {
      const paymentFilters: PaymentFilters = {
        organizationId: user.organizationId!,
        page,
        pageSize,
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
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {columnVisibility.number && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              №
                            </th>
                          )}
                          {columnVisibility.student && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Студент
                            </th>
                          )}
                          {columnVisibility.lastPeriod && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Последний период
                            </th>
                          )}
                          {columnVisibility.lastType && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Тип
                            </th>
                          )}
                          {columnVisibility.lastAmount && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Сумма
                            </th>
                          )}
                          {columnVisibility.status && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Статус
                            </th>
                          )}
                          {columnVisibility.paymentsCount && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Всего платежей
                            </th>
                          )}
                          {columnVisibility.lastCreated && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Создано
                            </th>
                          )}
                          {columnVisibility.lastPaid && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {(currentPage - 1) * pageSize + index + 1}
                                </span>
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
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Показано {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} из {totalCount}
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
    </div>
  );
}