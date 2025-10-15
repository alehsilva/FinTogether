// ===============================================
// SERVIÇO DE CATEGORIAS - SUPABASE INTEGRATION
// ===============================================

import { supabase } from '@/lib/supabase'
import type { Category } from '@/models/financial'
import type { Database } from '@/models/database'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export class CategoryService {
  /**
   * Buscar todas as categorias disponíveis para o usuário
   * Inclui categorias do sistema + categorias personalizadas do usuário/casal
   */
  static async getCategories(userId: string, type?: 'receita' | 'despesa') {
    let query = supabase
      .from('categories')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${userId}`)
      .eq('is_active', true)
      .order('is_system', { ascending: false })
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`)
    }

    return this.buildCategoryHierarchy(data as Category[])
  }

  /**
   * Buscar categorias do casal
   */
  static async getCoupleCategories(coupleId: string, type?: 'receita' | 'despesa') {
    let query = supabase
      .from('categories')
      .select('*')
      .or(`is_system.eq.true,couple_id.eq.${coupleId}`)
      .eq('is_active', true)
      .order('is_system', { ascending: false })
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar categorias do casal: ${error.message}`)
    }

    return this.buildCategoryHierarchy(data as Category[])
  }

  /**
   * Criar nova categoria personalizada
   */
  static async createCategory(
    userId: string,
    category: {
      name: string
      type: 'receita' | 'despesa'
      icon: string
      color: string
      parent_category_id?: string
      is_couple_category?: boolean
    }
  ) {
    const categoryData: CategoryInsert = {
      user_id: category.is_couple_category ? null : userId,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      is_system: false,
      is_active: true,
      parent_category_id: category.parent_category_id || null
    }

    // Se for categoria do casal, buscar o couple_id
    if (category.is_couple_category) {
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .single()

      if (couple) {
        categoryData.couple_id = couple.id
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao criar categoria: ${error.message}`)
    }

    return data as Category
  }

  /**
   * Atualizar categoria
   */
  static async updateCategory(
    categoryId: string,
    userId: string,
    updates: {
      name?: string
      icon?: string
      color?: string
      is_active?: boolean
    }
  ) {
    // Verificar se o usuário pode editar esta categoria
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('user_id, couple_id, is_system')
      .eq('id', categoryId)
      .single()

    if (checkError) {
      throw new Error(`Erro ao verificar categoria: ${checkError.message}`)
    }

    // Não pode editar categorias do sistema
    if (existingCategory.is_system) {
      throw new Error('Não é possível editar categorias do sistema')
    }

    // Verificar permissão
    if (existingCategory.user_id !== userId && !existingCategory.couple_id) {
      throw new Error('Você não tem permissão para editar esta categoria')
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar categoria: ${error.message}`)
    }

    return data as Category
  }

  /**
   * Deletar categoria (desativar)
   */
  static async deleteCategory(categoryId: string, userId: string) {
    // Verificar se há transações usando esta categoria
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (transactions && transactions.length > 0) {
      throw new Error('Não é possível excluir categoria que possui transações. Desative-a em vez disso.')
    }

    return this.updateCategory(categoryId, userId, { is_active: false })
  }

  /**
   * Buscar categoria por ID
   */
  static async getCategoryById(categoryId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar categoria: ${error.message}`)
    }

    return data as Category
  }

  /**
   * Buscar subcategorias de uma categoria pai
   */
  static async getSubcategories(parentCategoryId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_category_id', parentCategoryId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(`Erro ao buscar subcategorias: ${error.message}`)
    }

    return data as Category[]
  }

  /**
   * Construir hierarquia de categorias
   */
  private static buildCategoryHierarchy(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Primeiro passo: criar mapa de todas as categorias
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, subcategories: [] })
    })

    // Segundo passo: construir hierarquia
    categories.forEach(category => {
      const categoryWithSubs = categoryMap.get(category.id)!

      if (category.parent_category_id) {
        // É uma subcategoria
        const parent = categoryMap.get(category.parent_category_id)
        if (parent) {
          if (!parent.subcategories) {
            parent.subcategories = []
          }
          parent.subcategories.push(categoryWithSubs)
          categoryWithSubs.parent_category = parent
        }
      } else {
        // É uma categoria raiz
        rootCategories.push(categoryWithSubs)
      }
    })

    return rootCategories
  }

  /**
   * Buscar categorias mais utilizadas pelo usuário
   */
  static async getMostUsedCategories(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        category_id,
        categories!inner(id, name, icon, color, type)
      `)
      .eq('user_id', userId)
      .not('category_id', 'is', null)

    if (error) {
      throw new Error(`Erro ao buscar categorias mais usadas: ${error.message}`)
    }

    // Contar uso por categoria
    const categoryCount = new Map<string, { category: any; count: number }>()

    data.forEach((transaction: any) => {
      const category = transaction.categories
      if (category) {
        const key = category.id
        if (categoryCount.has(key)) {
          categoryCount.get(key)!.count++
        } else {
          categoryCount.set(key, { category, count: 1 })
        }
      }
    })

    // Ordenar por uso e retornar top N
    return Array.from(categoryCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        ...item.category,
        usage_count: item.count
      }))
  }

  /**
   * Buscar ID da categoria "Sem Categoria" por tipo
   */
  static async getDefaultCategoryId(type: 'receita' | 'despesa'): Promise<string | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Sem Categoria')
      .eq('type', type)
      .eq('is_system', true)
      .eq('is_active', true)
      .single()

    if (error) {
      console.warn(`Categoria "Sem Categoria" não encontrada para tipo ${type}:`, error.message)
      return null
    }

    return data?.id || null
  }

  /**
   * Importar categorias padrão do sistema
   * (Útil para executar o seed das categorias)
   */
  static async importSystemCategories() {
    // Esta função seria usada para importar as categorias do arquivo SQL
    // Em produção, isso seria feito via migration ou script de inicialização
    console.log('Para importar categorias do sistema, execute o arquivo categories_seed.sql no Supabase')

    return { message: 'Execute o arquivo categories_seed.sql no seu banco Supabase' }
  }
}
