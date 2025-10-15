import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TransactionTypeService } from '@/services/transactionTypeService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Processar regras recorrentes para o usuário atual
    const result = await TransactionTypeService.processRecurringRules(user.id)

    return NextResponse.json({
      success: true,
      message: `${result.processed} transações recorrentes processadas`,
      processed: result.processed,
      errors: result.errors
    })
  } catch (error) {
    console.error('Erro ao processar transações recorrentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para processar todas as regras (cron job)
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (pode adicionar verificação de API key)
    const authHeader = request.headers.get('authorization')

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Processar todas as regras recorrentes
    const result = await TransactionTypeService.processRecurringRules()

    return NextResponse.json({
      success: true,
      message: `${result.processed} transações recorrentes processadas`,
      processed: result.processed,
      errors: result.errors
    })
  } catch (error) {
    console.error('Erro ao processar transações recorrentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
