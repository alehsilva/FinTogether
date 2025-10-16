'use client';

import { motion } from 'framer-motion';

interface SemiCircleGaugeProps {
    percentage: number;
    value: number;
    label: string;
    color: string;
    backgroundColor?: string;
    size?: number;
    strokeWidth?: number;
    animated?: boolean;
    showValue?: boolean;
}

export function SemiCircleGauge({
    percentage,
    value,
    label,
    color,
    backgroundColor = '#e5e7eb',
    size = 100,
    strokeWidth = 8,
    animated = true,
    showValue = true,
}: SemiCircleGaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Semi-círculo
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center" style={{ width: size }}>
            {/* Semi-círculo */}
            <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
                <svg
                    width={size}
                    height={size / 2 + 10}
                    className="overflow-visible"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                    {/* Background arc */}
                    <path
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        fill="transparent"
                        stroke={backgroundColor}
                        strokeWidth={strokeWidth}
                        className="dark:stroke-slate-700"
                    />

                    {/* Progress arc */}
                    <motion.path
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        initial={animated ? { strokeDashoffset: circumference } : false}
                        animate={{ strokeDashoffset: strokeDashoffset }}
                        transition={{
                            duration: animated ? 1.5 : 0,
                            ease: "easeInOut",
                            delay: 0.2
                        }}
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}30)`,
                        }}
                    />

                    {/* Pointer/Needle */}
                    <motion.g
                        initial={animated ? { rotate: -90 } : false}
                        animate={{ rotate: -90 + (percentage * 180) / 100 }}
                        transition={{ duration: animated ? 1.8 : 0, ease: "easeOut", delay: 0.5 }}
                        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r="3"
                            fill={color}
                            className="drop-shadow-sm"
                        />
                        <line
                            x1={size / 2}
                            y1={size / 2}
                            x2={size / 2}
                            y2={strokeWidth + 5}
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="drop-shadow-sm"
                        />
                    </motion.g>
                </svg>
            </div>

            {/* Labels */}
            <div className="mt-2 text-center">
                <motion.div
                    initial={animated ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.4 }}
                >
                    <div className="text-lg font-bold" style={{ color }}>
                        {percentage}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {label}
                    </div>
                    {showValue && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                            R$ {new Intl.NumberFormat('pt-BR').format(value)}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
