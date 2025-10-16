'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData, formatters } from '@/lib/schemas';
import { getLocalDateString, parseLocalDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Category, Transaction } from '@/models/financial';
import { TransactionCalendar } from './transaction-calendar';
import { TransactionTabs } from './transaction-tabs';
import { TransactionTypeButtons } from './transaction-type-buttons';
import { TransactionFormFields } from './transaction-form-fields';

interface AddTransactionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  onCreateTransaction: (transaction: any) => Promise<any>;
  onEditTransaction?: (transactionId: string, data: any) => Promise<any>;
  defaultType?: 'receita' | 'despesa';
  isFixed?: boolean;
  categories: Category[];
  userId: string;
  isLoading?: boolean;
  hasCouple?: boolean;
  editingTransaction?: Transaction | null;
}

export function AddTransactionPanel({
  isOpen,
  onClose,
  onTransactionAdded,
  onCreateTransaction,
  onEditTransaction,
  defaultType = 'despesa',
  isFixed = false,
  categories,
  userId,
  isLoading = false,
  hasCouple = false,
  editingTransaction = null,
}: AddTransactionPanelProps) {
  const [activeTab, setActiveTabInternal] = useState<'receita' | 'despesa'>(defaultType);

  const setActiveTab = useCallback((newTab: 'receita' | 'despesa') => {
    setActiveTabInternal(newTab);
  }, []);

  const [selectedTransactionType, setSelectedTransactionType] = useState<
    'simples' | 'parcela' | 'assinado'
  >('simples');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lastEditingTransactionId, setLastEditingTransactionId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [editingReady, setEditingReady] = useState(false);
  const [lockedType, setLockedType] = useState<'receita' | 'despesa' | null>(null);
  const effectiveTab = editingTransaction && lockedType ? lockedType : activeTab;

  const getDefaultCategoryId = () => {
    const semCategoria = categories.find(
      c => c.name === 'Sem Categoria' && c.type === effectiveTab && c.is_system === true
    );
    return semCategoria?.id || '';
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      valor: '',
      titulo: '',
      categoria: '',
      privacidade: hasCouple ? 'casal' : 'privado',
      special_type: 'simples',
      installments: 1,
      transaction_date: getLocalDateString(),
      descricao: '',
      metodo_pagamento: '',
      localizacao: '',
      tags: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) {
      setLastEditingTransactionId(null);
      setLockedType(null);
      setEditingReady(false);
      setActiveTab(defaultType);
      setSelectedTransactionType('simples');
      setSelectedDate(new Date());
      setCalendarDate(new Date());

      const defaultCategoryId = getDefaultCategoryId();
      reset({
        valor: '',
        titulo: '',
        categoria: defaultCategoryId || '',
        privacidade: hasCouple ? 'casal' : 'privado',
        special_type: 'simples',
        installments: 1,
        transaction_date: getLocalDateString(),
        descricao: '',
        metodo_pagamento: '',
        localizacao: '',
        tags: [],
      });
    }
  }, [isOpen, defaultType, hasCouple]);

  useEffect(() => {
    if (editingTransaction && editingTransaction.id !== lastEditingTransactionId) {
      if (editingTransaction.type === 'receita' || editingTransaction.type === 'despesa') {
        setLockedType(editingTransaction.type);
        if (activeTab !== editingTransaction.type) {
          setActiveTab(editingTransaction.type);
        }
      } else {
        setLockedType(defaultType);
        setActiveTab(defaultType);
      }
    }
  }, [editingTransaction?.id, lastEditingTransactionId, defaultType]);

  useEffect(() => {
    if (editingTransaction && categories.length > 0) {
      const tipoCorreto =
        editingTransaction.type === 'receita' || editingTransaction.type === 'despesa'
          ? editingTransaction.type === activeTab
          : true;

      if (!tipoCorreto) {
        return;
      }

      if (editingTransaction.id === lastEditingTransactionId) {
        return;
      }

      let categoriaValue =
        editingTransaction.category_id ||
        (editingTransaction as any).category?.id ||
        (typeof (editingTransaction as any).category === 'string'
          ? (editingTransaction as any).category
          : '');

      const categoryExists = !categoriaValue || categories.some(cat => cat.id === categoriaValue);

      if (categoryExists) {
        setLastEditingTransactionId(editingTransaction.id);

        const formData = {
          valor: editingTransaction.amount
            ? String(editingTransaction.amount).replace('.', ',')
            : '',
          titulo: editingTransaction.title || '',
          categoria: categoriaValue,
          privacidade: editingTransaction.privacy || (hasCouple ? 'casal' : 'privado'),
          special_type: 'simples' as const,
          installments: editingTransaction.installments || 1,
          transaction_date: editingTransaction.transaction_date
            ? editingTransaction.transaction_date.split('T')[0]
            : getLocalDateString(),
          descricao: editingTransaction.description || '',
          metodo_pagamento: editingTransaction.payment_method || '',
          localizacao: editingTransaction.location || '',
          tags: editingTransaction.tags || [],
        };

        reset(formData);

        setTimeout(() => {
          if (categoriaValue) {
            setValue('categoria', categoriaValue, { shouldValidate: false, shouldDirty: false });
          }
        }, 100);

        setTimeout(() => {
          if (categoriaValue) {
            setValue('categoria', categoriaValue, { shouldValidate: false, shouldDirty: false });
          }
        }, 250);

        setSelectedTransactionType('simples');
        if (editingTransaction.transaction_date) {
          const localDate = parseLocalDate(editingTransaction.transaction_date);
          setSelectedDate(localDate);
          setCalendarDate(localDate);
        }

        setTimeout(() => setEditingReady(true), 200);
      }
    } else if (!editingTransaction && lastEditingTransactionId !== null) {
      // Só reseta quando sai do modo de edição (tinha uma transação sendo editada)
      setLastEditingTransactionId(null);
      setEditingReady(false);
      const defaultCategoryId = getDefaultCategoryId();
      reset({
        valor: '',
        titulo: '',
        categoria: defaultCategoryId || '',
        privacidade: hasCouple ? 'casal' : 'privado',
        special_type: 'simples',
        installments: 1,
        transaction_date: getLocalDateString(),
        descricao: '',
        metodo_pagamento: '',
        localizacao: '',
        tags: [],
      });
      setSelectedTransactionType('simples');
      setSelectedDate(new Date());
      setCalendarDate(new Date());
    }
  }, [
    editingTransaction?.id,
    lastEditingTransactionId,
    hasCouple,
    reset,
    defaultType,
    categories,
    activeTab,
  ]);

  // Atualiza apenas a categoria quando muda de tab (mantém todos os outros campos)
  useEffect(() => {
    if (!editingTransaction && categories.length > 0) {
      const currentCategory = getValues('categoria');
      const categoryExists = categories.some(
        cat => cat.id === currentCategory && cat.type === effectiveTab
      );

      // Se a categoria atual não é compatível com o tipo selecionado, troca para a padrão
      if (!categoryExists) {
        const defaultCategoryId = getDefaultCategoryId();
        setValue('categoria', defaultCategoryId || '');
        trigger('categoria');
      }
    }
  }, [activeTab, editingTransaction, setValue, trigger, categories, effectiveTab, getValues]);

  const handleClose = () => {
    const defaultCategoryId = getDefaultCategoryId();
    reset({
      valor: '',
      titulo: '',
      categoria: defaultCategoryId || '',
      privacidade: hasCouple ? 'casal' : 'privado',
      special_type: 'simples',
      installments: 1,
      transaction_date: getLocalDateString(),
      descricao: '',
      metodo_pagamento: '',
      localizacao: '',
      tags: [],
    });

    setLastEditingTransactionId(null);
    setLockedType(null);
    setEditingReady(false);
    setActiveTab(defaultType);
    setSelectedTransactionType('simples');
    setSelectedDate(new Date());
    setCalendarDate(new Date());

    onClose();
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const transactionData = {
        title: data.titulo,
        amount: formatters.parseCurrency(data.valor),
        type: effectiveTab,
        privacy: data.privacidade,
        category_id: data.categoria,
        account_id: null,
        transaction_date: data.transaction_date || getLocalDateString(selectedDate),
        description: data.descricao,
        payment_method: data.metodo_pagamento,
        location: data.localizacao,
        tags: data.tags,
        special_type: data.special_type || 'simples',
        installments: data.installments,
        recurring_frequency: data.recurring_frequency,
      };

      if (editingTransaction) {
        if (!onEditTransaction) {
          throw new Error('Função de edição não disponível');
        }
        await onEditTransaction(editingTransaction.id, transactionData);
      } else {
        await onCreateTransaction(transactionData);
      }

      onTransactionAdded();

      if (isFixed) {
        const defaultCategoryId = getDefaultCategoryId();
        reset({
          valor: '',
          titulo: '',
          categoria: defaultCategoryId || '',
          privacidade: hasCouple ? 'casal' : 'privado',
          special_type: 'simples',
          installments: 1,
          transaction_date: getLocalDateString(),
          descricao: '',
          metodo_pagamento: '',
          localizacao: '',
          tags: [],
        });
        setLastEditingTransactionId(null);
        setLockedType(null);
        setEditingReady(false);
        setActiveTab(defaultType);
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat: Category) => cat.type === effectiveTab);
  }, [categories, effectiveTab]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setValue('transaction_date', getLocalDateString(date));

    if (watch('special_type') === 'assinado') {
      setValue('transaction_date', getLocalDateString(date));
    }
  };

  const handleTransactionTypeChange = (type: 'simples' | 'parcela' | 'assinado') => {
    if (editingTransaction && type !== 'simples') {
      return;
    }

    setSelectedTransactionType(type);
    setValue('special_type', type);
    if (type === 'assinado') {
      setValue('transaction_date', getLocalDateString(selectedDate));
    }
  };

  if (!isFixed && !isOpen) return null;

  const containerClasses = isFixed
    ? `fixed top-18 right-0 bottom-0 w-80 min-w-80 max-w-80 transition-all duration-150 border-l-2 hidden lg:block ${editingTransaction
      ? 'ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-500/20 z-40 bg-white dark:bg-slate-800 border-emerald-500'
      : 'z-30 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-xl'
    }`
    : 'lg:hidden fixed inset-0 z-[9999] bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-150';

  const contentClasses = isFixed
    ? 'h-full flex flex-col overflow-hidden'
    : 'h-full w-full overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]';

  return (
    <div ref={panelRef} className={containerClasses}>
      <div className={`${contentClasses} flex flex-col`}>
        <div
          className={`flex items-center justify-between p-3 lg:p-2.5 border-b transition-all duration-150 relative z-30 flex-shrink-0 ${editingTransaction && isFixed
            ? 'border-emerald-200 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/50 backdrop-blur-md'
            : 'border-slate-200 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md'
            }`}
        >
          <div className="flex items-center gap-2 relative z-40">
            <div
              className={`w-1 h-5 rounded-full ${editingTransaction ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600'}`}
            />
            <div>
              <h2 className="text-sm lg:text-xs font-bold text-slate-900 dark:text-slate-50 tracking-tight transition-colors duration-150">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              {editingTransaction && isFixed && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-0.5 transition-colors duration-150">
                  <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                  Editando
                </div>
              )}
            </div>
          </div>

          {!isFixed && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg transition-all duration-150 relative z-40 cursor-pointer group"
              title="Fechar"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:rotate-90 transition-all duration-150" />
            </button>
          )}
          {isFixed && editingTransaction && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-all duration-150 relative z-40 cursor-pointer group"
              title="Cancelar edição"
            >
              <X className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:rotate-90 transition-all duration-150" />
            </button>
          )}
        </div>

        <div className="flex-shrink-0">
          <TransactionCalendar
            selectedDate={selectedDate}
            calendarDate={calendarDate}
            onDateSelect={selectDate}
            onMonthNavigate={navigateMonth}
          />
        </div>

        <div className="flex-shrink-0">
          <TransactionTabs
            activeTab={effectiveTab}
            onTabChange={setActiveTab}
            disabled={!!editingTransaction}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 lg:p-3 pb-20 lg:pb-8 space-y-3 lg:space-y-3 w-full overflow-x-hidden"
          >
            <div>
              <TransactionFormFields
                control={control}
                errors={errors}
                filteredCategories={filteredCategories}
                allCategories={categories}
                selectedTransactionType={selectedTransactionType}
                hasCouple={hasCouple}
              />
            </div>

            <div>
              <TransactionTypeButtons
                selectedType={watch('special_type') || selectedTransactionType}
                onTypeChange={handleTransactionTypeChange}
                isEditing={!!editingTransaction}
                transactionCategory={effectiveTab}
              />
            </div>

            <div className="mt-6 lg:mt-4 pt-4 lg:pt-3 border-t border-slate-300/30 dark:border-slate-700/30 transition-colors duration-150">
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className={`w-full py-3.5 lg:py-3 px-4 rounded-lg font-bold text-base lg:text-sm text-white transition-all duration-150 shadow-lg relative overflow-hidden group ${effectiveTab === 'despesa'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-rose-400 disabled:to-rose-500 hover:shadow-xl hover:shadow-rose-500/40'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/40'
                  } disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] hover:scale-[1.01]`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      SALVANDO...
                    </>
                  ) : editingTransaction ? (
                    <>SALVAR ALTERAÇÕES</>
                  ) : (
                    <>ADICIONAR {effectiveTab.toUpperCase()}</>
                  )}
                </span>
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
