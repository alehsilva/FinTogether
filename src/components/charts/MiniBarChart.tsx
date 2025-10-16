'use client';

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface MiniBarChartProps {
    data: Array<{
        name: string;
        value: number;
        color?: string;
        label?: string;
    }>;
    height?: number;
    showAxis?: boolean;
    showTooltip?: boolean;
    animated?: boolean;
    gradientColors?: {
        start: string;
        end: string;
    };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
            >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {label}
                </p>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: payload[0].color }}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        R$ {new Intl.NumberFormat('pt-BR').format(payload[0].value)}
                    </span>
                </div>
            </motion.div>
        );
    }
    return null;
};

export function MiniBarChart({
    data,
    height = 120,
    showAxis = false,
    showTooltip = true,
    animated = true,
    gradientColors,
}: MiniBarChartProps) {
    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <motion.div
            className="w-full"
            initial={animated ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ height }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    {gradientColors && (
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={gradientColors.start} stopOpacity={0.9} />
                                <stop offset="95%" stopColor={gradientColors.end} stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                    )}

                    {showAxis && (
                        <>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                            />
                        </>
                    )}

                    {showTooltip && (
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)', radius: 4 }}
                        />
                    )}

                    <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        animationBegin={animated ? 0 : undefined}
                        animationDuration={animated ? 1000 : 0}
                        animationEasing="ease-out"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={gradientColors ? `url(#${gradientId})` : entry.color || '#10b981'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
