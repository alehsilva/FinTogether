'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark') // Padrão dark
    const [mounted, setMounted] = useState(false)

    // Carregar tema do localStorage ao montar
    useEffect(() => {
        const savedTheme = localStorage.getItem('fintogether-theme') as Theme
        if (savedTheme) {
            setThemeState(savedTheme)
        } else {
            // Se não tiver tema salvo, usar dark como padrão
            setThemeState('dark')
            localStorage.setItem('fintogether-theme', 'dark')
        }
        setMounted(true)
    }, [])

    // Aplicar tema no documento
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('fintogether-theme', theme)
    }, [theme, mounted])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light')
    }

    // Evitar flash de conteúdo não estilizado
    if (!mounted) {
        return <div className="opacity-0">{children}</div>
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
