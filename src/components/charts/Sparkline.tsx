'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineProps {
    data: Array<{
        value: number;
        label?: string;
    }>;
    width?: number;
    height?: number;
    color?: string;
    strokeWidth?: number;
    showTrend?: boolean;
    showTooltip?: boolean;
    animated?: boolean;
    gradient?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 text-white p-2 rounded-lg shadow-lg text-xs"
            >
                R$ {new Intl.NumberFormat('pt-BR').format(payload[0].value)}
            </motion.div>
        );
    }
    return null;
};

export function Sparkline({
    data,
    width = 100,
    height = 30,
    color = '#10b981',
    strokeWidth = 2,
    showTrend = true,
    showTooltip = false,
    animated = true,
    gradient = false,
}: SparklineProps) {
    if (data.length < 2) {
        return <div style={{ width, height }} className="bg-slate-100 dark:bg-slate-800 rounded" />;
    }

    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'flat';
    const trendPercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b';

    return (
        <div className="flex items-center gap-2">
            <motion.div
                initial={animated ? { scale: 0.8, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
                style={{ width, height }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        {gradient && (
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        )}

                        {showTooltip && <Tooltip content={<CustomTooltip />} />}

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            dot={false}
                            fill={gradient ? `url(#${gradientId})` : 'none'}
                            animationBegin={animated ? 0 : undefined}
                            animationDuration={animated ? 1500 : 0}
                            animationEasing="ease-in-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {showTrend && (
                <motion.div
                    className="flex items-center gap-1"
                    initial={animated ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                >
                    <TrendIcon
                        size={12}
                        style={{ color: trendColor }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: trendColor }}
                    >
                        {Math.abs(trendPercentage).toFixed(1)}%
                    </span>
                </motion.div>
            )}
        </div>
    );
}
