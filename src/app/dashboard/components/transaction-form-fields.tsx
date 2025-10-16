'use client';

import { memo } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { TransactionFormData, formatters } from '@/lib/schemas';
import { CustomSelect } from '@/components/ui/select';
import { useMemo } from 'react';

interface TransactionFormFieldsProps {
  control: Control<any>; // Tornando mais flexível
  errors: FieldErrors<any>;
  filteredCategories: any[];
  allCategories?: any[]; // Todas as categorias para buscar a atual
  selectedTransactionType: string;
  hasCouple?: boolean; // Adicionar flag se tem casal
}

export const TransactionFormFields = memo(function TransactionFormFields({
  control,
  errors,
  filteredCategories,
  allCategories = [],
  selectedTransactionType,
  hasCouple = false,
}: TransactionFormFieldsProps) {
  return (
    <div className="space-y-2.5 lg:space-y-2.5">
      {/* Campo oculto para data */}
      <Controller
        name="transaction_date"
        control={control}
        render={({ field }) => <input {...field} type="hidden" />}
      />

      {/* Campo Valor */}
      <div>
        <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
          VALOR
        </Label>
        <Controller
          name="valor"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500 dark:text-slate-400 text-base font-medium">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={field.value ?? ''}
                onChange={e => field.onChange(formatters.maskCurrency(e.target.value))}
                placeholder="0,00"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg pl-12 pr-4 py-3 lg:py-2.5 text-base lg:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors duration-150"
                aria-invalid={!!errors.valor}
              />
            </div>
          )}
        />
        {errors.valor && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            {String(errors.valor?.message || '')}
          </p>
        )}
      </div>

      {/* Campo Título */}
      <div>
        <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
          TÍTULO
        </Label>
        <Controller
          name="titulo"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Digite o título"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-3 lg:py-2.5 text-base lg:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors duration-150"
            />
          )}
        />
        {errors.titulo && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            {String(errors.titulo?.message || '')}
          </p>
        )}
      </div>

      {/* Campo Categoria */}
      <div>
        <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
          CATEGORIA
        </Label>
        <Controller
          name="categoria"
          control={control}
          render={({ field }) => {
            // Criar opções incluindo categoria atual se não estiver na lista filtrada
            const options = useMemo(() => {
              if (!filteredCategories.length) return [];

              // Separar "Sem Categoria" e outras categorias do tipo atual
              const semCategoria = filteredCategories.find(
                cat => cat.name === 'Sem Categoria' && cat.is_system === true
              );

              const outrasCategories = filteredCategories
                .filter(cat => !(cat.name === 'Sem Categoria' && cat.is_system === true))
                .map(cat => ({
                  value: cat.id,
                  label: cat.name,
                  icon: cat.icon,
                }));

              const baseOptions = [];

              // "Sem Categoria" sempre primeiro
              if (semCategoria) {
                baseOptions.push({
                  value: semCategoria.id,
                  label: semCategoria.name,
                  icon: semCategoria.icon,
                });
              }

              // Se há um valor selecionado que não está nas categorias filtradas,
              // adicionar essa categoria às opções (importante para edição)
              if (field.value) {
                const valorJaExiste = filteredCategories.some(cat => cat.id === field.value);

                if (!valorJaExiste) {
                  // Buscar a categoria em todas as categorias
                  const categoriaAtual = allCategories.find(cat => cat.id === field.value);

                  if (categoriaAtual) {
                    baseOptions.push({
                      value: categoriaAtual.id,
                      label: `${categoriaAtual.name} (${categoriaAtual.type})`,
                      icon: categoriaAtual.icon,
                    });
                  }
                }
              }

              // Outras categorias em seguida
              baseOptions.push(...outrasCategories);

              return baseOptions;
            }, [filteredCategories, allCategories, field.value]);

            // Obter categoria padrão "Sem Categoria" diretamente das opções filtradas
            const semCategoriaOption = options.find(opt => opt.label === 'Sem Categoria');
            const defaultCategoryId = semCategoriaOption?.value || null;

            // Usar o valor do campo, ou o padrão "Sem Categoria", ou vazio
            const currentValue = field.value || defaultCategoryId || '';

            return (
              <CustomSelect
                options={options}
                value={currentValue}
                onValueChange={field.onChange}
                placeholder="Selecione a categoria"
              />
            );
          }}
        />
        {errors.categoria && (
          <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">
            {String(errors.categoria?.message || '')}
          </p>
        )}
      </div>

      {/* Campo Privacidade */}
      <div>
        <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
          PRIVACIDADE
        </Label>
        <Controller
          name="privacidade"
          control={control}
          render={({ field }) => (
            <CustomSelect
              options={
                hasCouple
                  ? [
                    { value: 'casal', label: '👫 Casal' },
                    { value: 'privado', label: '🔒 Somente Eu' },
                  ]
                  : [{ value: 'privado', label: '🔒 Somente Eu' }]
              }
              value={hasCouple ? field.value || '' : 'privado'}
              onValueChange={hasCouple ? field.onChange : () => field.onChange('privado')}
              placeholder={hasCouple ? 'Selecione a privacidade' : '🔒 Somente Eu'}
            />
          )}
        />
        {errors.privacidade && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            {String(errors.privacidade?.message || '')}
          </p>
        )}
      </div>

      {/* Campo de parcelas - somente para tipo parcela */}
      {selectedTransactionType === 'parcela' && (
        <div>
          <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
            PARCELAS
          </Label>
          <Controller
            name="installments"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                inputMode="numeric"
                min="2"
                max="60"
                placeholder="Nº parcelas"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-3 lg:py-2.5 text-base lg:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none transition-colors duration-150"
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            )}
          />
        </div>
      )}

      {/* Campo de frequência - somente para tipo assinado */}
      {selectedTransactionType === 'assinado' && (
        <div>
          <Label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
            FREQUÊNCIA
          </Label>
          <Controller
            name="recurring_frequency"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={[
                  { value: 'daily', label: 'Diário' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensal' },
                  { value: 'yearly', label: 'Anual' },
                ]}
                value={field.value || ''}
                onValueChange={field.onChange}
                placeholder="Selecione a frequência"
              />
            )}
          />
        </div>
      )}
    </div>
  );
});
