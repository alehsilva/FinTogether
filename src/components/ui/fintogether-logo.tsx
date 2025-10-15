import React from 'react'
import { FinTogetherLogoProps } from '@/models'

export function FinTogetherLogo({ size = 32, className = '' }: FinTogetherLogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Fundo com gradiente do Design System */}
                <rect
                    width="24"
                    height="24"
                    rx="7"
                    fill="url(#designSystemGradient)"
                    filter="url(#modernShadow)"
                    className="dark:opacity-100 opacity-0"
                />
                <rect
                    width="24"
                    height="24"
                    rx="7"
                    fill="url(#lightThemeGradient)"
                    filter="url(#modernShadow)"
                    className="dark:opacity-0 opacity-100"
                />

                {/* Gráfico de barras centralizado - MESMO DESIGN DO ÍCONE */}
                <g>
                    <rect x="5.5" y="14" width="2.5" height="6" rx="0.8" fill="white" opacity="0.75" />
                    <rect x="9" y="11" width="2.5" height="9" rx="0.8" fill="white" opacity="0.85" />
                    <rect x="12.5" y="7.5" width="2.5" height="12.5" rx="0.8" fill="white" opacity="0.95" />
                    <rect x="16" y="4.5" width="2.5" height="15.5" rx="0.8" fill="white" />
                </g>

                {/* Definições de gradientes e efeitos */}
                <defs>
                    {/* Gradiente baseado no Design System (slate + emerald) - tema escuro */}
                    <linearGradient id="designSystemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="50%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>

                    {/* Gradiente tema claro (mais suave) */}
                    <linearGradient id="lightThemeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>

                    {/* Sombra moderna */}
                    <filter id="modernShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="0" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.25" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: size * 0.6,
                    letterSpacing: '-0.01em',
                    fontWeight: 600,
                }}
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-300 dark:to-slate-200">
                    Fin
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500">
                    Together
                </span>
            </div>
        </div>
    )
}

export function FinTogetherIcon({ size = 24, className = '' }: FinTogetherLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Fundo com gradiente do Design System - tema escuro */}
            <rect
                width="24"
                height="24"
                rx="7"
                fill="url(#designSystemGradientSmall)"
                className="dark:opacity-100 opacity-0"
            />
            {/* Fundo tema claro */}
            <rect
                width="24"
                height="24"
                rx="7"
                fill="url(#lightThemeGradientSmall)"
                className="dark:opacity-0 opacity-100"
            />

            {/* Gráfico de barras centralizado */}
            <g>
                <rect x="5.5" y="14" width="2.5" height="6" rx="0.8" fill="white" opacity="0.75" />
                <rect x="9" y="11" width="2.5" height="9" rx="0.8" fill="white" opacity="0.85" />
                <rect x="12.5" y="7.5" width="2.5" height="12.5" rx="0.8" fill="white" opacity="0.95" />
                <rect x="16" y="4.5" width="2.5" height="15.5" rx="0.8" fill="white" />
            </g>

            {/* Definições */}
            <defs>
                <linearGradient id="designSystemGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="lightThemeGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    )
}
