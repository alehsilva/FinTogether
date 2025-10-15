'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionCalendarProps {
    selectedDate: Date
    calendarDate: Date
    onDateSelect: (date: Date) => void
    onMonthNavigate: (direction: 'prev' | 'next') => void
}

export function TransactionCalendar({
    selectedDate,
    calendarDate,
    onDateSelect,
    onMonthNavigate
}: TransactionCalendarProps) {
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const isSelectedDate = (day: number) => {
        const compareDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
        return compareDate.toDateString() === selectedDate.toDateString()
    }

    const isToday = (day: number) => {
        const compareDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
        const today = new Date()
        return compareDate.toDateString() === today.toDateString()
    }

    // Formatar data para input HTML5 (YYYY-MM-DD)
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    // Converter string do input para Date
    const handleDateInputChange = (dateString: string) => {
        if (dateString) {
            const newDate = new Date(dateString + 'T12:00:00') // Adicionar horário para evitar problemas de timezone
            onDateSelect(newDate)
        }
    }

    return (
        <div className="mx-0 lg:mx-4 mt-2 transition-all duration-300">
            {/* Versão Mobile - Input de Data Simples */}
            <div className="block lg:hidden px-3">
                <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-medium mb-1">
                        DATA
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={(e) => handleDateInputChange(e.target.value)}
                        className="w-full max-w-none box-border bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors duration-200 [-webkit-appearance:none] [appearance:none]"
                    />
                </div>
            </div>

            {/* Versão Desktop Completa */}
            <div className="hidden lg:block bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/40 dark:to-slate-900/40 rounded-lg overflow-x-hidden border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm shadow-md p-3">
                <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onMonthNavigate('prev')}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </Button>

                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 tracking-wide">
                            {calendarDate.toLocaleDateString('pt-BR', {
                                month: 'long',
                                year: 'numeric'
                            }).toUpperCase()}
                        </span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onMonthNavigate('next')}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 group"
                        >
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </div>

                    <div className="text-center mb-2 bg-slate-100 dark:bg-slate-800/40 rounded-md py-1.5 px-2 border border-slate-200 dark:border-slate-700/20">
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            {selectedDate.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </span>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                        <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                        {/* Espaços vazios para alinhamento do primeiro dia */}
                        {Array.from({ length: getFirstDayOfMonth(calendarDate) }, (_, i) => (
                            <div key={`empty-${i}`} className="h-7 lg:h-7"></div>
                        ))}

                        {/* Dias do mês */}
                        {Array.from({ length: getDaysInMonth(calendarDate) }, (_, i) => {
                            const day = i + 1
                            return (
                                <Button
                                    key={day}
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onDateSelect(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day))}
                                    className={`h-7 w-7 lg:h-7 lg:w-7 rounded-lg text-xs font-semibold transition-all duration-200 ${isSelectedDate(day)
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/30 scale-105 ring-1 ring-emerald-400/30'
                                        : isToday(day)
                                            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/30 hover:to-emerald-600/20 dark:hover:from-emerald-500/40 dark:hover:to-emerald-600/30 border border-emerald-500/40 dark:border-emerald-500/60'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {day}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
