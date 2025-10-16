// Serviço para tipos de transações especiais

import type { TransactionForm, RecurringRule } from '@/models/financial';
import { TransactionService } from './transactionService';
import { supabase } from '../lib/supabase';
import { getLocalDateString, parseLocalDate } from '@/lib/utils';

export class TransactionTypeService {
  /**
   * Criar transação baseada no tipo
   */
  static async createTypedTransaction(userId: string, transactionData: TransactionForm) {
    switch (transactionData.special_type) {
      case 'simples':
        return this.createSimpleTransaction(userId, transactionData);

      case 'parcela':
        return this.createInstallmentTransaction(userId, transactionData);

      case 'assinado':
        return this.createRecurringTransaction(userId, transactionData);

      default:
        throw new Error('Tipo de transação não suportado');
    }
  }

  /**
   * Criar transação simples (padrão)
   */
  private static async createSimpleTransaction(userId: string, data: TransactionForm) {
    return TransactionService.createTransaction(userId, {
      ...data,
      special_type: 'simples',
      installments: 1,
      installment_number: 1,
    });
  }

  /**
   * Criar transação parcelada (BATCH INSERT para performance)
   */
  private static async createInstallmentTransaction(userId: string, data: TransactionForm) {
    const installments = data.installments || 1;
    const installmentAmount = data.amount / installments;

    // Preparar todas as parcelas em batch
    const batchData = [];
    const today = getLocalDateString();

    for (let i = 1; i <= installments; i++) {
      const installmentDate = parseLocalDate(data.transaction_date);
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

      const dateString = getLocalDateString(installmentDate);
      const isFuture = dateString > today;

      batchData.push({
        user_id: userId,
        title: `${data.title} (Parcela ${i}/${installments})`,
        amount: installmentAmount,
        type: data.type,
        privacy: data.privacy,
        category_id: data.category_id,
        account_id: data.account_id || null,
        transaction_date: dateString,
        special_type: 'parcela',
        installments,
        installment_number: i,
        status: isFuture ? 'pending' : 'completed', // Futuras pending, passadas/hoje completed
      });
    }

    // Insert em batch (muito mais rápido)
    const { data: transactions, error } = await supabase
      .from('transactions')
      .insert(batchData)
      .select();

    if (error) throw new Error(`Erro ao criar parcelas: ${error.message}`);

    return { installments: transactions, total: installments, installmentAmount };
  }

  /**
   * Criar transação recorrente (BATCH INSERT para performance)
   */
  private static async createRecurringTransaction(userId: string, data: TransactionForm) {
    // Criar regra de recorrência primeiro
    const recurringRule = await this.createRecurringRule(userId, data);

    const frequency = data.recurring_frequency || 'monthly';
    const numberOfOccurrences = 12; // 1 ano

    // Preparar todas as transações em batch
    const batchData = [];
    const today = getLocalDateString();

    for (let i = 0; i < numberOfOccurrences; i++) {
      const transactionDate = parseLocalDate(data.transaction_date);

      switch (frequency) {
        case 'daily':
          transactionDate.setDate(transactionDate.getDate() + i);
          break;
        case 'weekly':
          transactionDate.setDate(transactionDate.getDate() + i * 7);
          break;
        case 'monthly':
          transactionDate.setMonth(transactionDate.getMonth() + i);
          break;
        case 'yearly':
          transactionDate.setFullYear(transactionDate.getFullYear() + i);
          break;
      }

      const dateString = getLocalDateString(transactionDate);
      const isFuture = dateString > today;

      batchData.push({
        user_id: userId,
        title: `${data.title} (${i === 0 ? 'Atual' : 'Recorrência ' + (i + 1)})`,
        amount: data.amount,
        type: data.type,
        privacy: data.privacy,
        category_id: data.category_id,
        account_id: data.account_id || null,
        transaction_date: dateString,
        special_type: 'assinado',
        recurring_rule_id: recurringRule.id,
        status: isFuture ? 'pending' : 'completed', // Futuras pending, passadas/hoje completed
      });
    }

    // Insert em batch (muito mais rápido)
    const { data: transactions, error } = await supabase
      .from('transactions')
      .insert(batchData)
      .select();

    if (error) throw new Error(`Erro ao criar recorrências: ${error.message}`);

    return { transactions, recurringRule, total: numberOfOccurrences };
  }

  /**
   * Criar regra de recorrência
   */
  private static async createRecurringRule(
    userId: string,
    data: TransactionForm
  ): Promise<RecurringRule> {
    // Para a nova lógica, a regra é apenas para controle - as transações já foram criadas
    const frequency = data.recurring_frequency || 'monthly';

    // Calcular próxima data (1 ano à frente, já que criamos 12 meses)
    const nextExecutionDate = parseLocalDate(data.transaction_date);
    nextExecutionDate.setFullYear(nextExecutionDate.getFullYear() + 1);

    const { data: rule, error } = await supabase
      .from('recurring_rules')
      .insert({
        user_id: userId,
        couple_id: null,
        title: data.title,
        description: data.description || null,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id || null,
        account_id: data.account_id || null,
        payment_method: data.payment_method || null,
        location: data.location || null,
        tags: data.tags || [],
        privacy: data.privacy || 'privado',
        frequency,
        interval_count: 1,
        start_date: data.transaction_date,
        next_execution_date: getLocalDateString(nextExecutionDate),
        execution_count: 12, // Já criamos 12 transações
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar regra de recorrência: ${error.message}`);
    }

    return rule as RecurringRule;
  }

  /**
   * Calcular próxima data de execução
   */
  private static calculateNextExecutionDate(currentDate: Date, frequency: string): string {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return getLocalDateString(nextDate); // Retorna apenas a data (YYYY-MM-DD)
  }

  /**
   * Gerar label para frequência
   */
  private static getFrequencyLabel(frequency: string, index: number): string {
    switch (frequency) {
      case 'daily':
        return `Dia ${index + 1}`;
      case 'weekly':
        return `Semana ${index + 1}`;
      case 'monthly':
        return `Mês ${index + 1}`;
      case 'yearly':
        return `Ano ${index + 1}`;
      default:
        return `Ocorrência ${index + 1}`;
    }
  }

  /**
   * Pausar/reativar recorrência
   */
  static async toggleRecurringRule(ruleId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('recurring_rules')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar regra: ${error.message}`);
    }

    return data;
  }

  /**
   * Processar regras (simplificado - já criamos em batch)
   */
  static async processRecurringRules(
    userId?: string
  ): Promise<{ processed: number; errors: any[] }> {
    // Como criamos todas as transações em batch, só precisamos verificar regras expiradas
    const { data: expiredRules, error } = await supabase
      .from('recurring_rules')
      .select('id')
      .eq('is_active', true)
      .lt('next_execution_date', getLocalDateString());

    if (error) return { processed: 0, errors: [error] };

    // Desativar regras expiradas (performance otimizada)
    if (expiredRules?.length > 0) {
      await supabase
        .from('recurring_rules')
        .update({ is_active: false })
        .in(
          'id',
          expiredRules.map(r => r.id)
        );
    }

    return { processed: expiredRules?.length || 0, errors: [] };
  }

  /**
   * Excluir transação com opções (para parcelas e assinaturas)
   */
  static async deleteTransactionWithOptions(
    userId: string,
    transactionId: string,
    deleteOption: 'single' | 'all'
  ) {
    // Buscar a transação para saber o tipo
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, recurring_rule_id, special_type, installments')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error || !transaction) {
      throw new Error('Transação não encontrada');
    }

    // Se for simples, sempre excluir apenas ela
    if (transaction.special_type === 'simples') {
      return TransactionService.deleteTransaction(transactionId, userId);
    }

    // Se escolheu excluir apenas uma
    if (deleteOption === 'single') {
      return TransactionService.deleteTransaction(transactionId, userId);
    }

    // Se escolheu excluir todas
    if (deleteOption === 'all') {
      if (transaction.special_type === 'parcela') {
        return this.deleteAllInstallments(userId, transaction);
      } else if (transaction.special_type === 'assinado') {
        return this.deleteAllRecurring(userId, transaction);
      }
    }

    throw new Error('Opção de exclusão inválida');
  }

  /**
   * Excluir todas as parcelas de um parcelamento
   */
  private static async deleteAllInstallments(userId: string, transaction: any) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('special_type', 'parcela')
      .eq('installments', transaction.installments)
      .ilike('title', `${transaction.title.split('(')[0].trim()}%`);

    if (error) {
      throw new Error(`Erro ao excluir parcelas: ${error.message}`);
    }

    return { success: true, message: 'Todas as parcelas foram excluídas' };
  }

  /**
   * Excluir toda a série de recorrências
   */
  private static async deleteAllRecurring(userId: string, transaction: any) {
    // Excluir todas as transações da regra
    const { error: deleteTransactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('recurring_rule_id', transaction.recurring_rule_id);

    if (deleteTransactionsError) {
      throw new Error(`Erro ao excluir recorrências: ${deleteTransactionsError.message}`);
    }

    // Excluir a regra de recorrência
    const { error: deleteRuleError } = await supabase
      .from('recurring_rules')
      .delete()
      .eq('id', transaction.recurring_rule_id)
      .eq('user_id', userId);

    if (deleteRuleError) {
      throw new Error(`Erro ao excluir regra: ${deleteRuleError.message}`);
    }

    return { success: true, message: 'Toda a série de recorrências foi excluída' };
  }

  /**
   * Verificar se transação precisa de modal de exclusão
   */
  static async needsDeleteModal(
    transactionId: string,
    userId: string
  ): Promise<{
    needsModal: boolean;
    type: 'simples' | 'parcela' | 'assinado';
    title: string;
  }> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('special_type, title')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error || !transaction) {
      throw new Error('Transação não encontrada');
    }

    return {
      needsModal: transaction.special_type !== 'simples',
      type: transaction.special_type,
      title: transaction.title,
    };
  }
}
