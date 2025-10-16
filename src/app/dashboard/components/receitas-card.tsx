'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DonutChart, ChartSkeleton } from '@/components/charts';
import { TrendingUp, ArrowUpRight, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReceitasCardProps {
    valor: number;
    porcentagem: number;
    loading?: boolean;
    comparison?: {
        userAmount: number;
        partnerAmount: number;
        userPercentage: number;
        partnerPercentage: number;
        partnerName: string;
    };
    showComparison?: boolean;
    selectedMonth?: string;
    selectedYear?: number;
}

export function ReceitasCard({
    valor,
    porcentagem,
    loading = false,
    comparison,
    showComparison = false,
}: ReceitasCardProps) {
    const formatCurrency = (value: number) =>
        `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}`;

    // Corrigir dados para o gráfico donut - usar porcentagem diretamente
    const chartData = [
        {
            name: 'Receitas',
            value: porcentagem,
            color: '#10b981',
            percentage: porcentagem,
        },
        {
            name: 'Outros',
            value: 100 - porcentagem,
            color: '#e2e8f0',
            percentage: 100 - porcentagem,
        },
    ];

    return (
        <Card className="overflow-hidden border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 dark:from-slate-800/50 dark:to-slate-800/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group" role="region" aria-label="Card de Receitas">
            <CardContent className="p-0">
                {/* Header com gradiente e ícone */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 p-3 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Coins className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide" role="heading" aria-level={3}>RECEITAS</h3>
                                <p className="text-emerald-100 text-xs">Entradas do período</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-emerald-100 mb-0.5">Valor Total</div>
                                <div className="text-sm font-bold">{formatCurrency(valor)}</div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-emerald-100 mb-0.5">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs">Status</span>
                                </div>
                                <div className="text-sm font-bold" aria-label={`${porcentagem > 0 ? 'Receitas registradas' : 'Sem receitas'}`}>
                                    {valor > 0 ? '✓ Ativo' : '✗ Vazio'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal com gráfico central */}
                <div className="p-3">
                    <div className="flex flex-col items-center mb-3">
                        {/* Gráfico DonutChart Maior e Melhor Proporção */}
                        {loading ? (
                            <ChartSkeleton type="ring" size={160} animated={true} />
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="mb-3"
                                role="img"
                                aria-label={`Gráfico de receitas mostrando ${porcentagem}% do total`}
                            >
                                <DonutChart
                                    data={chartData}
                                    size={160}
                                    innerRadius={50}
                                    showCenter={true}
                                    centerContent={{
                                        title: `${porcentagem}%`,
                                        value: formatCurrency(valor),
                                        subtitle: 'Receitas',
                                    }}
                                    showPercentages={false}
                                    animated={true}
                                />
                            </motion.div>
                        )}

                        {/* Estatísticas rápidas - Compacto */}
                        <div className="w-full grid grid-cols-2 gap-3 text-center">
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                    Valor Total
                                </div>
                                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    {formatCurrency(valor)}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
                                    Status
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {valor > 0 ? '✓ Ativo' : '✗ Vazio'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparação entre usuários (se disponível) */}
                    {showComparison && comparison && (
                        <motion.div
                            className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/50 space-y-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <div className="text-center mb-3">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
                                    Contribuições Individuais
                                </span>
                            </div>

                            <div className="space-y-2">
                                {/* Você */}
                                <div className="flex items-center justify-between p-2 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            Você
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                            {formatCurrency(comparison.userAmount)}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full font-bold">
                                            {comparison.userPercentage}%
                                        </span>
                                    </div>
                                </div>

                                {/* Parceiro */}
                                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            {comparison.partnerName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                            {formatCurrency(comparison.partnerAmount)}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                                            {comparison.partnerPercentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
