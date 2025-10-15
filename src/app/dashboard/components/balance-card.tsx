'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toast } from '@/components/ui/toast'
import { formatCurrencyBR } from '@/lib/utils'

import type { FinancialSummary, Transaction } from '@/models/financial'

interface BalanceCardProps {
    selectedView: 'nosso' | 'meu'
    selectedMonth: string
    onViewChange: (view: 'nosso' | 'meu') => void
    summary: FinancialSummary | null
    loading: boolean
    totalSummary?: FinancialSummary | null
    hasCouple?: boolean
    isCompact?: boolean
}

export function BalanceCard({
    selectedView,
    selectedMonth,
    onViewChange,
    summary,
    loading,
    totalSummary,
    hasCouple = true,
    isCompact = false
}: BalanceCardProps) {
    const formatCurrency = (value: number) => formatCurrencyBR(value)
    const [showCopyToast, setShowCopyToast] = useState(false)

    const copyBalanceToClipboard = () => {
        const balance = getBalance().replace('R$', '').trim()
        navigator.clipboard.writeText(balance)
        setShowCopyToast(true)

        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }
    }

    const getMonthProgress = () => {
        const now = new Date()
        const currentDay = now.getDate()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        return Math.round((currentDay / daysInMonth) * 100)
    }

    const getBalance = () => {
        if (loading || !summary) return 'R$ 0,00'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_balance)
            case 'meu': return formatCurrency(summary.individual_balance)
            default: return formatCurrency(summary.total_balance)
        }
    }

    const getProjectedBalance = () => {
        if (loading || !summary) return 'R$ 0,00'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_projected_balance)
            case 'meu': return formatCurrency(summary.individual_projected_balance)
            default: return formatCurrency(summary.projected_balance)
        }
    }

    const getReceitas = () => {
        if (loading || !summary) return '0'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_income).replace('R\$', '').trim()
            case 'meu': return formatCurrency(summary.individual_income).replace('R\$', '').trim()
            default: return formatCurrency(summary.total_income).replace('R\$', '').trim()
        }
    }

    const getDespesas = () => {
        if (loading || !summary) return '0'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_expenses).replace('R\$', '').trim()
            case 'meu': return formatCurrency(summary.individual_expenses).replace('R\$', '').trim()
            default: return formatCurrency(summary.total_expenses).replace('R\$', '').trim()
        }
    }

    const getProjectedReceitas = () => {
        if (loading || !summary) return '0'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_projected_income).replace('R\$', '').trim()
            case 'meu': return formatCurrency(summary.individual_projected_income).replace('R\$', '').trim()
            default: return formatCurrency(summary.projected_income).replace('R\$', '').trim()
        }
    }

    const getProjectedDespesas = () => {
        if (loading || !summary) return '0'

        switch (selectedView) {
            case 'nosso': return formatCurrency(summary.couple_projected_expenses).replace('R\$', '').trim()
            case 'meu': return formatCurrency(summary.individual_projected_expenses).replace('R\$', '').trim()
            default: return formatCurrency(summary.projected_expenses).replace('R\$', '').trim()
        }
    }

    if (isCompact) {
        return (
            <>
                <div className="md:p-4 md:pb-2 sticky top-[72px] z-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 md:relative md:top-0 -mx-4 px-4 py-2 md:mx-0 transition-all duration-300">
                    <div className="md:rounded-xl px-4 py-2.5 text-slate-900 dark:text-white relative overflow-hidden shadow-lg transition-all duration-300 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <div className="relative z-10">
                            {hasCouple && (
                                <div className="flex gap-0.5 bg-slate-900/20 dark:bg-black/20 rounded p-0.5 mb-2 w-fit animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
                                    <Button
                                        size="sm"
                                        onClick={() => onViewChange('nosso')}
                                        className={`text-xs font-medium px-3 py-1 rounded-sm transition-all duration-200 cursor-pointer h-6 ${selectedView === 'nosso'
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                            : 'bg-slate-300/70 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 hover:bg-slate-400/70 dark:hover:bg-slate-700 backdrop-blur-sm'
                                            }`}
                                    >
                                        NOSSO
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onViewChange('meu')}
                                        className={`text-xs font-medium px-3 py-1 rounded-sm transition-all duration-200 cursor-pointer h-6 ${selectedView === 'meu'
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                            : 'bg-slate-300/70 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 hover:bg-slate-400/70 dark:hover:bg-slate-700 backdrop-blur-sm'
                                            }`}
                                    >
                                        MEU
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div
                                    className="flex-1 cursor-pointer active:scale-95 transition-transform"
                                    onDoubleClick={copyBalanceToClipboard}
                                    title="Clique duas vezes para copiar"
                                >
                                    <p className="text-[10px] opacity-80 font-semibold tracking-wide mb-0.5">SALDO ATUAL</p>
                                    <p className="text-xl font-bold leading-tight transition-all duration-300 flex items-center gap-1">
                                        {getBalance()}
                                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <p className="text-[9px] opacity-80 font-semibold mb-0.5">RECEITAS</p>
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-colors duration-300">+{getReceitas()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] opacity-80 font-semibold mb-0.5">DESPESAS</p>
                                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 transition-colors duration-300">-{getDespesas()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showCopyToast && (
                    <Toast
                        message="Saldo copiado!"
                        type="success"
                        onClose={() => setShowCopyToast(false)}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <div className="p-4 pb-2">
                <div className="rounded-2xl p-4 text-slate-900 dark:text-white relative overflow-hidden transition-all duration-300 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-4">
                                {hasCouple ? (
                                    <div className="flex gap-0.5 bg-slate-900/20 dark:bg-black/20 rounded p-0.5 transition-colors duration-300">
                                        <Button
                                            size="sm"
                                            onClick={() => onViewChange('nosso')}
                                            className={`text-xs font-medium px-2 py-0.5 rounded-sm transition-all duration-200 cursor-pointer h-6 min-w-0 flex items-center gap-1 ${selectedView === 'nosso'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-slate-300/70 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 hover:bg-slate-400/70 dark:hover:bg-slate-700 backdrop-blur-sm'
                                                }`}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                            NOSSO
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => onViewChange('meu')}
                                            className={`text-xs font-medium px-2 py-0.5 rounded-sm transition-all duration-200 cursor-pointer h-6 min-w-0 flex items-center gap-1 ${selectedView === 'meu'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-slate-300/70 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 hover:bg-slate-400/70 dark:hover:bg-slate-700 backdrop-blur-sm'
                                                }`}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            MEU
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-slate-900/20 dark:bg-black/20 rounded-md px-3 py-1 border border-slate-400/30 dark:border-white/10 transition-colors duration-300">
                                        <svg className="w-4 h-4 text-slate-800 dark:text-white/80 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white/90 tracking-wider transition-colors duration-300">MINHAS FINANÇAS</span>
                                    </div>
                                )}
                            </div>
                            <Badge className="bg-slate-300/60 dark:bg-slate-700/30 text-slate-800 dark:text-slate-200 px-3 py-1 border border-slate-400/60 dark:border-slate-600/50 shadow-sm font-medium transition-colors duration-300">
                                {selectedMonth}/{summary?.year ?? new Date().getFullYear()}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider transition-colors duration-300">SALDO DISPONÍVEL</h2>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                                        {loading ? (
                                            <span className="animate-pulse bg-slate-700/20 dark:bg-white/20 rounded-md h-8 w-32 inline-block transition-colors duration-300"></span>
                                        ) : (
                                            getBalance()
                                        )}
                                    </h1>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider transition-colors duration-300">SALDO PREVISTO</h2>
                                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mt-1 transition-colors duration-300 ${(() => {
                                        if (loading) return 'opacity-90'
                                        const projectedBalance = getProjectedBalance()
                                        if (projectedBalance.includes('-')) return 'text-rose-600 dark:text-rose-300 drop-shadow-md'
                                        if (projectedBalance === 'R$ 0,00') return 'text-slate-600 dark:text-slate-300'
                                        return 'text-emerald-600 dark:text-emerald-300 drop-shadow-md'
                                    })()}`}>
                                        {loading ? (
                                            <span className="animate-pulse bg-slate-700/20 dark:bg-white/20 rounded-md h-8 w-32 inline-block transition-colors duration-300"></span>
                                        ) : (
                                            getProjectedBalance()
                                        )}
                                    </h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-200/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-slate-400/30 dark:border-white/10 transition-colors duration-300">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wider transition-colors duration-300">RECEITAS</p>
                                    <p className="text-lg font-bold mt-1 text-emerald-700 dark:text-emerald-300 drop-shadow-lg transition-colors duration-300">
                                        {loading ? '...' : `+ ${getReceitas()}`}
                                    </p>
                                    <p className="text-xs opacity-90 mt-1 text-emerald-700 dark:text-emerald-200 font-medium transition-colors duration-300">
                                        Previsto: + {loading ? '...' : getProjectedReceitas()}
                                    </p>
                                </div>
                                <div className="bg-slate-200/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-slate-400/30 dark:border-white/10 transition-colors duration-300">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wider transition-colors duration-300">DESPESAS</p>
                                    <p className="text-lg font-bold mt-1 text-rose-700 dark:text-rose-300 drop-shadow-lg transition-colors duration-300">
                                        {loading ? '...' : `- ${getDespesas()}`}
                                    </p>
                                    <p className="text-xs opacity-90 mt-1 text-rose-700 dark:text-rose-200 font-medium transition-colors duration-300">
                                        Previsto: - {loading ? '...' : getProjectedDespesas()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-400/20 dark:border-white/10 transition-colors duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 tracking-wider transition-colors duration-300">PROGRESSO DO MÊS</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white/90 transition-colors duration-300">{getMonthProgress()}%</p>
                                </div>
                                <div className="w-full bg-slate-300/50 dark:bg-black/30 rounded-full h-2 overflow-hidden border border-slate-400/30 dark:border-white/10 transition-colors duration-300">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                                        style={{ width: `${getMonthProgress()}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-700 dark:text-slate-300 mt-1 text-center opacity-80 font-medium transition-colors duration-300">
                                    {new Date().getDate()} de {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} dias
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-slate-700/5 dark:bg-white/5 transition-colors duration-300" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-slate-700/5 dark:bg-white/5 transition-colors duration-300" />
                </div>
            </div>

            {showCopyToast && (
                <Toast
                    message="Saldo copiado!"
                    type="success"
                    onClose={() => setShowCopyToast(false)}
                />
            )}
        </>
    )
}
