'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DonutChart, MiniBarChart, ChartSkeleton } from '@/components/charts';
import { TrendingUp, TrendingDown, Plus, Minus, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SaldoComparativoCardProps {
    receitas: {
        valor: number;
        porcentagem: number;
    };
    despesas: {
        valor: number;
        porcentagem: number;
    };
    loading?: boolean;
    selectedMonth?: string;
    selectedYear?: number;
}

export function SaldoComparativoCard({
    receitas,
    despesas,
    loading = false,
}: SaldoComparativoCardProps) {
    const formatCurrency = (value: number) =>
        `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}`;

    const saldo = receitas.valor - despesas.valor;
    const isPositive = saldo >= 0;
    const total = receitas.valor + despesas.valor;

    // Dados para o gráfico comparativo
    const chartData = [
        {
            name: 'Receitas',
            value: receitas.valor,
            color: '#10b981',
            percentage: receitas.porcentagem,
        },
        {
            name: 'Despesas',
            value: despesas.valor,
            color: '#ef4444',
            percentage: despesas.porcentagem,
        },
    ];

    // Dados para o gráfico de barras
    const barData = [
        {
            name: 'Receitas',
            value: receitas.valor,
            color: '#10b981',
            label: `${receitas.porcentagem}%`,
        },
        {
            name: 'Despesas',
            value: despesas.valor,
            color: '#ef4444',
            label: `${despesas.porcentagem}%`,
        },
    ];

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-slate-50/90 to-slate-100/70 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group" role="region" aria-label="Card Comparativo de Saldo">
            <CardContent className="p-0">
                {/* Header com gradiente dinâmico baseado no saldo */}
                <div className={`bg-gradient-to-r p-3 text-white relative overflow-hidden ${isPositive
                    ? 'from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600'
                    : 'from-rose-500 to-red-500 dark:from-rose-600 dark:to-red-600'
                    }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide" role="heading" aria-level={3}>COMPARATIVO</h3>
                                <p className="text-white/90 text-xs">Receitas vs Despesas</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1">
                                {isPositive ? (
                                    <Plus className="w-3 h-3" />
                                ) : (
                                    <Minus className="w-3 h-3" />
                                )}
                                <span className="text-sm font-bold" aria-label={`Saldo de ${formatCurrency(Math.abs(saldo))}`}>
                                    {formatCurrency(Math.abs(saldo))}
                                </span>
                                <span className="text-white/90 text-xs">
                                    {isPositive ? 'Positivo' : 'Negativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>                {/* Conteúdo principal */}
                <div className="p-4">
                    {/* Gráfico único - Compacto */}
                    <div className="flex flex-col items-center mb-4">
                        {loading ? (
                            <ChartSkeleton type="ring" size={180} animated={true} />
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="mb-4"
                                role="img"
                                aria-label={`Gráfico comparativo mostrando ${receitas.porcentagem}% receitas e ${despesas.porcentagem}% despesas`}
                            >
                                <DonutChart
                                    data={chartData}
                                    size={180}
                                    innerRadius={55}
                                    showCenter={true}
                                    centerContent={{
                                        title: 'Saldo',
                                        value: formatCurrency(Math.abs(saldo)),
                                        subtitle: isPositive ? '+' : '-',
                                    }}
                                    showPercentages={true}
                                    animated={true}
                                />
                            </motion.div>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center">
                            Distribuição: {receitas.porcentagem}% receitas • {despesas.porcentagem}% despesas
                        </p>
                    </div>

                    {/* Resumo detalhado */}
                    <motion.div
                        className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        {/* Métricas lado a lado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Receitas */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                                        Receitas
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(receitas.valor)}
                                </div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                                    {receitas.porcentagem}% do total
                                </div>
                            </div>

                            {/* Despesas */}
                            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <TrendingDown className="w-5 h-5 text-rose-600" />
                                    <span className="text-base font-semibold text-rose-700 dark:text-rose-400">
                                        Despesas
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(despesas.valor)}
                                </div>
                                <div className="text-sm text-rose-600 dark:text-rose-500 mt-2">
                                    {despesas.porcentagem}% do total
                                </div>
                            </div>
                        </div>

                        {/* Saldo final destacado */}
                        <div className={`p-4 rounded-xl border-2 ${isPositive
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isPositive ? (
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <Plus className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-rose-500/20 rounded-lg">
                                            <Minus className="w-4 h-4 text-rose-600" />
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Saldo do Período
                                        </span>
                                        <div className={`text-2xl font-bold ${isPositive
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {formatCurrency(Math.abs(saldo))}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-2 rounded-full text-xs font-bold ${isPositive
                                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    }`}>
                                    {isPositive ? 'POSITIVO' : 'NEGATIVO'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
}
