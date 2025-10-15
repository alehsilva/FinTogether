'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { TransactionService } from '@/services/transactionService'
import { TransactionTypeService } from '@/services/transactionTypeService'
import { CategoryService } from '@/services/categoryService'
import { userService } from '@/services/user-service'
import { createClient } from '@/lib/supabase/client'
import { parseLocalDate } from '@/lib/utils'
import type {
  Transaction,
  TransactionForm,
  FinancialSummary,
  Category,
  TransactionFilters
} from '@/models/financial'
import type { AuthUser } from '@/models/auth'

// Cache global para dados do usuário e casal
const globalCache = {
  couples: new Map<string, any>(),
  users: new Map<string, any>()
}

// HOOK ÚNICO QUE CONTROLA TODA A APLICAÇÃO
export function useCentralizedApp() {
  const [selectedView, setSelectedView] = useState<'nosso' | 'meu'>('meu')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
    return months[new Date().getMonth()]
  })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  // Forçar atualização dos componentes após refetch
  const [updateCounter, setUpdateCounter] = useState(0)

  const queryClient = useQueryClient()
  const supabase = createClient()

  // AUTH com useState/useEffect (contornando bug do React Query)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        setAuthLoading(true)
        setAuthError(null)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!session?.user) {
          globalCache.couples.clear()
          globalCache.users.clear()
          setUser(null)
          return
        }

        const baseUser = session.user
        const email = baseUser.email!

        // Cache de casal
        let couple = globalCache.couples.get(email)
        if (!couple) {
          const { data, error } = await supabase
            .from('couples')
            .select('*')
            .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
            .eq('status', 'active')
            .maybeSingle()

          if (error) {
            console.error('Erro ao buscar casal:', error.message)
          }

          couple = data
          globalCache.couples.set(email, couple || null)
        }

        const authUser = {
          ...baseUser,
          coupleId: couple?.id || null,
          partnerEmail: couple ? (couple.partner_1_email === email ? couple.partner_2_email : couple.partner_1_email) : null,
          coupleName: couple?.name || null,
          isUser1: couple ? couple.partner_1_email === email : false,
          sharedBudgetEnabled: couple?.shared_budget_enabled || false
        } as AuthUser

        setUser(authUser)

        // Se tem casal ativo, definir view padrão como "nosso"
        if (couple?.id) {
          setSelectedView('nosso')
        }
      } catch (err) {
        setAuthError(err as Error)
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    fetchAuth()
  }, [])

  // QUERY PARA CATEGORIAS (cache longo - raramente mudam)
  const { data: userCategories } = useQuery({
    queryKey: ['categories', user?.id, user?.coupleId],
    queryFn: async () => {
      if (!user?.id) return []
      return CategoryService.getCategories(user.id)
    },
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000, // 15 minutos - categorias mudam pouco
    gcTime: 60 * 60 * 1000,    // 1 hora
  })

  // Combinar categorias default com categorias do usuário (evitando duplicatas)
  const categories = useMemo(() => {
    // Usar apenas as categorias do banco de dados
    return userCategories || [];
  }, [userCategories])

  // Função para obter categoria "Sem Categoria" por tipo
  const getDefaultCategory = useCallback((type: 'receita' | 'despesa') => {
    return categories.find(cat => cat.name === 'Sem Categoria' && cat.type === type && cat.is_system === true)
  }, [categories])

  // QUERY PRINCIPAL: BUSCAR APENAS TRANSAÇÕES
  const {
    data: appData,
    isLoading: dataLoading,
    refetch,
    error: dataError
  } = useQuery({
    queryKey: ['transactions', user?.id, user?.coupleId, selectedMonth, selectedYear, selectedView],
    queryFn: async () => {
      if (!user?.id) return null

      // Mapear a view para o formato que o serviço espera
      const viewMapping: Record<'meu' | 'nosso', 'ele' | 'casal'> = {
        'meu': 'ele',
        'nosso': 'casal'
      }

      const serviceView = viewMapping[selectedView]

      // Buscar apenas transações com o filtro de view correto
      const transactionsResult = await TransactionService.getTransactions(
        user.id,
        {},
        1,
        50,
        serviceView
      )

      return {
        transactions: transactionsResult.transactions || [],
        totalPages: transactionsResult.totalPages || 1,
        totalCount: transactionsResult.total || 0
      }
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
  })

  // MUTATION: CRIAR TRANSAÇÃO (usando TransactionTypeService para suportar todos os tipos)
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: TransactionForm) => {
      if (!user?.id) throw new Error('Usuário não encontrado')
      return TransactionTypeService.createTypedTransaction(user.id, transaction)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  // MUTATION: ATUALIZAR STATUS DA TRANSAÇÃO
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'completed' | 'pending' | 'cancelled' }) => {
      if (!user?.id) throw new Error('Usuário não encontrado')
      return TransactionService.updateTransaction(id, user.id, { status } as any)
    },
    onSuccess: () => {
      // Forçar invalidação do cache após update de status
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  // MUTATION: EDITAR TRANSAÇÃO COMPLETA
  const editTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!user?.id) throw new Error('Usuário não encontrado')
      return TransactionService.updateTransaction(id, user.id, data)
    },
    onSuccess: () => {
      // Forçar invalidação do cache após edição
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  // MUTATION: DELETAR TRANSAÇÃO
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuário não encontrado')
      return TransactionService.deleteTransaction(id, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })



  // Processar dados com base na view selecionada
  const processedData = useMemo(() => {
    if (!appData || !user) {
      return {
        transactions: [],
        categories: [],
        summary: null,
        totalSummary: null
      }
    }

    // Filtrar transações baseado na visão selecionada
    const filteredTransactions = appData.transactions.filter((tx: Transaction) => {
      if (selectedView === 'nosso') {
        // Visão NOSSO: apenas transações do casal
        return tx.privacy === 'casal'
      } else {
        // Visão MEU: minhas transações (privadas + as do casal que EU criei)
        return tx.user_id === user.id
      }
    })

    // Função para converter mês string para número
    const monthToNumber = (month: string) => {
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
      return months.indexOf(month)
    }

    // Filtrar transações do mês selecionado para saldo disponível
    const selectedMonthNumber = monthToNumber(selectedMonth)

    const monthFilteredTransactions = filteredTransactions.filter((tx: Transaction) => {
      const txDate = parseLocalDate(tx.transaction_date)
      return txDate.getMonth() === selectedMonthNumber && txDate.getFullYear() === selectedYear
    })



    // Calcular resumo financeiro client-side
    let income = 0
    let expenses = 0
    let projectedIncome = 0
    let projectedExpenses = 0

    // Para saldo disponível: usar transações completed ATÉ o mês selecionado (acumulativo)
    filteredTransactions.forEach((tx: Transaction) => {
      if (tx.type === 'transferencia') return

      const txDate = parseLocalDate(tx.transaction_date)
      const txMonthNumber = txDate.getMonth()
      const txYear = txDate.getFullYear()

      // Incluir no saldo disponível se for ATÉ o mês selecionado no mesmo ano
      // ou de anos anteriores
      const isUpToSelectedMonth = (txYear < selectedYear) ||
        (txYear === selectedYear && txMonthNumber <= selectedMonthNumber)

      if (!isUpToSelectedMonth) return

      const amount = Number(tx.amount) || 0

      // Saldo disponível (apenas completed até o mês selecionado)
      if (tx.status === 'completed') {
        if (tx.type === 'receita') income += amount
        else if (tx.type === 'despesa') expenses += amount
      }
    })

    // Para saldo previsto: usar transações ATÉ o mês selecionado (acumulativo histórico)
    filteredTransactions.forEach((tx: Transaction) => {
      if (tx.type === 'transferencia') return

      const txDate = parseLocalDate(tx.transaction_date)
      const txMonthNumber = txDate.getMonth()
      const txYear = txDate.getFullYear()

      // Incluir no saldo projetado se for ATÉ o mês selecionado no mesmo ano
      // ou de anos anteriores
      const isUpToSelectedMonth = (txYear < selectedYear) ||
        (txYear === selectedYear && txMonthNumber <= selectedMonthNumber)

      if (!isUpToSelectedMonth) return

      const amount = Number(tx.amount) || 0

      // Saldo previsto (completed + pending até o mês selecionado)
      if (tx.status === 'completed' || tx.status === 'pending') {
        if (tx.type === 'receita') projectedIncome += amount
        else if (tx.type === 'despesa') projectedExpenses += amount
      }
    })

    const balance = income - expenses
    const projectedBalance = projectedIncome - projectedExpenses

    const summary: FinancialSummary = {
      individual_balance: selectedView === 'meu' ? balance : 0,
      individual_income: selectedView === 'meu' ? income : 0,
      individual_expenses: selectedView === 'meu' ? expenses : 0,
      couple_balance: selectedView === 'nosso' ? balance : 0,
      couple_income: selectedView === 'nosso' ? income : 0,
      couple_expenses: selectedView === 'nosso' ? expenses : 0,
      total_balance: balance,
      total_income: income,
      total_expenses: expenses,
      user1_balance: balance,
      user1_income: income,
      user1_expenses: expenses,
      user2_balance: 0,
      user2_income: 0,
      user2_expenses: 0,
      transactions_count: filteredTransactions.length,
      goals_count: 0,
      active_budgets_count: 0,
      month: (new Date().getMonth() + 1).toString(),
      year: new Date().getFullYear(),
      period: selectedMonth,
      // Novos campos para saldo previsto
      projected_balance: projectedBalance,
      projected_income: projectedIncome,
      projected_expenses: projectedExpenses,
      individual_projected_balance: selectedView === 'meu' ? projectedBalance : 0,
      individual_projected_income: selectedView === 'meu' ? projectedIncome : 0,
      individual_projected_expenses: selectedView === 'meu' ? projectedExpenses : 0,
      couple_projected_balance: selectedView === 'nosso' ? projectedBalance : 0,
      couple_projected_income: selectedView === 'nosso' ? projectedIncome : 0,
      couple_projected_expenses: selectedView === 'nosso' ? projectedExpenses : 0
    }

    return {
      transactions: monthFilteredTransactions,
      categories: categories || [],
      summary,
      totalSummary: summary // Por simplicidade, usando o mesmo
    }
  }, [appData, selectedView, user, updateCounter])

  // CALLBACKS
  const handleViewChange = useCallback((view: 'nosso' | 'meu') => {
    // Se não há casal, sempre manter 'meu'
    if (!user?.coupleId) {
      setSelectedView('meu')
    } else {
      setSelectedView(view)
    }
  }, [user?.coupleId])

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month)
  }, [])

  const handleCreateTransaction = useCallback(async (transaction: TransactionForm) => {
    return createTransactionMutation.mutateAsync(transaction)
  }, [createTransactionMutation])

  const handleUpdateTransaction = useCallback(async (params: { transactionId: string; status: string }) => {
    return updateTransactionMutation.mutateAsync({
      id: params.transactionId,
      status: params.status as 'completed' | 'pending' | 'cancelled'
    })
  }, [updateTransactionMutation])

  const handleEditTransaction = useCallback(async (transactionId: string, data: any) => {
    return editTransactionMutation.mutateAsync({
      id: transactionId,
      data
    })
  }, [editTransactionMutation])

  const handleDeleteTransaction = useCallback(async (id: string, deleteOption?: 'single' | 'all') => {
    if (deleteOption) {
      // Se veio com opção, usar o serviço especial
      const { TransactionTypeService } = await import('@/services/transactionTypeService')
      return TransactionTypeService.deleteTransactionWithOptions(user?.id || '', id, deleteOption)
    } else {
      // Deletar normal
      return deleteTransactionMutation.mutateAsync(id)
    }
  }, [deleteTransactionMutation, user?.id])

  const handleRefresh = useCallback(async () => {
    // Invalidar cache primeiro
    await queryClient.invalidateQueries({ queryKey: ['transactions'] })
    // Forçar refetch
    await refetch({ cancelRefetch: false })
    // Incrementar contador para forçar re-render
    setUpdateCounter((c) => c + 1)
  }, [refetch, queryClient])

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // Limpar caches globais
      globalCache.couples.clear()
      globalCache.users.clear()
      // Limpar React Query
      queryClient.clear()
      // Redirecionar para login
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }, [supabase.auth, queryClient])

  // Limpar queries quando o usuário fizer logout
  useEffect(() => {
    if (!user) {
      queryClient.clear()
    }
  }, [user, queryClient])

  return {
    // Estado
    user,
    loading: authLoading || dataLoading,
    selectedView: user?.coupleId ? selectedView : 'meu', // Forçar 'meu' se não há casal
    selectedMonth,
    selectedYear,
    hasCouple: !!user?.coupleId, // Adicionar flag para saber se tem casal

    // Dados processados
    transactions: processedData.transactions,
    categories: processedData.categories,
    summary: processedData.summary,
    totalSummary: processedData.totalSummary,

    // Ações
    onViewChange: handleViewChange,
    onMonthChange: handleMonthChange,
    onYearChange: setSelectedYear,
    onCreateTransaction: handleCreateTransaction,
    onUpdateTransaction: handleUpdateTransaction,
    onEditTransaction: handleEditTransaction,
    onDeleteTransaction: handleDeleteTransaction,
    onRefresh: handleRefresh,

    // Utilitários
    getDefaultCategory,

    // Estados das mutations
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending || editTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,

    // Erro
    error: createTransactionMutation.error || updateTransactionMutation.error || editTransactionMutation.error || deleteTransactionMutation.error,

    // Auth
    signOut: handleSignOut,

    // Utilitário para processar transações recorrentes manualmente
    processRecurringTransactions: async () => {
      try {
        const res = await fetch('/api/process-recurring', { method: 'POST' })
        const json = await res.json()
        return json
      } catch (err) {
        console.error('Erro ao processar recorrências:', err)
        return { error: true, message: 'Erro ao processar recorrências' }
      }
    },

    // Verificar se transação precisa de modal de exclusão
    checkDeleteModal: async (transactionId: string) => {
      try {
        const { TransactionTypeService } = await import('@/services/transactionTypeService')
        return TransactionTypeService.needsDeleteModal(transactionId, user?.id || '')
      } catch (err) {
        console.error('Erro ao verificar modal:', err)
        return { needsModal: false, type: 'simples', title: '' }
      }
    }
  }
}
