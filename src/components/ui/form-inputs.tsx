// ===============================================
// COMPONENTES DE INPUT CUSTOMIZADOS
// ===============================================

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { formatters } from '@/lib/schemas';
import { cn } from '@/lib/utils';

// Input base com suporte ao React Hook Form
interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, error, helperText, required, leftIcon, rightIcon, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-200 tracking-tight">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-150">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-150 bg-slate-800/60 text-slate-100 backdrop-blur-md shadow-sm text-sm
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                hasError
                  ? 'border-red-500/50 bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-700/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-600/60'
              }
              focus:outline-none focus:shadow-lg
              disabled:bg-slate-700/30 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-700/20
              placeholder:text-slate-500
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-150">
              {rightIcon}
            </div>
          )}

          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className={`text-sm ${hasError ? 'text-red-400' : 'text-slate-400'}`}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Input de moeda com formatação automática
interface CurrencyInputProps extends Omit<BaseInputProps, 'type' | 'onChange'> {
  onChange?: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => {
      if (typeof value === 'string' && value) {
        const numValue = parseFloat(value.replace(',', '.'));
        return isNaN(numValue) ? '' : formatters.currency(numValue);
      }
      return '';
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove tudo que não é número ou vírgula
      const cleanValue = inputValue.replace(/[^\d,]/g, '');

      if (cleanValue === '') {
        setDisplayValue('');
        onChange?.('');
        return;
      }

      // Formata o valor
      const maskedValue = formatters.maskCurrency(cleanValue.replace(',', ''));
      setDisplayValue(maskedValue);

      // Envia o valor não formatado para o form
      const rawValue = cleanValue.replace(',', '.');
      onChange?.(rawValue);
    };

    return (
      <FormInput
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="0,00"
        leftIcon={<span className="text-sm font-medium">R$</span>}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

// Input de senha com toggle de visibilidade
interface PasswordInputProps {
  label: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function PasswordInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className = '',
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide transition-colors duration-150">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 dark:border-slate-700/40 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-150',
            error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-150"
        >
          {showPassword ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// Select customizado
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, placeholder, className, required, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-200 tracking-tight">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          <select
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-150 appearance-none bg-slate-800/60 text-slate-100 backdrop-blur-md shadow-sm text-sm
              ${
                hasError
                  ? 'border-red-500/50 bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-700/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-600/60'
              }
              focus:outline-none focus:shadow-lg
              disabled:bg-slate-700/30 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-700/20
              pr-10
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-slate-800 text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none group-focus-within:text-emerald-400 transition-colors duration-150">
            <svg
              className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {hasError && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-400 animate-pulse">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className={`text-sm ${hasError ? 'text-red-400' : 'text-slate-400'}`}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Textarea customizado
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    { label, error, helperText, showCharCount, maxLength, className, required, value, ...props },
    ref
  ) => {
    const hasError = !!error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-200 tracking-tight">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          <textarea
            ref={ref}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-150 resize-vertical min-h-[80px] bg-slate-800/60 text-slate-100 backdrop-blur-md shadow-sm text-sm
              ${
                hasError
                  ? 'border-red-500/50 bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-700/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-600/60'
              }
              focus:outline-none focus:shadow-lg
              disabled:bg-slate-700/30 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-700/20
              placeholder:text-slate-500
              ${className}
            `}
            value={value}
            {...props}
          />

          {hasError && (
            <div className="absolute right-3 top-3 text-red-400 animate-pulse">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className={`text-sm ${hasError ? 'text-red-400' : 'text-slate-400'}`}>
            {error || helperText}
          </div>

          {showCharCount && maxLength && (
            <div
              className={`text-sm font-medium ${charCount > maxLength * 0.9 ? 'text-orange-400' : 'text-slate-500'}`}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
