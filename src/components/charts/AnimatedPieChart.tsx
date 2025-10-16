'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnimatedPieChartProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
        percentage: number;
    }>;
    size?: number;
    innerRadius?: number;
    showCenter?: boolean;
    centerIcon?: React.ReactNode;
    centerText?: string;
    animated?: boolean;
}

export function AnimatedPieChart({
    data,
    size = 80,
    innerRadius = 25,
    showCenter = true,
    centerIcon,
    centerText,
    animated = true,
}: AnimatedPieChartProps) {
    const outerRadius = size / 2 - 8;
    const centerSize = size / 2;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
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
                                strokeWidth={1}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {showCenter && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={animated ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        {centerIcon && (
                            <div className="text-slate-600 dark:text-slate-400 mb-1">
                                {centerIcon}
                            </div>
                        )}
                        {centerText && (
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {centerText}
                            </span>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
