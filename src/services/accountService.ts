// ===============================================
// SERVIÇO DE CONTAS - CONTA PADRÃO POR USUÁRIO
// ===============================================

import { supabase } from '@/lib/supabase'

export class AccountService {
  /**
   * Retorna a conta padrão do usuário se existir, senão cria.
   */
  static async getOrCreateDefaultAccount(userId: string): Promise<string> {
    // Tentar encontrar conta padrão por nome fixo
    const { data: existing, error: findError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Conta Padrão')
      .maybeSingle()

    if (!findError && existing?.id) return existing.id

    // Criar conta padrão
    const { data: created, error: createError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        couple_id: null,
        name: 'Conta Padrão',
        type: 'cash',
        bank_name: null,
        initial_balance: 0,
        current_balance: 0,
        credit_limit: 0,
        is_shared: false,
        is_active: true,
        color: '#64748B',
        icon: 'wallet'
      })
      .select('id')
      .single()

    if (createError || !created?.id) {
      throw new Error(`Erro ao garantir conta padrão: ${createError?.message || 'desconhecido'}`)
    }

    return created.id
  }
}
