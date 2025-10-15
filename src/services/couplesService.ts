import { supabase } from '@/lib/supabase'

export class CouplesService {
  private static async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw new Error(error.message)
    const id = data.user?.id
    if (!id) throw new Error('Usuário não autenticado')
    return id
  }
  static async getCurrentUserEmail(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw new Error(error.message)
    const email = data.user?.email
    if (!email) throw new Error('Usuário não autenticado')
    return email.toLowerCase()
  }

  static async getCurrentCouple() {
    const email = await this.getCurrentUserEmail()
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data || null
  }

  /**
   * Verifica se existe convite pendente para o usuário atual (ele é o convidado/partner_2)
   */
  static async getPendingInvite() {
    const email = await this.getCurrentUserEmail()
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('status', 'pending')
      .eq('partner_2_email', email)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data || null
  }

  static async requestPair(partnerEmail: string) {
    const userEmail = await this.getCurrentUserEmail()
    const partner = partnerEmail.trim().toLowerCase()
    if (!partner || !partner.includes('@')) throw new Error('Email inválido')
    if (partner === userEmail) throw new Error('Use um email diferente do seu')

    // Verifica se já existe casal entre esses dois emails (qualquer ordem)
    const { data: existingList, error: findErr } = await supabase
      .from('couples')
      .select('*')
      .or(
        `and(partner_1_email.eq.${userEmail},partner_2_email.eq.${partner}),and(partner_1_email.eq.${partner},partner_2_email.eq.${userEmail})`
      )
      .order('updated_at', { ascending: false })
    if (findErr && findErr.code !== 'PGRST116') throw new Error(findErr.message)
    const existing = Array.isArray(existingList) ? existingList[0] : existingList || null

    if (existing) {
      // Se já está ativo, apenas retorna
      if (existing.status === 'active') return existing

      // Mantém como pendente (convite já enviado) ou reabre se inativo, sem auto-aceitar
      if (existing.status === 'inactive') {
        // reabrir convite como pendente atualizando registros mais recentes
        const { data, error } = await supabase
          .from('couples')
          .update({ status: 'pending', partner_1_accepted: false, partner_2_accepted: false, updated_at: new Date().toISOString(), name: existing.name || 'Casal' })
          .eq('id', existing.id)
          .select('*')
          .single()
        if (error) throw new Error(error.message)
        return data
      }
      return existing
    }

    // Cria novo convite com status pendente; partner_1 é quem convida, partner_2 é o convidado
    const { data, error } = await supabase
      .from('couples')
      .insert({
        name: 'Casal',
        partner_1_email: userEmail,
        partner_2_email: partner,
        status: 'pending',
        partner_1_accepted: false,
        partner_2_accepted: false,
        shared_budget_enabled: false,
      })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  /** Aceitar convite pendente para o usuário atual (deve ser o partner_2) */
  static async acceptInvite() {
    const email = await this.getCurrentUserEmail()
    const { data: pending, error } = await supabase
      .from('couples')
      .select('*')
      .eq('status', 'pending')
      .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    if (!pending) throw new Error('Nenhum convite pendente encontrado.')

    const patch: any = { updated_at: new Date().toISOString() }
    const isPartner1 = pending.partner_1_email.toLowerCase() === email.toLowerCase()
    const isPartner2 = pending.partner_2_email.toLowerCase() === email.toLowerCase()
    if (isPartner1) patch.partner_1_accepted = true
    if (isPartner2) patch.partner_2_accepted = true
    const bothAccepted = (isPartner1 ? true : pending.partner_1_accepted) && (isPartner2 ? true : pending.partner_2_accepted)
    if (bothAccepted) patch.status = 'active'

    const { data, error: updErr } = await supabase
      .from('couples')
      .update(patch)
      .eq('id', pending.id)
      .select('*')
      .single()
    if (updErr) throw new Error(updErr.message)
    // Se ativou agora, vincular transações 'casal' antigas (sem couple_id) do usuário atual
    if (data.status === 'active') {
      try {
        const userId = await this.getCurrentUserId()
        await supabase
          .from('transactions')
          .update({ couple_id: data.id })
          .eq('user_id', userId)
          .eq('privacy', 'casal')
          .is('couple_id', null)
      } catch {}
    }
    return data
  }

  /** Recusar/cancelar convite pendente. Se for o convidado (partner_2), recusa; se for quem convidou, cancela. */
  static async declineInvite() {
    const email = await this.getCurrentUserEmail()
    const { data: pending, error } = await supabase
      .from('couples')
      .select('*')
      .eq('status', 'pending')
      .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    if (!pending) return { success: true }

    // Marca como inativo para registrar histórico; alternativa seria deletar
    const { error: updErr } = await supabase
      .from('couples')
      .update({ status: 'inactive', partner_1_accepted: false, partner_2_accepted: false, updated_at: new Date().toISOString() })
      .eq('id', pending.id)
    if (updErr) throw new Error(updErr.message)
    return { success: true }
  }

  /**
   * Confirmação do lado de quem convidou (partner_1). Caso crie e queira manter o mesmo fluxo (ambos devem aceitar),
   * oferecemos um método para o partner_1 marcar explicitamente o aceite dele também.
   */
  static async confirmAsInviter() {
    // Mantemos por compatibilidade, mas delegamos para acceptInvite (fluxo igual para ambos)
    return this.acceptInvite()
  }

  static async unlinkCouple() {
    const email = await this.getCurrentUserEmail()
    const { data: couple, error } = await supabase
      .from('couples')
      .select('id')
      .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    if (!couple) return { success: true }

    // Bloquear desvincular se já houver transações vinculadas ao casal
    const { count: txCount, error: txErr } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id)
    if (txErr) throw new Error(txErr.message)
    if ((txCount ?? 0) > 0) {
      throw new Error('Não é possível desvincular: já existem transações vinculadas ao casal.')
    }

    const { error: updErr } = await supabase
      .from('couples')
  .update({ status: 'inactive', partner_1_accepted: false, partner_2_accepted: false, updated_at: new Date().toISOString() })
      .eq('id', couple.id)
    if (updErr) throw new Error(updErr.message)
    return { success: true }
  }
}

export const couplesService = CouplesService
