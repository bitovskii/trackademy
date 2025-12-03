'use client';

import { useState, useMemo } from 'react';
import { XMarkIcon, CurrencyDollarIcon, UserIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Payment } from '../types/Payment';
import { PaymentApiService } from '../services/PaymentApiService';
import { useApiToast } from '../hooks/useApiToast';
import { RefundModal } from './RefundModal';

interface StudentPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  payments?: Payment[];
  onPaymentUpdate?: () => void; // Колбэк для обновления списка платежей
}

export const StudentPaymentsModal: React.FC<StudentPaymentsModalProps> = ({
  isOpen,
  onClose,
  studentName,
  payments,
  onPaymentUpdate
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;
  const { handleApiOperation } = useApiToast();
  
  // Обработанные платежи с вычисленными остатками
  const processedPayments = useMemo(() => {
    return payments?.map(payment => PaymentApiService.processPaymentWithRefunds(payment)) || [];
  }, [payments]);
  
  // Состояния для диалогов
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'paid' | 'cancel';
    paymentId: string;
    paymentPeriod: string;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояния для новой модальной системы возврата
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<Payment | null>(null);

  // Пагинация
  const { paginatedPayments, totalPages } = useMemo(() => {
    const safePayments = processedPayments || [];
    const startIndex = (currentPage - 1) * paymentsPerPage;
    const endIndex = startIndex + paymentsPerPage;
    const paginatedPayments = safePayments.slice(startIndex, endIndex);
    const totalPages = Math.ceil(safePayments.length / paymentsPerPage);
    
    return { paginatedPayments, totalPages };
  }, [processedPayments, currentPage, paymentsPerPage]);

  // Статистика платежей
  const stats = useMemo(() => {
    const safePayments = processedPayments || [];
    const total = safePayments.length;
    const paid = safePayments.filter(p => p.status === 2).length;
    const pending = safePayments.filter(p => p.status === 1).length;
    const overdue = safePayments.filter(p => p.status === 3).length;
    const cancelled = safePayments.filter(p => p.status === 4).length;
    const refunded = safePayments.filter(p => p.status === 5).length;
    const partiallyRefunded = safePayments.filter(p => p.status === 6).length;
    
    // Исправленный расчет сумм с учетом частичных возвратов
    const totalAmount = safePayments.reduce((sum, p) => {
      // Для частичных возвратов используем оставшуюся сумму, иначе полную сумму
      const effectiveAmount = p.status === 6 && p.remainingAmount !== undefined 
        ? p.remainingAmount 
        : p.amount;
      return sum + effectiveAmount;
    }, 0);
    
    const paidAmount = safePayments.filter(p => p.status === 2).reduce((sum, p) => {
      const effectiveAmount = p.status === 6 && p.remainingAmount !== undefined 
        ? p.remainingAmount 
        : p.amount;
      return sum + effectiveAmount;
    }, 0);
    
    const pendingAmount = safePayments.filter(p => p.status === 1).reduce((sum, p) => {
      const effectiveAmount = p.status === 6 && p.remainingAmount !== undefined 
        ? p.remainingAmount 
        : p.amount;
      return sum + effectiveAmount;
    }, 0);
    
    const overdueAmount = safePayments.filter(p => p.status === 3).reduce((sum, p) => {
      const effectiveAmount = p.status === 6 && p.remainingAmount !== undefined 
        ? p.remainingAmount 
        : p.amount;
      return sum + effectiveAmount;
    }, 0);

    // Расчет сумм возвратов
    const refundedAmount = safePayments.filter(p => p.status === 5).reduce((sum, p) => sum + p.amount, 0);
    const partiallyRefundedAmount = safePayments.filter(p => p.status === 6).reduce((sum, p) => sum + (p.totalRefundedAmount || 0), 0);

    return { 
      total, 
      paid, 
      pending, 
      overdue, 
      cancelled, 
      refunded,
      partiallyRefunded, 
      totalAmount, 
      paidAmount, 
      pendingAmount, 
      overdueAmount,
      refundedAmount,
      partiallyRefundedAmount
    };
  }, [processedPayments]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 2: return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 3: return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 4: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      case 5: return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 6: return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Функции для обработки действий с платежами
  const handleMarkAsPaid = (paymentId: string, paymentPeriod: string) => {
    setConfirmAction({ type: 'paid', paymentId, paymentPeriod });
    setShowConfirmDialog(true);
  };

  const handleCancel = (paymentId: string, paymentPeriod: string) => {
    setConfirmAction({ type: 'cancel', paymentId, paymentPeriod });
    setShowConfirmDialog(true);
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPaymentForRefund(payment);
    setShowRefundModal(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    console.log('Executing action:', confirmAction.type, 'for payment:', confirmAction.paymentId);
    setIsLoading(true);
    
    try {
      switch (confirmAction.type) {
        case 'paid':
          console.log('Marking payment as paid...');
          await handleApiOperation(
            () => PaymentApiService.markAsPaid(confirmAction.paymentId, new Date().toISOString()),
            { successMessage: 'Платеж отмечен как оплаченный' }
          );
          break;
        
        case 'cancel':
          if (!reason.trim()) {
            alert('Укажите причину отмены');
            return;
          }
          console.log('Cancelling payment with reason:', reason);
          await handleApiOperation(
            () => PaymentApiService.cancelPayment(confirmAction.paymentId, reason),
            { successMessage: 'Платеж отменен' }
          );
          break;
        

      }

      // Если мы дошли до этой точки, значит операция прошла успешно
      console.log('Operation completed successfully, updating data and closing modal...');
      
      // Обновляем родительский компонент
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
      // Закрываем диалог подтверждения
      setShowConfirmDialog(false);
      setConfirmAction(null);
      setReason('');
      
      // Закрываем основное модальное окно
      onClose();
      
    } catch (error) {
      console.error('Error executing payment action:', error);
      // При ошибке НЕ закрываем диалог, чтобы пользователь мог попробовать снова
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDialog = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setReason('');
  };

  // Проверяем можно ли выполнить действие для платежа
  const canMarkAsPaid = (status: number) => status === 1 || status === 3; // Ожидает оплаты или просрочен
  const canCancel = (status: number) => status === 1 || status === 3; // Ожидает оплаты или просрочен  
  const canRefund = (payment: Payment) => {
    // Можно вернуть если оплачен или частично возвращен
    if (payment.status !== 2 && payment.status !== 6) return false;
    
    // Для частично возвращенных проверяем остаток
    if (payment.status === 6) {
      return (payment.remainingAmount || 0) > 0;
    }
    
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Платежи студента
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {studentName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6 bg-gray-50/50 dark:bg-gray-700/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Всего платежей</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatAmount(stats.totalAmount)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Оплачено</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{formatAmount(stats.paidAmount)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ожидает</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">{formatAmount(stats.pendingAmount)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Просрочено</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{formatAmount(stats.overdueAmount)}</div>
            </div>
          </div>
          
          {/* Дополнительная статистика */}
          {(stats.cancelled > 0 || stats.refunded > 0 || stats.partiallyRefunded > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {stats.cancelled > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xl font-bold text-gray-600">{stats.cancelled}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Отменено</div>
                </div>
              )}
              {stats.refunded > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xl font-bold text-purple-600">{stats.refunded}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Полный возврат</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {formatAmount(stats.refundedAmount || 0)}
                  </div>
                </div>
              )}
              {stats.partiallyRefunded > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xl font-bold text-indigo-600">{stats.partiallyRefunded}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Частичный возврат</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {formatAmount(stats.partiallyRefundedAmount || 0)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payments Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              История платежей
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto px-6">
            <div className="min-w-full">
            <table className="w-full table-auto min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                    Платеж
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
                    Сумма / Статус
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
                    Даты
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Колонка: Платеж (период, группа, тип) */}
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.paymentPeriod}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {payment.groupName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.typeName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                        </div>
                      </div>
                    </td>
                    
                    {/* Колонка: Сумма и Статус */}
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {/* Основная сумма - для частичного возврата показываем оставшуюся сумму */}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.status === 6 && payment.remainingAmount !== undefined 
                            ? formatAmount(payment.remainingAmount)
                            : formatAmount(payment.amount)
                          }
                        </div>
                        
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.statusName}
                        </span>
                        
                        {/* Информация о частичном возврате */}
                        {payment.status === 6 && payment.refunds && payment.refunds.length > 0 && (
                          <div className="text-xs space-y-1 bg-purple-50 dark:bg-purple-900/20 p-2 rounded border-l-2 border-purple-300 dark:border-purple-600">
                            <div className="text-gray-700 dark:text-gray-300 font-medium">
                              Изначально: {formatAmount(payment.amount)}
                            </div>
                            <div className="text-purple-600 dark:text-purple-400">
                              Возвращено: {formatAmount(payment.totalRefundedAmount || 0)}
                            </div>
                          </div>
                        )}
                        
                        {/* Информация о полном возврате */}
                        {payment.status === 5 && payment.refunds && payment.refunds.length > 0 && (
                          <div className="text-xs space-y-1 bg-purple-50 dark:bg-purple-900/20 p-2 rounded border-l-2 border-purple-300 dark:border-purple-600">
                            <div className="text-purple-600 dark:text-purple-400 font-medium">
                              Полный возврат:
                            </div>
                            <div className="text-purple-600 dark:text-purple-400">
                              Возвращено: {formatAmount(payment.totalRefundedAmount || 0)}
                            </div>
                          </div>
                        )}
                        
                        {/* Информация о скидке */}
                        {payment.discountValue > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Скидка: {payment.discountType === 1 
                              ? `${payment.discountValue}%` 
                              : formatAmount(payment.discountValue)}
                            {payment.originalAmount && payment.originalAmount !== payment.amount && (
                              <span> (было {formatAmount(payment.originalAmount)})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Колонка: Даты */}
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div className="font-medium">Создано:</div>
                          <div>{formatDate(payment.createdAt)}</div>
                        </div>
                        {payment.paidAt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div className="font-medium">Оплачено:</div>
                            <div>{formatDate(payment.paidAt)}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Колонка: Действия */}
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {canMarkAsPaid(payment.status) && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id, payment.paymentPeriod)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                            title="Отметить как оплаченный"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {canCancel(payment.status) && (
                          <button
                            onClick={() => handleCancel(payment.id, payment.paymentPeriod)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                            title="Отменить платеж"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {canRefund(payment) && (
                          <button
                            onClick={() => handleRefund(payment)}
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors"
                            title="Сделать возврат"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Показано {(currentPage - 1) * paymentsPerPage + 1}-{Math.min(currentPage * paymentsPerPage, (payments || []).length)} из {(payments || []).length} платежей
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Назад
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    {currentPage} из {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Диалог подтверждения */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {confirmAction.type === 'paid' && 'Подтвердить оплату'}
              {confirmAction.type === 'cancel' && 'Отменить платеж'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {confirmAction.type === 'paid' && `Отметить платеж "${confirmAction.paymentPeriod}" как оплаченный?`}
              {confirmAction.type === 'cancel' && `Отменить платеж "${confirmAction.paymentPeriod}"?`}
            </p>

            {(confirmAction.type === 'cancel') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {confirmAction.type === 'cancel' ? 'Причина отмены:' : 'Причина:'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={confirmAction.type === 'cancel' ? 'Укажите причину отмены...' : 'Укажите причину...'}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDialog}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={executeAction}
                disabled={isLoading || (confirmAction.type === 'cancel' && !reason.trim())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Выполняется...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Новая модальная система возврата */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedPaymentForRefund(null);
        }}
        payment={selectedPaymentForRefund ? {
          id: selectedPaymentForRefund.id,
          paymentPeriod: selectedPaymentForRefund.paymentPeriod,
          amount: selectedPaymentForRefund.amount,
          remainingAmount: selectedPaymentForRefund.remainingAmount
        } : undefined}
        onSuccess={() => {
          if (onPaymentUpdate) {
            onPaymentUpdate();
          }
        }}
      />
    </div>
  );
};