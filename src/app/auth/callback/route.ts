import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data?.user) {
        // Sucesso - redirecionar para dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      console.error('Auth error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
