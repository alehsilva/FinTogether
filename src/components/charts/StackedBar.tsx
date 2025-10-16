'use client';

import { motion } from 'framer-motion';

interface StackedBarProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
        percentage: number;
    }>;
    height?: number;
    showLabels?: boolean;
    showValues?: boolean;
    animated?: boolean;
    className?: string;
}

export function StackedBar({
    data,
    height = 24,
    showLabels = true,
    showValues = true,
    animated = true,
    className = '',
}: StackedBarProps) {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={`w-full ${className}`}>
            {/* Labels superiores */}
            {showLabels && (
                <div className="flex justify-between mb-2">
                    {data.map((item, index) => (
                        <motion.div
                            key={item.name}
                            className="flex items-center gap-1.5"
                            initial={animated ? { opacity: 0, y: -10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {item.name}
                            </span>
                            <span
                                className="text-xs font-bold"
                                style={{ color: item.color }}
                            >
                                {item.percentage}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Barra empilhada */}
            <motion.div
                className="w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner"
                style={{ height }}
                initial={animated ? { scaleX: 0 } : false}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="flex h-full">
                    {data.map((item, index) => (
                        <motion.div
                            key={item.name}
                            className="h-full relative group cursor-pointer"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                                filter: 'saturate(0.9) brightness(1.05)',
                            }}
                            initial={animated ? { width: 0 } : false}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{
                                delay: 0.3 + index * 0.15,
                                duration: 0.8,
                                ease: "easeOut"
                            }}
                            whileHover={{
                                filter: 'saturate(1.2) brightness(1.15)',
                                transition: { duration: 0.2 }
                            }}
                        >
                            {/* Tooltip no hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {item.name}: R$ {new Intl.NumberFormat('pt-BR').format(item.value)}
                            </div>

                            {/* Porcentagem dentro da barra (se houver espaço) */}
                            {item.percentage > 15 && (
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    initial={animated ? { opacity: 0 } : false}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                                >
                                    <span className="text-xs font-bold text-white drop-shadow-sm">
                                        {item.percentage}%
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Valores em baixo */}
            {showValues && (
                <div className="flex justify-between mt-2">
                    {data.map((item, index) => (
                        <motion.div
                            key={`value-${item.name}`}
                            className="text-center"
                            initial={animated ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
                        >
                            <div
                                className="text-sm font-bold"
                                style={{ color: item.color }}
                            >
                                R$ {new Intl.NumberFormat('pt-BR').format(item.value)}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
