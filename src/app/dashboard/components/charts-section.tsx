'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { FinancialSummary, Transaction } from '@/models/financial'

interface ChartsSectionProps {
    selectedView: 'nosso' | 'meu'
    summary: FinancialSummary | null
    loading?: boolean
    transactions?: Transaction[]
    currentUserId?: string
    partnerEmail?: string
}

export function ChartsSection({ selectedView, summary, loading = false, transactions = [], currentUserId, partnerEmail }: ChartsSectionProps) {
    const formatValue = (value: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

    const calculateCompletedContributions = () => {
        if (!currentUserId || selectedView !== 'nosso' || transactions.length === 0) {
            return null
        }

        const completedTransactions = transactions.filter(t => t.status === 'completed')

        const userIncome = completedTransactions
            .filter(t => t.user_id === currentUserId && t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0)

        const partnerIncome = completedTransactions
            .filter(t => t.user_id !== currentUserId && t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalIncome = userIncome + partnerIncome

        const userExpenses = completedTransactions
            .filter(t => t.user_id === currentUserId && t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0)

        const partnerExpenses = completedTransactions
            .filter(t => t.user_id !== currentUserId && t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = userExpenses + partnerExpenses

        return {
            income: {
                userAmount: userIncome,
                partnerAmount: partnerIncome,
                userPercentage: totalIncome > 0 ? Math.round((userIncome / totalIncome) * 100) : 0,
                partnerPercentage: totalIncome > 0 ? Math.round((partnerIncome / totalIncome) * 100) : 0,
            },
            expenses: {
                userAmount: userExpenses,
                partnerAmount: partnerExpenses,
                userPercentage: totalExpenses > 0 ? Math.round((userExpenses / totalExpenses) * 100) : 0,
                partnerPercentage: totalExpenses > 0 ? Math.round((partnerExpenses / totalExpenses) * 100) : 0,
            }
        }
    }

    const calculateProjectedContributions = () => {
        if (!currentUserId || selectedView !== 'nosso' || transactions.length === 0) {
            return null
        }

        const allTransactions = transactions

        const userIncome = allTransactions
            .filter(t => t.user_id === currentUserId && t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0)

        const partnerIncome = allTransactions
            .filter(t => t.user_id !== currentUserId && t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalIncome = userIncome + partnerIncome

        const userExpenses = allTransactions
            .filter(t => t.user_id === currentUserId && t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0)

        const partnerExpenses = allTransactions
            .filter(t => t.user_id !== currentUserId && t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = userExpenses + partnerExpenses

        return {
            income: {
                userAmount: userIncome,
                partnerAmount: partnerIncome,
                userPercentage: totalIncome > 0 ? Math.round((userIncome / totalIncome) * 100) : 0,
                partnerPercentage: totalIncome > 0 ? Math.round((partnerIncome / totalIncome) * 100) : 0,
            },
            expenses: {
                userAmount: userExpenses,
                partnerAmount: partnerExpenses,
                userPercentage: totalExpenses > 0 ? Math.round((userExpenses / totalExpenses) * 100) : 0,
                partnerPercentage: totalExpenses > 0 ? Math.round((partnerExpenses / totalExpenses) * 100) : 0,
            }
        }
    }

    const completedContributions = calculateCompletedContributions()
    const projectedContributions = calculateProjectedContributions()
    const partnerName = partnerEmail ? partnerEmail.split('@')[0].split('.')[0].charAt(0).toUpperCase() + partnerEmail.split('@')[0].split('.')[0].slice(1) : 'Parceiro'

    const formatCurrency = (value: number) => `R$ ${formatValue(value)},00`

    const getReceitas = () => {
        if (!summary) return { valor: '0', porcentagem: 0 }

        let receitas = 0
        let total = 0

        switch (selectedView) {
            case 'nosso':
                receitas = summary.couple_income
                total = summary.couple_income + summary.couple_expenses
                break
            case 'meu':
                receitas = summary.individual_income
                total = summary.individual_income + summary.individual_expenses
                break
        }

        const porcentagem = total > 0 ? Math.round((receitas / total) * 100) : 0
        return { valor: formatValue(receitas), porcentagem }
    }

    const getDespesas = () => {
        if (!summary) return { valor: '0', porcentagem: 0 }

        let despesas = 0
        let total = 0

        switch (selectedView) {
            case 'nosso':
                despesas = summary.couple_expenses
                total = summary.couple_income + summary.couple_expenses
                break
            case 'meu':
                despesas = summary.individual_expenses
                total = summary.individual_income + summary.individual_expenses
                break
        }

        const porcentagem = total > 0 ? Math.round((despesas / total) * 100) : 0
        return { valor: formatValue(despesas), porcentagem }
    }

    const receitas = getReceitas()
    const despesas = getDespesas()

    return (
        <div className="flex flex-col gap-3 mb-4">
            {/* Card de Receitas */}
            <Card className="overflow-hidden border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-slate-800/50 dark:to-slate-800/50 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                    {/* Header com Gráfico */}
                    <div className="bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 dark:from-emerald-500/10 dark:to-emerald-600/5 p-4 border-b border-emerald-200 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 tracking-wide">RECEITAS</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{receitas.porcentagem}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Gráfico Circular Compacto */}
                            <div className="relative w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#d1fae5" className="dark:stroke-[#064e3b]" strokeWidth="20" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="20"
                                        strokeDasharray={`${2 * Math.PI * 80 * (receitas.porcentagem / 100)} ${2 * Math.PI * 80}`}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Valor Total */}
                            <div className="text-right">
                                <p className="text-xs text-emerald-700 font-medium mb-0.5">Total</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {formatCurrency(receitas.valor === '0' ? 0 : parseInt(receitas.valor.replace(/\./g, '')))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contribuições */}
                    {(completedContributions && (completedContributions.income.userAmount + completedContributions.income.partnerAmount > 0) ||
                        projectedContributions && (projectedContributions.income.userAmount + projectedContributions.income.partnerAmount > 0)) && (
                            <div className="p-3 bg-slate-100/50 dark:bg-slate-700/20 border border-slate-200 dark:border-slate-700/30 rounded-lg space-y-3">
                                {/* Realizado */}
                                {completedContributions && completedContributions.income.userAmount + completedContributions.income.partnerAmount > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 tracking-wider uppercase">Realizado</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between py-1 px-2 bg-cyan-500/10 border border-cyan-500/20 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Você</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(completedContributions.income.userAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded font-bold min-w-[32px] text-center">
                                                        {completedContributions.income.userPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-1 px-2 bg-purple-500/10 border border-purple-500/20 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{partnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{formatCurrency(completedContributions.income.partnerAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-bold min-w-[32px] text-center">
                                                        {completedContributions.income.partnerPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Previsto */}
                                {projectedContributions && projectedContributions.income.userAmount + projectedContributions.income.partnerAmount > 0 && (
                                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/30">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase">Previsto</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between py-1 px-2 bg-cyan-500/5 border border-cyan-500/10 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60"></div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">Você</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{formatCurrency(projectedContributions.income.userAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded font-semibold min-w-[32px] text-center">
                                                        {projectedContributions.income.userPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-1 px-2 bg-purple-500/5 border border-purple-500/10 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60"></div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">{partnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(projectedContributions.income.partnerAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-semibold min-w-[32px] text-center">
                                                        {projectedContributions.income.partnerPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                </CardContent>
            </Card>

            {/* Card de Despesas */}
            <Card className="overflow-hidden border-rose-200 dark:border-rose-500/30 bg-gradient-to-br from-rose-50/80 to-orange-50/60 dark:from-slate-800/50 dark:to-slate-800/50 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                    {/* Header com Gráfico */}
                    <div className="bg-gradient-to-br from-rose-100/50 to-rose-50/30 dark:from-rose-500/10 dark:to-rose-600/5 p-4 border-b border-rose-200 dark:border-rose-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 tracking-wide">DESPESAS</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{despesas.porcentagem}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Gráfico Circular Compacto */}
                            <div className="relative w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#fecdd3" className="dark:stroke-[#7f1d1d]" strokeWidth="20" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f43f5e" strokeWidth="20"
                                        strokeDasharray={`${2 * Math.PI * 80 * (despesas.porcentagem / 100)} ${2 * Math.PI * 80}`}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-rose-700 dark:text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Valor Total */}
                            <div className="text-right">
                                <p className="text-xs text-rose-700 font-medium mb-0.5">Total</p>
                                <p className="text-xl font-bold text-rose-600">
                                    {formatCurrency(despesas.valor === '0' ? 0 : parseInt(despesas.valor.replace(/\./g, '')))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contribuições */}
                    {(completedContributions && (completedContributions.expenses.userAmount + completedContributions.expenses.partnerAmount > 0) ||
                        projectedContributions && (projectedContributions.expenses.userAmount + projectedContributions.expenses.partnerAmount > 0)) && (
                            <div className="p-3 bg-slate-100/50 dark:bg-slate-700/20 border border-slate-200 dark:border-slate-700/30 rounded-lg space-y-3">
                                {/* Realizado */}
                                {completedContributions && completedContributions.expenses.userAmount + completedContributions.expenses.partnerAmount > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 tracking-wider uppercase">Realizado</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between py-1 px-2 bg-cyan-500/10 border border-cyan-500/20 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Você</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(completedContributions.expenses.userAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded font-bold min-w-[32px] text-center">
                                                        {completedContributions.expenses.userPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-1 px-2 bg-purple-500/10 border border-purple-500/20 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{partnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{formatCurrency(completedContributions.expenses.partnerAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-bold min-w-[32px] text-center">
                                                        {completedContributions.expenses.partnerPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Previsto */}
                                {projectedContributions && projectedContributions.expenses.userAmount + projectedContributions.expenses.partnerAmount > 0 && (
                                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/30">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase">Previsto</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between py-1 px-2 bg-cyan-500/5 border border-cyan-500/10 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60"></div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">Você</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{formatCurrency(projectedContributions.expenses.userAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded font-semibold min-w-[32px] text-center">
                                                        {projectedContributions.expenses.userPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-1 px-2 bg-purple-500/5 border border-purple-500/10 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60"></div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">{partnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(projectedContributions.expenses.partnerAmount)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-semibold min-w-[32px] text-center">
                                                        {projectedContributions.expenses.partnerPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    )
}
