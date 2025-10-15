'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const months = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
]

interface MonthSelectorProps {
    selectedMonth: string
    selectedYear: number
    selectedView: 'nosso' | 'meu'
    onMonthChange: (month: string) => void
    onYearChange: (year: number) => void
    summary?: { individual_balance: number } | null
}

export function MonthSelector({ selectedMonth, selectedYear, selectedView, onMonthChange, onYearChange, summary }: MonthSelectorProps) {
    const monthsRef = useRef<HTMLDivElement>(null)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = months.findIndex(month => month === selectedMonth)

            if (isLeftSwipe) {
                if (currentIndex < months.length - 1) {
                    onMonthChange(months[currentIndex + 1])
                } else {
                    onYearChange(selectedYear + 1)
                    onMonthChange(months[0])
                }
            } else if (isRightSwipe) {
                if (currentIndex > 0) {
                    onMonthChange(months[currentIndex - 1])
                } else {
                    onYearChange(selectedYear - 1)
                    onMonthChange(months[11])
                }
            }
        }
    }

    const scrollMonths = (direction: 'left' | 'right') => {
        if (!monthsRef.current) return
        const scrollAmount = 120
        const currentScroll = monthsRef.current.scrollLeft
        const newScroll = direction === 'left'
            ? Math.max(0, currentScroll - scrollAmount)
            : currentScroll + scrollAmount

        monthsRef.current.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        })
    }

    const scrollToCurrentMonth = () => {
        if (!monthsRef.current) return

        const currentMonthIndex = months.findIndex(month => month === selectedMonth)
        if (currentMonthIndex === -1) return

        const container = monthsRef.current
        const buttons = container.children
        if (buttons[currentMonthIndex]) {
            const buttonElement = buttons[currentMonthIndex] as HTMLElement
            const containerWidth = container.clientWidth
            const buttonLeft = buttonElement.offsetLeft
            const buttonWidth = buttonElement.clientWidth

            // Calcular posição para centralizar perfeitamente
            const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)

            container.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: 'smooth'
            })
        }
    }

    // Sempre centralizar no mês selecionado quando muda
    useEffect(() => {
        const timer = setTimeout(scrollToCurrentMonth, 100) // Delay reduzido para mais responsividade
        return () => clearTimeout(timer)
    }, [selectedMonth])

    // Centralizar também no mount inicial e em mudanças de tela
    useEffect(() => {
        const timer = setTimeout(scrollToCurrentMonth, 200)

        // Listener para mudanças de orientação/resize
        const handleResize = () => {
            setTimeout(scrollToCurrentMonth, 100)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
        }
    }, [])

    return (
        <div className="px-4 pt-2 pb-4 md:relative md:z-auto sticky top-0 z-40 bg-gradient-to-b from-slate-50 via-white to-transparent dark:from-slate-900 dark:via-slate-800 dark:to-transparent transition-colors duration-300">
            {/* Container dos meses - design limpo */}
            <div className="relative group">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-3 shadow-md border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
                    {/* Gradiente sutil no fundo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-slate-100/20 to-slate-200/40 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-slate-800/40 transition-colors duration-300"></div>

                    {/* Setinhas para desktop - z-index maior para funcionar */}
                    <div className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30">
                        <button
                            onClick={() => {
                                const currentIndex = months.findIndex(month => month === selectedMonth)
                                if (currentIndex > 0) {
                                    onMonthChange(months[currentIndex - 1])
                                } else {
                                    // Janeiro -> Dezembro do ano anterior
                                    onYearChange(selectedYear - 1)
                                    onMonthChange(months[11])
                                }
                            }}
                            className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 active:scale-90 shadow-sm bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>

                    <div className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30">
                        <button
                            onClick={() => {
                                const currentIndex = months.findIndex(month => month === selectedMonth)
                                if (currentIndex < months.length - 1) {
                                    onMonthChange(months[currentIndex + 1])
                                } else {
                                    // Dezembro -> Janeiro do próximo ano
                                    onYearChange(selectedYear + 1)
                                    onMonthChange(months[0])
                                }
                            }}
                            className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 active:scale-90 shadow-sm bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>



                    <div
                        ref={monthsRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-2 relative z-10 md:px-12"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {months.map((month, index) => (
                            <Button
                                key={month}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    onMonthChange(month)
                                    // Não precisa mudar ano no click direto, só nos swipes nos limites
                                }}
                                className={`text-sm font-bold transition-all duration-300 ease-in-out flex-shrink-0 min-w-[85px] h-12 rounded-xl relative overflow-hidden ${selectedMonth === month
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105 border border-emerald-500'
                                    : 'text-slate-700 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/30 hover:bg-slate-300/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300/40 dark:border-transparent hover:border-slate-400/60 dark:hover:border-slate-600/50'
                                    }`}
                            >
                                <span className="relative z-10 flex flex-col items-center">
                                    <span className="text-xs font-semibold tracking-wider">{month}</span>
                                    <span className="text-[10px] opacity-80 font-medium">{selectedYear}</span>
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    )
}
