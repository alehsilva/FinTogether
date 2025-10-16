'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    animated?: boolean;
    children?: React.ReactNode;
    className?: string;
    duration?: number;
}

export function ProgressRing({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = '#10b981',
    backgroundColor = '#e5e7eb',
    animated = true,
    children,
    className = '',
    duration = 1.5,
}: ProgressRingProps) {
    const [animatedPercentage, setAnimatedPercentage] = useState(animated ? 0 : percentage);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setAnimatedPercentage(percentage);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [percentage, animated]);

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    className="dark:stroke-slate-700"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={animated ? { strokeDashoffset: circumference } : false}
                    animate={{
                        strokeDashoffset: strokeDashoffset,
                    }}
                    transition={{
                        duration: animated ? duration : 0,
                        ease: "easeInOut",
                        delay: 0.2
                    }}
                    style={{
                        filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.3))',
                    }}
                />
            </svg>

            {/* Center content */}
            {children && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={animated ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4, type: "spring" }}
                >
                    {children}
                </motion.div>
            )}
        </div>
    );
}
