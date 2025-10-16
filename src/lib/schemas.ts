// ===============================================
// SCHEMAS DE VALIDAÇÃO PARA FORMULÁRIOS
// ===============================================

import { z } from 'zod';

// Schema para transação
export const transactionSchema = z.object({
  valor: z
    .string()
    .trim()
    .min(1, 'Valor é obrigatório')
    .refine((val: string) => {
      const numVal = formatters.parseCurrency(val);
      return !isNaN(numVal) && numVal > 0;
    }, 'Valor deve ser um número positivo'),

  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),

  categoria: z.string().optional().default(''),

  privacidade: z.enum(['casal', 'privado'], {
    message: 'Selecione uma opção de privacidade',
  }),

  special_type: z
    .enum(['simples', 'parcela', 'assinado'], {
      message: 'Selecione o tipo de transação',
    })
    .default('simples'),

  transaction_date: z.string().min(1, 'Data é obrigatória'),

  installments: z
    .number()
    .min(1, 'Número de parcelas deve ser maior que 0')
    .max(60, 'Máximo de 60 parcelas')
    .optional(),

  recurring_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),

  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),

  metodo_pagamento: z.string().optional(),

  localizacao: z.string().max(200, 'Localização deve ter no máximo 200 caracteres').optional(),

  tags: z.array(z.string()).optional(),
}); // Tipo inferido do schema
export type TransactionFormData = z.infer<typeof transactionSchema>;

// Schema para categoria personalizada
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),

  type: z.enum(['receita', 'despesa'], {
    message: 'Selecione o tipo da categoria',
  }),

  icon: z.string().min(1, 'Ícone é obrigatório'),

  color: z
    .string()
    .min(1, 'Cor é obrigatória')
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal'),

  parent_category_id: z.string().optional(),

  is_couple_category: z.boolean().default(false),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Schema para meta financeira
export const goalSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),

  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),

  target_amount: z
    .string()
    .min(1, 'Valor objetivo é obrigatório')
    .refine(val => {
      const numVal = parseFloat(val.replace(',', '.'));
      return !isNaN(numVal) && numVal > 0;
    }, 'Valor objetivo deve ser um número positivo'),

  target_date: z.string().optional(),

  priority: z.enum(['baixa', 'media', 'alta'], {
    message: 'Selecione uma prioridade',
  }),

  is_shared: z.boolean().default(false),

  auto_transfer: z.boolean().default(false),

  auto_transfer_amount: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      const numVal = parseFloat(val.replace(',', '.'));
      return !isNaN(numVal) && numVal > 0;
    }, 'Valor da transferência deve ser um número positivo'),

  auto_transfer_frequency: z.enum(['mensal', 'quinzenal', 'semanal']).optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// Utilitários para formatação
export const formatters = {
  // Formatar valor para exibição (1234.56 -> "1.234,56")
  currency: (value: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      value
    ),

  // Formatar valor de input (remove formatação)
  parseCurrency: (value: string) => {
    return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'));
  },

  // Formatar input de moeda em tempo real
  maskCurrency: (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) return '';

    // Converte para número e divide por 100 para simular casas decimais
    const numberValue = parseInt(numericValue) / 100;

    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  },
};
