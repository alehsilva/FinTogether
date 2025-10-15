'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle2, Clock, Edit, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import { DeleteOptionsModal } from '@/components/ui/delete-options-modal'
import { TransactionSkeleton } from '@/components/ui/skeleton'
import { Toast } from '@/components/ui/toast'
import type { Transaction } from '@/models/financial'
import { formatCurrencyBR, parseLocalDate } from '@/lib/utils'
import { useTransactionList } from './hooks/useTransactionList'

export interface TransactionListProps {
    selectedView: 'nosso' | 'meu';
    transactions: Transaction[];
    loading: boolean;
    onTransactionUpdate?: () => void;
    updateTransactionStatus: (params: { transactionId: string; status: string }) => Promise<any>;
    onEditTransaction?: (transaction: Transaction) => void;
    onDeleteTransaction?: (transactionId: string, deleteOption?: 'single' | 'all') => Promise<any>;
    currentUserId?: string;
    partnerEmail?: string | null;
    isMaximized?: boolean;
    onMaximizedChange?: (isMaximized: boolean) => void;
}

export function TransactionList({
    selectedView,
    transactions,
    loading,
    updateTransactionStatus,
    onTransactionUpdate,
    onEditTransaction,
    onDeleteTransaction,
    currentUserId,
    partnerEmail,
    isMaximized: externalIsMaximized,
    onMaximizedChange
}: TransactionListProps) {
    const {
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
        showMaximizeTip,
        pendingDelete,
        showUndoToast,
        filteredTransactions,
        toggleMaximized,
        handleCardTouchStart,
        handleCardTouchMove,
        handleCardTouchEnd,
        handleToggleStatus,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleEdit,
        handleDelete,
        handleUndoDelete,
        handleDeleteModalConfirm,
        handleDeleteModalCancel,
        handleKeyPress,
        toggleSearch
    } = useTransactionList({
        transactions,
        updateTransactionStatus,
        onTransactionUpdate,
        onEditTransaction,
        onDeleteTransaction,
        isMaximized: externalIsMaximized,
        onMaximizedChange
    })

    const getTransactionOwnerBadge = (transaction: Transaction) => {
        if (selectedView === 'meu' || !currentUserId) return null

        const isCurrentUser = transaction.user_id === currentUserId

        if (isCurrentUser) {
            return (
                <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex-shrink-0"
                >
                    Você
                </Badge>
            )
        } else if (partnerEmail) {
            const partnerName = partnerEmail.split('@')[0].split('.')[0]
            const displayName = partnerName.charAt(0).toUpperCase() + partnerName.slice(1)

            return (
                <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 border-purple-500/30 bg-purple-500/10 text-purple-400 flex-shrink-0"
                >
                    {displayName}
                </Badge>
            )
        }

        return null
    }

    const formatCurrency = (value: number) => formatCurrencyBR(value)

    const formatDate = (dateString: string) => {
        const date = parseLocalDate(dateString)
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        }).toUpperCase()
    }

    return (
        <>
            <Card
                className={`flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-slate-300 dark:border-slate-700/50 transition-all duration-300 ${isMaximized
                    ? 'fixed inset-x-0 bottom-0 top-[280px] z-10 rounded-t-2xl rounded-b-none shadow-2xl md:relative md:rounded-lg md:max-h-none'
                    : 'md:max-h-none max-h-[500px]'
                    }`}
            >
                {isMaximized && (
                    <>
                        <div
                            className="md:hidden flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none"
                            onTouchStart={handleCardTouchStart}
                            onTouchMove={handleCardTouchMove}
                            onTouchEnd={handleCardTouchEnd}
                        >
                            <div className="w-12 h-1 bg-slate-400 dark:bg-slate-300 rounded-full transition-colors duration-300"></div>
                        </div>

                        {showMaximizeTip && (
                            <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    <span>Arraste para baixo para minimizar</span>
                                </div>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                        )}
                    </>
                )}

                <div className="px-4 pb-3 pt-4 border-b border-slate-300/40 dark:border-slate-700/30 transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold flex-1 text-slate-900 dark:text-slate-100 transition-colors duration-300">
                            Últimas Transações {filteredTransactions.length > 0 && `(${filteredTransactions.length})`}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline transition-colors duration-300">
                            (clique para revelar ações)
                        </span>
                        {isMaximized && (
                            <span className="md:hidden text-[10px] text-slate-600 dark:text-slate-400 italic mr-2 transition-colors duration-300">
                                arraste para baixo para minimizar
                            </span>
                        )}
                        <button
                            onClick={toggleMaximized}
                            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
                            title={isMaximized ? 'Minimizar' : 'Maximizar'}
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/30 rounded-full p-1 space-x-1 flex-shrink min-w-0 transition-colors duration-300">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${typeFilter === 'all'
                                    ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-md shadow-slate-600/30'
                                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                TODAS
                            </button>
                            <button
                                onClick={() => setTypeFilter('receita')}
                                className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${typeFilter === 'receita'
                                    ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                                    }`}
                            >
                                RECEITAS
                            </button>
                            <button
                                onClick={() => setTypeFilter('despesa')}
                                className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${typeFilter === 'despesa'
                                    ? 'bg-rose-600 dark:bg-rose-700 text-white shadow-md shadow-rose-600/30'
                                    : 'text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                                    }`}
                            >
                                DESPESAS
                            </button>
                        </div>

                        <div className="relative">
                            {showSearchInput ? (
                                <div className="relative">
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        onBlur={() => {
                                            if (searchInput === '') {
                                                toggleSearch()
                                            }
                                        }}
                                        autoFocus
                                        className="pr-8 pl-3 py-1 h-8 w-32 sm:w-40 text-xs border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300"
                                    />
                                    <button
                                        onClick={() => {
                                            if (searchInput) {
                                                const e = { key: 'Enter' } as React.KeyboardEvent
                                                handleKeyPress(e)
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchInput('')
                                                const e = { key: 'Escape' } as React.KeyboardEvent
                                                handleKeyPress(e)
                                            }}
                                            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                                            title="Limpar busca"
                                        >
                                            <span className="text-xs">✕</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={toggleSearch}
                                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50"
                                    title="Buscar transações"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {searchTerm && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1 transition-colors duration-300">
                            <span className="font-semibold">{filteredTransactions.length}</span>
                            <span>
                                {filteredTransactions.length === 1 ? 'transação encontrada' : 'transações encontradas'}
                            </span>
                            <span className="text-slate-400">para "{searchTerm}"</span>
                        </div>
                    )}
                </div>

                <CardContent
                    data-scroll-container
                    className={`space-y-2 px-4 pb-4 pt-3 overflow-y-auto ${isMaximized
                        ? 'h-[calc(100vh-340px)]'
                        : 'max-h-[400px] md:max-h-[300px]'
                        }`}
                >
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <TransactionSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 mb-4 rounded-full bg-slate-200/50 dark:bg-slate-700/30 flex items-center justify-center border border-slate-300/60 dark:border-slate-600/50 transition-colors duration-300">
                                <svg className="w-8 h-8 text-slate-600 dark:text-slate-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-slate-800 dark:text-slate-300 font-semibold mb-1 transition-colors duration-300">
                                {searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
                            </span>
                            {!searchTerm && (
                                <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                                    Clique no botão + para adicionar uma
                                </span>
                            )}
                        </div>
                    ) : (
                        filteredTransactions.map((transaction: Transaction, index: number) => {
                            const isPending = transaction.status === 'pending'
                            const isPendingDelete = pendingDelete?.id === transaction.id

                            return (
                                <div
                                    key={transaction.id}
                                    className={`relative overflow-hidden rounded-lg animate-in fade-in slide-in-from-left-3 duration-300 ${isPendingDelete ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {swipedTransaction === transaction.id && (
                                        <div className="absolute right-0 top-0 bottom-0 flex items-center">
                                            <button
                                                onClick={() => handleEdit(transaction.id)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 h-full flex items-center justify-center transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                disabled={loadingTransactions.has(transaction.id)}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 h-full flex items-center justify-center transition-colors"
                                            >
                                                {loadingTransactions.has(transaction.id) ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div
                                        className={`relative w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-transform duration-300 cursor-pointer border ${isPending
                                            ? 'bg-slate-200/50 dark:bg-slate-700/30 border-slate-300/60 dark:border-slate-600/50 hover:bg-slate-300/60 dark:hover:bg-slate-700/50'
                                            : 'bg-white/95 dark:bg-slate-800/50 border-slate-300/60 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/70'
                                            } ${swipedTransaction === transaction.id ? '-translate-x-24 border-emerald-500/50' : 'translate-x-0'}`}
                                        onTouchStart={(e) => handleTouchStart(e, transaction.id)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={() => handleTouchEnd(transaction.id)}
                                        onClick={(e) => {
                                            const target = e.target as HTMLElement
                                            const isStatusButton = target.closest('[data-status-button]')

                                            if (isStatusButton) {
                                                return
                                            }

                                            if (swipedTransaction === transaction.id) {
                                                setSwipedTransaction(null)
                                            } else {
                                                setSwipedTransaction(transaction.id)
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${transaction.type === 'receita'
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : 'bg-rose-500/20 border border-rose-500/30'
                                                }`}>
                                                {transaction.type === 'receita' ? (
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 transition-colors duration-300">{transaction.title}</p>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="text-xs text-slate-700 dark:text-slate-400 truncate transition-colors duration-300">
                                                        {(transaction as any).category?.name || 'Sem categoria'}
                                                    </p>
                                                    {getTransactionOwnerBadge(transaction)}
                                                    {isPending && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs px-1.5 py-0 border-amber-500/50 text-amber-600 dark:text-amber-400 flex items-center gap-1 flex-shrink-0 transition-colors duration-300"
                                                        >
                                                            <Clock className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Pendente</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${isPending ? 'opacity-75' : ''} ${transaction.type === 'receita'
                                                    ? 'text-emerald-600 dark:text-emerald-500'
                                                    : 'text-rose-600 dark:text-rose-500'
                                                    } transition-colors duration-300`}>
                                                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-500 font-medium transition-colors duration-300">{formatDate(transaction.transaction_date)}</p>
                                            </div>
                                            <button
                                                data-status-button="true"
                                                onClick={() => handleToggleStatus(transaction.id, transaction.status || 'completed')}
                                                disabled={loadingTransactions.has(transaction.id)}
                                                className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer ${isPending
                                                    ? 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                                    : 'bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400'
                                                    }`}
                                                title={isPending ? 'Efetivar transação (afetará o saldo)' : 'Marcar como pendente (não afetará o saldo)'}
                                            >
                                                {loadingTransactions.has(transaction.id) ? (
                                                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isPending ? 'border-slate-600' : 'border-emerald-600'
                                                        }`} />
                                                ) : isPending ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </CardContent>
            </Card>

            {transactionToDelete && transactionToDelete.special_type !== 'simples' && (
                <DeleteOptionsModal
                    isOpen={showDeleteModal}
                    onClose={handleDeleteModalCancel}
                    onConfirm={handleDeleteModalConfirm}
                    transactionTitle={transactionToDelete?.title || ''}
                    transactionType={transactionToDelete?.special_type as 'parcela' | 'assinado'}
                />
            )}

            {showUndoToast && (
                <Toast
                    message="Transação será excluída"
                    type="undo"
                    onClose={() => { }}
                    onUndo={handleUndoDelete}
                    duration={5000}
                />
            )}
        </>
    )
}
