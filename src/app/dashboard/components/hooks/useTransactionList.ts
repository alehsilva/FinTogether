import { useState, useRef, useEffect } from 'react';
import type { Transaction } from '@/models/financial';
import { useScrollLock } from '@/hooks/useScrollLock';

interface UseTransactionListProps {
  transactions: Transaction[];
  updateTransactionStatus: (params: { transactionId: string; status: string }) => Promise<any>;
  onTransactionUpdate?: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string, deleteOption?: 'single' | 'all') => Promise<any>;
  isMaximized?: boolean;
  onMaximizedChange?: (isMaximized: boolean) => void;
}

export function useTransactionList({
  transactions,
  updateTransactionStatus,
  onTransactionUpdate,
  onEditTransaction,
  onDeleteTransaction,
  isMaximized: externalIsMaximized,
  onMaximizedChange,
}: UseTransactionListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'receita' | 'despesa'>('all');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState<Set<string>>(new Set());
  const [swipedTransaction, setSwipedTransaction] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchCurrent, setTouchCurrent] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [internalIsMaximized, setInternalIsMaximized] = useState(false);
  const isMaximized = externalIsMaximized !== undefined ? externalIsMaximized : internalIsMaximized;

  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    option?: 'single' | 'all';
  } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMaximizedStateRef = useRef(isMaximized);

  // Detectar se é mobile e aplicar scroll lock quando necessário
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Aplicar scroll lock e scroll para o topo quando maximizado no mobile
  useScrollLock(isMaximized && isMobile, true);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    lastMaximizedStateRef.current = isMaximized;
  }, [isMaximized]);

  const toggleMaximized = () => {
    const newValue = !isMaximized;

    if (onMaximizedChange) {
      onMaximizedChange(newValue);
    } else {
      setInternalIsMaximized(newValue);
    }
  };

  const handleToggleStatus = async (transactionId: string, currentStatus: string) => {
    if (loadingTransactions.has(transactionId)) return;
    setLoadingTransactions(prev => new Set(prev).add(transactionId));
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await updateTransactionStatus({ transactionId, status: newStatus as any });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoadingTransactions(prev => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent, transactionId: string) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (transactionId: string) => {
    const distance = touchStart - touchCurrent;
    const threshold = 50;

    if (distance > threshold) {
      setSwipedTransaction(transactionId);
    } else if (distance < -threshold && swipedTransaction === transactionId) {
      setSwipedTransaction(null);
    }
  };

  const handleEdit = (transactionId: string) => {
    if (!onEditTransaction) return;

    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    onEditTransaction(transaction);
    setSwipedTransaction(null);
  };

  const handleDelete = async (transactionId: string, deleteOption?: 'single' | 'all') => {
    if (!onDeleteTransaction) return;

    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (!deleteOption) {
      if (
        transaction.special_type === 'assinado' ||
        (transaction.installments && transaction.installments > 1)
      ) {
        setTransactionToDelete(transaction);
        setShowDeleteModal(true);
        setSwipedTransaction(null);
        return;
      }

      if (!confirm(`Tem certeza que deseja excluir "${transaction.title}"?`)) {
        setSwipedTransaction(null);
        return;
      }
    }

    setPendingDelete({ id: transactionId, option: deleteOption });
    setShowUndoToast(true);
    setSwipedTransaction(null);

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    deleteTimerRef.current = setTimeout(async () => {
      setPendingDelete(current => {
        if (current?.id === transactionId) {
          executeDelete(transactionId, deleteOption);
          setShowUndoToast(false);
          return null;
        }
        return current;
      });
    }, 3000);
  };

  const executeDelete = async (transactionId: string, deleteOption?: 'single' | 'all') => {
    if (!onDeleteTransaction) return;

    try {
      setLoadingTransactions(prev => new Set(prev).add(transactionId));
      await onDeleteTransaction(transactionId, deleteOption);
      onTransactionUpdate?.();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    } finally {
      setLoadingTransactions(prev => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const handleUndoDelete = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    setPendingDelete(null);
    setShowUndoToast(false);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleDeleteModalConfirm = async (option: 'single' | 'all') => {
    if (!transactionToDelete) return;

    setShowDeleteModal(false);
    await handleDelete(transactionToDelete.id, option);
    setTransactionToDelete(null);
  };

  const handleDeleteModalCancel = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSearchInput(false);
      setSearchInput('');
      setSearchTerm('');
    }
  };

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchInput('');
      setSearchTerm('');
    }
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const typeFilterResult = typeFilter === 'all' ? true : transaction.type === typeFilter;
    const searchFilter =
      searchTerm === ''
        ? true
        : transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount.toString().includes(searchTerm);

    return typeFilterResult && searchFilter;
  });

  return {
    searchInput,
    setSearchInput,
    searchTerm,
    typeFilter,
    setTypeFilter,
    showSearchInput,
    loadingTransactions,
    swipedTransaction,
    setSwipedTransaction,
    showDeleteModal,
    transactionToDelete,
    isMaximized,
    pendingDelete,
    showUndoToast,
    filteredTransactions,
    toggleMaximized,
    handleToggleStatus,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleEdit,
    handleDelete,
    handleUndoDelete,
    handleDeleteModalConfirm,
    handleDeleteModalCancel,
    handleSearch,
    handleKeyPress,
    toggleSearch,
  };
}
