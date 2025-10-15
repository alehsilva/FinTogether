'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useCentralizedAppContext } from '@/hooks/useCentralizedAppContext'
import type { Transaction } from '@/models/financial'
import {
    BalanceCard,
    MonthSelector,
    FloatingButton,
    TransactionList,
    ChartsSection,
    AddTransactionPanel
} from '@/app/dashboard/components'

export default function DashboardPage() {
    const [showAddTransaction, setShowAddTransaction] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

    // Inicializar do localStorage se existir
    const [isTransactionListMaximized, setIsTransactionListMaximized] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('fintogetherTransactionListMaximized')
            return saved === 'true'
        }
        return false
    })

    // Ref para manter o estado persistente durante re-renders
    const maximizedStateRef = useRef(isTransactionListMaximized)

    // Função estável para atualizar o estado de maximização
    const handleMaximizedChange = useCallback((newValue: boolean) => {
        maximizedStateRef.current = newValue
        setIsTransactionListMaximized(newValue)
        // Persistir no localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('fintogetherTransactionListMaximized', String(newValue))
        }
    }, [])

    // USAR CONTEXTO EM VEZ DO HOOK DIRETO PARA EVITAR DUPLICAÇÃO
    const {
        user,
        loading,
        selectedView,
        selectedMonth,
        selectedYear,
        transactions,
        categories,
        summary,
        totalSummary,
        hasCouple,
        onViewChange,
        onMonthChange,
        onYearChange,
        onCreateTransaction,
        onUpdateTransaction,
        onEditTransaction,
        onDeleteTransaction,
        onRefresh,
        isCreating,
        isUpdating,
        error
    } = useCentralizedAppContext()

    // Garantir que o estado de maximização seja mantido quando mês/ano muda
    useEffect(() => {
        // Se o ref indica que deveria estar maximizado, mas o state não está, corrigir
        if (maximizedStateRef.current && !isTransactionListMaximized) {
            setIsTransactionListMaximized(true)
        }
    }, [selectedMonth, selectedYear, loading, isTransactionListMaximized])

    // Callback para quando uma transação for criada
    const handleTransactionCreated = async () => {
        await onRefresh() // Atualizar dados
        setShowAddTransaction(false) // Fechar modal mobile
        setEditingTransaction(null) // Limpar estado de edição
    }

    // Callback para editar transação
    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction)

        // Mobile: Abrir modal
        // Desktop: Apenas popular o painel lateral (já visível)
        if (window.innerWidth < 1024) { // lg breakpoint
            setShowAddTransaction(true)
        }
    }

    // Se não há usuário, o DashboardLayout já cuida de mostrar a tela de login
    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Carregando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Layout Fullscreen Mobile quando lista maximizada */}
            {isTransactionListMaximized && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    {/* Month Selector fixo no topo */}
                    <div className="flex-shrink-0">
                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            selectedView={selectedView}
                            onMonthChange={onMonthChange}
                            onYearChange={onYearChange}
                            summary={summary}
                        />
                    </div>

                    {/* Balance Card compacto */}
                    <div className="flex-shrink-0">
                        <BalanceCard
                            selectedView={selectedView}
                            selectedMonth={selectedMonth}
                            onViewChange={onViewChange}
                            summary={summary}
                            totalSummary={totalSummary}
                            loading={loading}
                            hasCouple={hasCouple}
                            isCompact={true}
                        />
                    </div>

                    {/* Lista de transações expansível */}
                    <div className="flex-1 overflow-hidden">
                        <TransactionList
                            selectedView={selectedView}
                            transactions={transactions}
                            loading={loading}
                            updateTransactionStatus={onUpdateTransaction}
                            onEditTransaction={handleEditTransaction}
                            onDeleteTransaction={onDeleteTransaction}
                            onTransactionUpdate={onRefresh}
                            currentUserId={user?.id}
                            partnerEmail={user?.partnerEmail}
                            isMaximized={isTransactionListMaximized}
                            onMaximizedChange={handleMaximizedChange}
                        />
                    </div>

                    {/* Botão Flutuante para adicionar transação */}
                    <div className="flex-shrink-0">
                        <FloatingButton
                            selectedView={selectedView}
                            onClick={() => setShowAddTransaction(true)}
                        />
                    </div>
                </div>
            )}

            {/* Layout Normal */}
            <div className={`relative flex flex-col lg:flex-row h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden transition-colors duration-300 ${isTransactionListMaximized ? 'hidden lg:flex' : ''}`}>
                {/* Background decorativo sutil */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {/* Main Content - Dashboard com scroll */}
                <div className={`flex-1 flex flex-col w-full overflow-hidden transition-all duration-500 relative ${editingTransaction ? 'lg:brightness-50 lg:contrast-75' : ''
                    }`}>
                    {/* Overlay para desktop quando editando */}
                    {editingTransaction && (
                        <div
                            data-overlay="editing"
                            className="hidden lg:block absolute inset-0 bg-black/20 z-10 transition-opacity duration-500 cursor-pointer"
                            onClick={() => setEditingTransaction(null)}
                            title="Clique para cancelar edição"
                        />
                    )}
                    {/* Dashboard Content with scroll */}
                    <div className="h-full overflow-y-auto overflow-x-hidden">{/* Month Navigation */}
                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            selectedView={selectedView}
                            onMonthChange={onMonthChange}
                            onYearChange={onYearChange}
                            summary={summary}
                        />

                        {/* Balance Card */}
                        <BalanceCard
                            selectedView={selectedView}
                            selectedMonth={selectedMonth}
                            onViewChange={onViewChange}
                            summary={summary}
                            totalSummary={totalSummary}
                            loading={loading}
                            hasCouple={hasCouple}
                            isCompact={isTransactionListMaximized}
                        />

                        {/* Content Area */}
                        <div className="px-4 pb-20 lg:pb-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left Column - Transactions */}
                                <div className="flex flex-col gap-4">
                                    <TransactionList
                                        selectedView={selectedView}
                                        transactions={transactions}
                                        loading={loading}
                                        updateTransactionStatus={onUpdateTransaction}
                                        onEditTransaction={handleEditTransaction}
                                        onDeleteTransaction={onDeleteTransaction}
                                        onTransactionUpdate={onRefresh}
                                        currentUserId={user?.id}
                                        partnerEmail={user?.partnerEmail}
                                        isMaximized={isTransactionListMaximized}
                                        onMaximizedChange={handleMaximizedChange}
                                    />
                                </div>

                                {/* Right Column - Charts */}
                                <div className="flex flex-col gap-4">
                                    <ChartsSection
                                        selectedView={selectedView}
                                        summary={summary}
                                        loading={loading}
                                        transactions={transactions}
                                        currentUserId={user?.id}
                                        partnerEmail={user?.partnerEmail}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Add Transaction (Painel Fixo Desktop) */}
                <AddTransactionPanel
                    key={editingTransaction?.id ? `desktop-${editingTransaction.id}` : 'desktop-new'}
                    isOpen={true}
                    isFixed={true}
                    onClose={() => {
                        setEditingTransaction(null)
                    }}
                    onTransactionAdded={handleTransactionCreated}
                    onCreateTransaction={onCreateTransaction}
                    onEditTransaction={onEditTransaction}
                    categories={categories}
                    userId={user?.id ?? ''}
                    isLoading={isCreating}
                    hasCouple={hasCouple}
                    editingTransaction={editingTransaction}
                />
            </div>

            {/* Modal para Mobile */}
            <AddTransactionPanel
                key={editingTransaction?.id ? `mobile-${editingTransaction.id}` : 'mobile-new'}
                isOpen={showAddTransaction}
                isFixed={false}
                onClose={() => {
                    setShowAddTransaction(false)
                    setEditingTransaction(null)
                }}
                onTransactionAdded={handleTransactionCreated}
                onCreateTransaction={onCreateTransaction}
                onEditTransaction={onEditTransaction}
                categories={categories}
                userId={user?.id ?? ''}
                isLoading={isCreating}
                hasCouple={hasCouple}
                editingTransaction={editingTransaction}
            />

            {/* Botão Flutuante Mobile */}
            <FloatingButton
                selectedView={selectedView}
                onClick={() => setShowAddTransaction(true)}
                summary={summary}
            />

            {/* Overlay para mobile */}
            {showAddTransaction && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowAddTransaction(false)}
                />
            )}
        </>
    )
}
