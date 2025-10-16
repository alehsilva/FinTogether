// Serviço de transações

import type { Transaction, TransactionForm, TransactionFilters } from '@/models/financial';
import type { Database } from '@/models/database';
import { supabase } from '../lib/supabase';
import { getMonthlyRange, getLocalDateString, parseLocalDate } from '@/lib/utils';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export class TransactionService {
  // Cache leve em memória para evitar consultas repetidas de casal por email
  private static coupleIdCache: Map<string, { id: string; ts: number }> = new Map();
  private static readonly COUPLE_CACHE_TTL = 60_000; // 60s
  private static backfillRanForUser: Set<string> = new Set();

  // =====================
  // Helpers internos
  // =====================
  private static selectWithJoins(includeCount: boolean = true) {
    return supabase.from('transactions').select(
      `
        *,
        category:categories(*)
      `,
      { count: includeCount ? 'exact' : (undefined as any) }
    );
  }

  private static applyDateFilters(query: any, filters: TransactionFilters = {}) {
    if (filters.start_date) query = query.gte('transaction_date', filters.start_date);
    if (filters.end_date) query = query.lte('transaction_date', filters.end_date);
    return query;
  }

  // Mapear tipos de transação do frontend para o banco
  private static mapSpecialType(
    type: 'simples' | 'parcela' | 'assinado'
  ): 'simples' | 'parcela' | 'assinado' {
    return type; // Agora os tipos são iguais entre frontend e banco
  }

  // Garantir que o usuário existe na tabela users usando função SQL
  private static async ensureUserExists(userId: string) {
    try {
      // Usar função SQL que tem permissões adequadas
      const { data, error } = await supabase.rpc('ensure_user_exists', { user_uuid: userId });

      if (error) {
        console.warn('Erro ao garantir usuário existe:', error.message);
      }

      if (data === false) {
        throw new Error('Usuário não encontrado no sistema de autenticação');
      }
    } catch (error) {
      console.warn('Não foi possível sincronizar usuário:', error);
      // Continuar mesmo se falhar - a foreign key vai pegar se realmente houver problema
    }
  }
  private static applyOptionalFilters(
    query: any,
    filters: TransactionFilters = {},
    options?: { includePrivacy?: boolean }
  ) {
    if (filters.type) query = query.eq('type', filters.type);
    if (options?.includePrivacy && filters.privacy) query = query.eq('privacy', filters.privacy);
    if (filters.category_ids && filters.category_ids.length > 0)
      query = query.in('category_id', filters.category_ids);
    if (filters.account_ids && filters.account_ids.length > 0)
      query = query.in('account_id', filters.account_ids);
    if (filters.min_amount) query = query.gte('amount', filters.min_amount);
    if (filters.max_amount) query = query.lte('amount', filters.max_amount);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search_term)
      query = query.or(
        `title.ilike.%${filters.search_term}%,description.ilike.%${filters.search_term}%`
      );
    return query;
  }

  private static applyOrderingAndPagination(query: any, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return query.order('transaction_date', { ascending: false }).range(offset, offset + limit - 1);
  }

  private static getCachedCoupleId(email: string): string | null {
    const rec = this.coupleIdCache.get(email);
    if (!rec) return null;
    if (Date.now() - rec.ts > this.COUPLE_CACHE_TTL) {
      this.coupleIdCache.delete(email);
      return null;
    }
    return rec.id;
  }

  private static setCachedCoupleId(email: string, id: string) {
    this.coupleIdCache.set(email, { id, ts: Date.now() });
  }

  // Helper: obter couple_id ativo do usuário logado usando cache
  private static async getActiveCoupleIdForCurrentUser(): Promise<string | null> {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData.user?.email ?? null;
    if (!email) return null;

    const cached = this.getCachedCoupleId(email);
    if (cached) return cached;

    const { data: couple, error } = await supabase
      .from('couples')
      .select('id')
      .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
      .eq('status', 'active')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao identificar casal: ${error.message}`);
    }
    if (couple?.id) {
      this.setCachedCoupleId(email, couple.id);
      return couple.id;
    }
    return null;
  }

  // Após ativação do casal, garantir que transações antigas "casal" do usuário tenham couple_id
  private static async ensureBackfillForActiveCouple(userId: string) {
    if (this.backfillRanForUser.has(userId)) return;
    const coupleId = await this.getActiveCoupleIdForCurrentUser();
    if (!coupleId) return;
    try {
      await supabase
        .from('transactions')
        .update({ couple_id: coupleId })
        .eq('user_id', userId)
        .eq('privacy', 'casal')
        .is('couple_id', null);
      this.backfillRanForUser.add(userId);
    } catch {
      // ignore
    }
  }

  /**
   * Buscar transações com filtros
   */
  static async getTransactions(
    userId: string,
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 50,
    selectedView?: 'casal' | 'ele' | 'ela'
  ) {
    if (selectedView === 'casal') {
      await this.ensureBackfillForActiveCouple(userId);
    }
    let query = this.selectWithJoins(true).limit(limit);

    // Filtragem por visão
    if (selectedView === 'casal') {
      const coupleId = await this.getActiveCoupleIdForCurrentUser();
      query = query.eq('privacy', 'casal');
      if (coupleId) {
        // Casal ativo: pegar do casal e também "casal" sem couple_id do próprio usuário (histórico)
        query = query.or(
          `couple_id.eq.${coupleId},and(user_id.eq.${userId},couple_id.is.null)`
        ) as any;
      } else {
        // Sem casal ainda: mostrar os "casal" lançados pelo próprio usuário (couple_id null)
        query = query.eq('user_id', userId).is('couple_id', null);
      }
    } else if (selectedView === 'ele') {
      // ELE: mostrar APENAS transações privadas do usuário (não incluir "casal")
      query = query.eq('user_id', userId).eq('privacy', 'privado');
    } else if (selectedView === 'ela') {
      // ELA: não deve mostrar "casal" — apenas privados do usuário (até mapearmos o parceiro)
      query = query.eq('user_id', userId).eq('privacy', 'privado');
    } else {
      // Padrão: apenas privadas do usuário
      query = query.eq('user_id', userId).eq('privacy', 'privado');
    }

    // Aplicar filtros
    query = this.applyDateFilters(query, filters);
    query = this.applyOptionalFilters(query, filters, { includePrivacy: true });

    // Paginação e ordenação
    query = this.applyOrderingAndPagination(query, page, limit);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }

    return {
      transactions: data as Transaction[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // [REMOVIDO] getTransactionsSuperset - não é mais utilizado pelo hook centralizado

  /**
   * Criar nova transação
   */
  static async createTransaction(userId: string, transaction: TransactionForm) {
    // Tentar garantir usuário existe, mas não bloquear se falhar
    try {
      await this.ensureUserExists(userId);
    } catch (error) {
      console.warn('Não foi possível sincronizar usuário, continuando...', error);
    }

    // Verificar se a data é futura para definir status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactionDate = parseLocalDate(transaction.transaction_date);
    transactionDate.setHours(0, 0, 0, 0);
    const isFuture = transactionDate > today;

    // Verificar se podemos inserir transação (testar se userId existe no auth)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser || authUser.id !== userId) {
      throw new Error('Usuário não autenticado');
    }

    // Construir payload permitindo account_id opcional (não enviar "")
    const transactionData: any = {
      user_id: userId,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      privacy: transaction.privacy,
      category_id: transaction.category_id,
      transaction_date: transaction.transaction_date,
      description: transaction.description || null,
      payment_method: transaction.payment_method || null,
      location: transaction.location || null,
      tags: transaction.tags || null,
      status: isFuture ? 'pending' : 'completed',
      special_type: this.mapSpecialType(transaction.special_type ?? 'simples'),
      installments: transaction.installments ?? 1,
      installment_number: transaction.installment_number ?? 1,
      parent_transaction_id: transaction.parent_transaction_id ?? null,
      recurring_rule_id: transaction.recurring_rule_id ?? null,
    };

    // Não usar contas por enquanto - definir como null
    transactionData.account_id = transaction.account_id || null;

    // Se é transação do casal, definir couple_id
    if (transaction.privacy === 'casal') {
      const coupleId = await this.getActiveCoupleIdForCurrentUser();
      if (coupleId) transactionData.couple_id = coupleId;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    return data as Transaction;
  }

  /**
   * Atualizar transação
   */
  static async updateTransaction(
    transactionId: string,
    userId: string,
    updates: Partial<TransactionForm>
  ) {
    // Verificar se o usuário pode editar esta transação
    const { data: existingTransaction, error: checkError } = await supabase
      .from('transactions')
      .select('user_id, privacy, couple_id')
      .eq('id', transactionId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar transação: ${checkError.message}`);
    }

    // Só pode editar se for o dono da transação
    if (existingTransaction.user_id !== userId) {
      throw new Error('Você não tem permissão para editar esta transação');
    }

    // Sanitizar updates para remover account_id nulo/vazio
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updateData.account_id === '' || updateData.account_id === null) {
      delete updateData.account_id;
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select(`
        *,
        category:categories(*),
        account:accounts(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }

    return data as Transaction;
  }

  /**
   * Deletar transação
   */
  static async deleteTransaction(transactionId: string, userId: string) {
    // Verificar permissão
    const { data: existingTransaction, error: checkError } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', transactionId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar transação: ${checkError.message}`);
    }

    if (existingTransaction.user_id !== userId) {
      throw new Error('Você não tem permissão para deletar esta transação');
    }

    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Atualizar apenas o status da transação (ex: pending → completed)
   */
  static async updateTransactionStatus(
    transactionId: string,
    userId: string,
    newStatus: 'pending' | 'completed' | 'cancelled'
  ) {
    // Verificar permissão
    const { data: existingTransaction, error: checkError } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', transactionId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar transação: ${checkError.message}`);
    }

    if (existingTransaction.user_id !== userId) {
      throw new Error('Você não tem permissão para alterar esta transação');
    }

    // Atualizar status
    const { data, error } = await supabase
      .from('transactions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Transação não encontrada ou sem permissão');
    }

    return data[0] as Transaction;
  }

  // [REMOVIDO] getFinancialSummary e getFinancialSummaryForRange - não são mais utilizados pelo hook centralizado

  /**
   * Obter estatísticas por categoria
   */
  static async getCategoryStats(userId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const targetMonth = month ?? currentDate.getMonth() + 1;
    const targetYear = year ?? currentDate.getFullYear();

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const endDate = getLocalDateString(new Date(targetYear, targetMonth, 0));

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        category:categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .eq('status', 'completed');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    // Agrupar por categoria
    const categoryMap = new Map();
    let totalAmount = 0;

    data.forEach((transaction: any) => {
      const category = transaction.category;
      const amount = transaction.amount;

      if (category) {
        const key = category.id;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            category_id: category.id,
            category_name: category.name,
            category_icon: category.icon,
            category_color: category.color,
            total_amount: 0,
            transaction_count: 0,
          });
        }

        const categoryData = categoryMap.get(key);
        categoryData.total_amount += amount;
        categoryData.transaction_count += 1;
        totalAmount += amount;
      }
    });

    // Calcular percentuais
    const categoryStats = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      percentage_of_total: totalAmount > 0 ? (cat.total_amount / totalAmount) * 100 : 0,
      trend: 'stable' as const, // TODO: Implementar cálculo de trend
    }));

    return categoryStats.sort((a, b) => b.total_amount - a.total_amount);
  }
}
