import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/models'

export class UserService {
  private supabase = createClient()

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async updateProfile(updates: {
    full_name?: string
    avatar_url?: string
  }) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await this.supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()

    if (error) throw error
    return data
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async getProfileByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle()

    if (error && (error as any).code !== 'PGRST116') throw error
    return data
  }

  async createProfile(userData: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error
    return data
  }

  /**
   * Garante que o perfil do usuário autenticado exista na tabela 'users',
   * populando email, nome e avatar_url a partir do auth.user_metadata.
   */
  async upsertCurrentUserFromAuth() {
    const {
      data: { user },
      error: authErr,
    } = await this.supabase.auth.getUser()
    if (authErr) throw authErr
    if (!user) return null

    const meta = user.user_metadata || {}
    const full_name = meta.full_name || meta.name || meta.user_name || null
    // Tentar múltiplos campos comuns para avatar (Google/GitHub/etc.)
    let avatar_url: string | null = meta.avatar_url || meta.picture || meta.avatar || null
    if (!avatar_url && Array.isArray((user as any).identities) && (user as any).identities.length > 0) {
      const idData = (user as any).identities[0]?.identity_data || {}
      avatar_url = idData.avatar_url || idData.picture || idData.avatar || null
    }

    const now = new Date().toISOString()
    const payload = {
      id: user.id,
      email: user.email!,
      full_name,
      avatar_url,
      updated_at: now,
      created_at: now,
    } as any

    const { error } = await this.supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' })
    if (error) throw error
    // Espeilhar em couples para facilitar leitura do parceiro via RLS de couples
    try {
      const email = user.email!.toLowerCase()
      const isP1 = (await this.supabase.from('couples').select('id, partner_1_email').or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`).eq('status','active').maybeSingle()).data?.partner_1_email?.toLowerCase() === email
      const patch: any = isP1
        ? { partner_1_name: full_name, partner_1_avatar_url: avatar_url }
        : { partner_2_name: full_name, partner_2_avatar_url: avatar_url }
      await this.supabase
        .from('couples')
        .update(patch)
        .or(`partner_1_email.eq.${email},partner_2_email.eq.${email}`)
        .eq('status','active')
    } catch {}
    return true
  }
}

// Instância singleton para uso em toda a aplicação
export const userService = new UserService()
