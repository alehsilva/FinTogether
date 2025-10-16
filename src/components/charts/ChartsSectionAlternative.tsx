'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DonutChart, SemiCircleGauge, StackedBar, ChartSkeleton } from '@/components/charts';
import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import type { FinancialSummary, Transaction } from '@/models/financial';

interface ChartsSectionAlternativeProps {
    selectedView: 'nosso' | 'meu';
    summary: FinancialSummary | null;
    loading?: boolean;
    transactions?: Transaction[];
    currentUserId?: string;
    partnerEmail?: string;
    variant?: 'donut' | 'gauge' | 'stacked';
}

export function ChartsSectionAlternative({
    selectedView,
    summary,
    loading = false,
    transactions = [],
    currentUserId,
    partnerEmail,
    variant = 'donut',
}: ChartsSectionAlternativeProps) {
    const formatValue = (value: number) =>
        new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
            value
        );

    const formatCurrency = (value: number) => `R$ ${formatValue(value)},00`;

    const getReceitas = () => {
        if (!summary) return { valor: '0', porcentagem: 0, valorNumerico: 0 };

        let receitas = 0;
        let total = 0;

        switch (selectedView) {
            case 'nosso':
                receitas = summary.couple_income;
                total = summary.couple_income + summary.couple_expenses;
                break;
            case 'meu':
                receitas = summary.individual_income;
                total = summary.individual_income + summary.individual_expenses;
                break;
        }

        const porcentagem = total > 0 ? Math.round((receitas / total) * 100) : 0;
        return { valor: formatValue(receitas), porcentagem, valorNumerico: receitas };
    };

    const getDespesas = () => {
        if (!summary) return { valor: '0', porcentagem: 0, valorNumerico: 0 };

        let despesas = 0;
        let total = 0;

        switch (selectedView) {
            case 'nosso':
                despesas = summary.couple_expenses;
                total = summary.couple_income + summary.couple_expenses;
                break;
            case 'meu':
                despesas = summary.individual_expenses;
                total = summary.individual_income + summary.individual_expenses;
                break;
        }

        const porcentagem = total > 0 ? Math.round((despesas / total) * 100) : 0;
        return { valor: formatValue(despesas), porcentagem, valorNumerico: despesas };
    };

    const receitas = getReceitas();
    const despesas = getDespesas();
    const total = receitas.valorNumerico + despesas.valorNumerico;
    const saldo = receitas.valorNumerico - despesas.valorNumerico;

    // Dados preparados para os gráficos
    const chartData = [
        {
            name: 'Receitas',
            value: receitas.valorNumerico,
            color: '#10b981',
            percentage: receitas.porcentagem,
        },
        {
            name: 'Despesas',
            value: despesas.valorNumerico,
            color: '#f43f5e',
            percentage: despesas.porcentagem,
        },
    ];

    // Renderização baseada na variante
    const renderChart = () => {
        if (loading) {
            return <ChartSkeleton type="ring" size={120} animated={true} />;
        }

        switch (variant) {
            case 'donut':
                return (
                    <DonutChart
                        data={chartData}
                        size={120}
                        innerRadius={35}
                        showCenter={true}
                        centerContent={{
                            title: 'Total',
                            value: formatCurrency(total),
                            subtitle: selectedView === 'nosso' ? 'Casal' : 'Individual',
                        }}
                        showPercentages={true}
                        animated={true}
                    />
                );

            case 'gauge':
                return (
                    <div className="flex gap-6">
                        <SemiCircleGauge
                            percentage={receitas.porcentagem}
                            value={receitas.valorNumerico}
                            label="Receitas"
                            color="#10b981"
                            size={100}
                            animated={true}
                        />
                        <SemiCircleGauge
                            percentage={despesas.porcentagem}
                            value={despesas.valorNumerico}
                            label="Despesas"
                            color="#f43f5e"
                            size={100}
                            animated={true}
                        />
                    </div>
                );

            case 'stacked':
                return (
                    <StackedBar
                        data={chartData}
                        height={32}
                        showLabels={true}
                        showValues={true}
                        animated={true}
                        className="w-full"
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            {/* Card Principal com Gráfico */}
            <Card className="overflow-hidden bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-150">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                                Visão Financeira
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {selectedView === 'nosso' ? 'Casal' : 'Individual'} • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Saldo</div>
                            <div className={`text-xl font-bold flex items-center gap-1 ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                {saldo >= 0 ? (
                                    <Plus className="w-4 h-4" />
                                ) : (
                                    <Minus className="w-4 h-4" />
                                )}
                                R$ {new Intl.NumberFormat('pt-BR').format(Math.abs(saldo))}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico Principal */}
                    <div className="flex justify-center mb-6">
                        {renderChart()}
                    </div>

                    {/* Resumo dos Valores */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    Receitas
                                </span>
                            </div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(receitas.valorNumerico)}
                            </div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                                {receitas.porcentagem}% do total
                            </div>
                        </div>

                        <div className="text-center p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/50">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-rose-600" />
                                <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                                    Despesas
                                </span>
                            </div>
                            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                {formatCurrency(despesas.valorNumerico)}
                            </div>
                            <div className="text-sm text-rose-600 dark:text-rose-500 mt-1">
                                {despesas.porcentagem}% do total
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
