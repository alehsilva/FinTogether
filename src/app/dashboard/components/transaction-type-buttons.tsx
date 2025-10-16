'use client';

import { Button } from '@/components/ui/button';

interface TransactionTypeButtonsProps {
  selectedType: 'simples' | 'parcela' | 'assinado';
  onTypeChange: (type: 'simples' | 'parcela' | 'assinado') => void;
  disabled?: boolean;
  isEditing?: boolean;
  transactionCategory?: 'receita' | 'despesa'; // Adicionar categoria para lógica de tipos
}

export function TransactionTypeButtons({
  selectedType,
  onTypeChange,
  disabled = false,
  isEditing = false,
  transactionCategory = 'despesa',
}: TransactionTypeButtonsProps) {
  // Regras de tipos de transação:
  // - SIMPLES: Disponível para receitas e despesas (padrão)
  // - PARCELA: Disponível para DESPESAS (compras parceladas, financiamentos)
  // - ASSINADO: Disponível para ambos (Netflix, salário, etc)

  const parcelaDisponivel = transactionCategory === 'despesa';

  return (
    <div>
      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
        TIPO DE TRANSAÇÃO
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('assinado')}
          disabled={disabled || isEditing}
          className={`py-3 lg:py-2 px-2 rounded-lg text-sm lg:text-xs font-bold tracking-wide transition-all duration-150 border ${disabled || isEditing
            ? 'bg-slate-100 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700/30'
            : selectedType === 'assinado'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-slate-700 dark:to-slate-800 text-white border-emerald-600 dark:border-slate-600 shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/40 scale-[1.02]'
              : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600/50'
            }`}
        >
          ASS.
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('parcela')}
          disabled={disabled || isEditing || !parcelaDisponivel}
          className={`py-3 lg:py-2 px-2 rounded-lg text-sm lg:text-xs font-bold tracking-wide transition-all duration-150 border ${disabled || isEditing || !parcelaDisponivel
            ? 'bg-slate-100 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700/30'
            : selectedType === 'parcela'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-slate-700 dark:to-slate-800 text-white border-emerald-600 dark:border-slate-600 shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/40 scale-[1.02]'
              : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600/50'
            }`}
          title={!parcelaDisponivel ? 'Parcelas disponíveis apenas para despesas' : 'Dividir em parcelas'}
        >
          PARC.
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('simples')}
          disabled={disabled}
          className={`py-3 lg:py-2 px-2 rounded-lg text-sm lg:text-xs font-bold tracking-wide transition-all duration-150 border ${disabled
            ? 'bg-slate-100 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700/30'
            : selectedType === 'simples'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-slate-700 dark:to-slate-800 text-white border-emerald-600 dark:border-slate-600 shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/40 scale-[1.02]'
              : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600/50'
            }`}
        >
          SIMPLES
        </Button>
      </div>
    </div>
  );
}
