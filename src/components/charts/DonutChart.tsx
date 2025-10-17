'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
        percentage: number;
    }>;
    size?: number;
    innerRadius?: number;
    showCenter?: boolean;
    centerContent?: {
        title?: string;
        value?: string;
        subtitle?: string;
    };
    showPercentages?: boolean;
    animated?: boolean;
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Não mostra se menor que 5%

    return (
        <text
            x={x}
            y={y}
            fill="#475569"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function DonutChart({
    data,
    size = 120,
    innerRadius = 35,
    showCenter = true,
    centerContent,
    showPercentages = true,
    animated = true,
}: DonutChartProps) {
    const outerRadius = size / 2 - 20;

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    // Não renderizar se não houver dados ou se o size for muito pequeno
    if (!data || data.length === 0 || size < 50) {
        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <div className="text-xs text-gray-500">Sem dados</div>
            </div>
        );
    }

    return (
        <div className="relative" style={{ width: size, height: size, minWidth: size, minHeight: size }}>
            <PieChart width={size} height={size}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={showPercentages ? CustomLabel : false}
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    animationBegin={animated ? 0 : undefined}
                    animationDuration={animated ? 1200 : 0}
                    animationEasing="ease-out"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
            </PieChart>

            {showCenter && centerContent && (
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    initial={animated ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                >
                    {centerContent.title && (
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {centerContent.title}
                        </span>
                    )}
                    {centerContent.value && (
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {centerContent.value}
                        </span>
                    )}
                    {centerContent.subtitle && (
                        <span className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                            {centerContent.subtitle}
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
}
