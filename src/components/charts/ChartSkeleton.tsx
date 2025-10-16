'use client';

import { motion } from 'framer-motion';

interface ChartSkeletonProps {
    type?: 'pie' | 'bar' | 'line' | 'ring';
    size?: number;
    height?: number;
    animated?: boolean;
}

export function ChartSkeleton({
    type = 'ring',
    size = 64,
    height = 80,
    animated = true
}: ChartSkeletonProps) {
    const pulseAnimation = animated ? {
        animate: {
            opacity: [0.4, 0.8, 0.4],
        },
        transition: {
            duration: 1.5,
            repeat: Infinity as number,
            ease: "easeInOut" as const
        }
    } : {};

    switch (type) {
        case 'ring':
            return (
                <motion.div
                    className="relative bg-slate-200 dark:bg-slate-700 rounded-full"
                    style={{ width: size, height: size }}
                    {...pulseAnimation}
                >
                    <div
                        className="absolute inset-2 bg-slate-50 dark:bg-slate-800 rounded-full"
                    />
                </motion.div>
            );

        case 'pie':
            return (
                <motion.div
                    className="bg-slate-200 dark:bg-slate-700 rounded-full"
                    style={{ width: size, height: size }}
                    {...pulseAnimation}
                />
            );

        case 'bar':
            return (
                <motion.div
                    className="flex items-end justify-center gap-1 bg-slate-100 dark:bg-slate-800 rounded p-2"
                    style={{ height }}
                    {...pulseAnimation}
                >
                    {[40, 60, 30, 80, 50].map((h, i) => (
                        <div
                            key={i}
                            className="bg-slate-300 dark:bg-slate-600 rounded-t"
                            style={{
                                width: 12,
                                height: `${h}%`,
                                minHeight: 8
                            }}
                        />
                    ))}
                </motion.div>
            );

        case 'line':
            return (
                <motion.div
                    className="bg-slate-100 dark:bg-slate-800 rounded p-2 flex items-center"
                    style={{ height }}
                    {...pulseAnimation}
                >
                    <svg width="100%" height="100%" className="text-slate-300 dark:text-slate-600">
                        <polyline
                            points="0,30 20,25 40,35 60,20 80,30 100,15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </motion.div>
            );

        default:
            return (
                <motion.div
                    className="bg-slate-200 dark:bg-slate-700 rounded"
                    style={{ width: size, height: size }}
                    {...pulseAnimation}
                />
            );
    }
}
