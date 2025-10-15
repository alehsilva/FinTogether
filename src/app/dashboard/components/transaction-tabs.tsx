'use client'

import { memo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TransactionTabsProps {
    activeTab: 'receita' | 'despesa'
    onTabChange: (tab: 'receita' | 'despesa') => void
    disabled?: boolean // Desabilitar mudança de aba durante edição
}

export const TransactionTabs = memo(function TransactionTabs({ activeTab, onTabChange, disabled = false }: TransactionTabsProps) {
    const handleTabChange = (value: string) => {
        // Se está disabled, não faz NADA
        if (disabled) {
            return;
        }

        // Se o valor é o mesmo que já está ativo, não faz nada
        if (value === activeTab) {
            return;
        }

        onTabChange(value as 'receita' | 'despesa');
    };

    return (
        <div className="px-4 lg:px-4 mt-2 mb-1">
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
            >
                <TabsList className={`grid w-full grid-cols-2 bg-white dark:bg-slate-800/60 backdrop-blur-md p-1.5 h-auto rounded-xl border border-slate-200 dark:border-slate-700/30 shadow-md transition-colors duration-300 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <TabsTrigger
                        value="despesa"
                        disabled={disabled}
                        className="py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/30 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 disabled:cursor-not-allowed disabled:opacity-100"
                    >
                        DESPESA
                    </TabsTrigger>
                    <TabsTrigger
                        value="receita"
                        disabled={disabled}
                        className="py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 disabled:cursor-not-allowed disabled:opacity-100"
                    >
                        RECEITA
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
});
