'use client'

import { useEffect } from 'react'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info' | 'undo'
    onClose: () => void
    duration?: number
    onUndo?: () => void
}

export function Toast({ message, type = 'success', onClose, duration = 3000, onUndo }: ToastProps) {
    useEffect(() => {
        if (type !== 'undo') {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose, type])

    const bgColor = {
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
        info: 'bg-blue-600',
        undo: 'bg-slate-800'
    }[type]

    const icon = {
        success: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        undo: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        )
    }[type]

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20`}>
                {icon}
                <span className="font-medium text-sm">{message}</span>
                {type === 'undo' && onUndo && (
                    <button
                        onClick={onUndo}
                        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold transition-colors active:scale-95"
                    >
                        DESFAZER
                    </button>
                )}
            </div>
        </div>
    )
}
