'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCentralizedAppContext } from '@/hooks/useCentralizedAppContext';
import type { Transaction } from '@/models/financial';
import {
    BalanceCard,
    MonthSelector,
    FloatingButton,
    TransactionList,
    ChartsSection,
    AddTransactionPanel,
} from '@/app/dashboard/components';

export default function DashboardPage() {
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const [isTransactionListMaximized, setIsTransactionListMaximized] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('fintogetherTransactionListMaximized');
            return saved === 'true';
        }
        return false;
    });

    const maximizedStateRef = useRef(isTransactionListMaximized);
    const handleMaximizedChange = useCallback((newValue: boolean) => {
        maximizedStateRef.current = newValue;
        setIsTransactionListMaximized(newValue);
        if (typeof window !== 'undefined') {
            localStorage.setItem('fintogetherTransactionListMaximized', String(newValue));
        }
    }, []);
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
        error,
    } = useCentralizedAppContext();

    useEffect(() => {
        if (maximizedStateRef.current && !isTransactionListMaximized) {
            setIsTransactionListMaximized(true);
        }
    }, [selectedMonth, selectedYear, loading, isTransactionListMaximized]);

    const handleTransactionCreated = async () => {
        await onRefresh();
        setShowAddTransaction(false);
        setEditingTransaction(null);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);

        if (window.innerWidth < 1024) {
            setShowAddTransaction(true);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {isTransactionListMaximized && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onMonthChange={onMonthChange}
                            onYearChange={onYearChange}
                        />
                    </div>

                    <div className="flex-shrink-0">
                        <FloatingButton
                            selectedView={selectedView}
                            onClick={() => setShowAddTransaction(true)}
                        />
                    </div>
                </div>
            )}

            <div
                className={`relative flex flex-col lg:flex-row h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden transition-colors duration-150 ${isTransactionListMaximized ? 'hidden lg:flex' : ''}`}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-100 dark:opacity-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-0 dark:opacity-100" />
                <div
                    className={`flex-1 flex flex-col w-full overflow-hidden transition-all duration-150 relative lg:pr-80 ${editingTransaction ? 'lg:brightness-50 lg:contrast-75' : ''
                        }`}
                >
                    {editingTransaction && (
                        <div
                            data-overlay="editing"
                            className="hidden lg:block absolute inset-0 bg-black/20 z-10 transition-opacity duration-150 cursor-pointer"
                            onClick={() => setEditingTransaction(null)}
                            title="Clique para cancelar edição"
                        />
                    )}
                    <div className="h-full overflow-y-auto overflow-x-hidden">
                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            selectedView={selectedView}
                            onMonthChange={onMonthChange}
                            onYearChange={onYearChange}
                            summary={summary}
                        />

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

                        <div className="px-4 pb-20 lg:pb-4">
                            {/* Layout: Transações à esquerda (compacta), Charts à direita (maior espaço) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                                {/* Transaction List - Lado esquerdo expandido */}
                                <div className="lg:col-span-5 flex flex-col">
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
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        onMonthChange={onMonthChange}
                                        onYearChange={onYearChange}
                                    />
                                </div>

                                {/* Charts Section - Lateral direita */}
                                <div className="lg:col-span-7 flex flex-col gap-4">
                                    <ChartsSection
                                        selectedView={selectedView}
                                        summary={summary}
                                        loading={loading}
                                        transactions={transactions}
                                        currentUserId={user?.id}
                                        partnerEmail={user?.partnerEmail}
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AddTransactionPanel
                    key={editingTransaction?.id ? `desktop-${editingTransaction.id}` : 'desktop-new'}
                    isOpen={true}
                    isFixed={true}
                    onClose={() => {
                        setEditingTransaction(null);
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

            <AddTransactionPanel
                key={editingTransaction?.id ? `mobile-${editingTransaction.id}` : 'mobile-new'}
                isOpen={showAddTransaction}
                isFixed={false}
                onClose={() => {
                    setShowAddTransaction(false);
                    setEditingTransaction(null);
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

            <FloatingButton
                selectedView={selectedView}
                onClick={() => setShowAddTransaction(true)}
                summary={summary}
            />

            {showAddTransaction && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowAddTransaction(false)}
                />
            )}
        </>
    );
}
