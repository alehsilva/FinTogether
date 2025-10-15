'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FinTogetherIcon } from '@/components/ui/fintogether-logo'
import { Shield, TrendingUp, Users } from 'lucide-react'

export function GoogleAuth() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const signInWithGoogle = async () => {
        try {
            setLoading(true)
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })
        } catch (error) {
            console.error('Erro no login:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-4">
            {/* Header com logo e branding - MODERNO */}
            <div className="text-center mb-8 space-y-4">
                <div className="mx-auto flex justify-center">
                    <div className="relative">
                        {/* Logo oficial FinTogether */}
                        <FinTogetherIcon size={90} className="drop-shadow-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 to-slate-600/40 blur-3xl -z-10 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300">
                            Fin
                        </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                            Together
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 font-medium">
                        Finanças em Casal
                    </p>
                </div>
            </div>

            {/* Card de login principal - GLASSMORPHISM */}
            <Card className="border-slate-700/50 shadow-2xl bg-slate-800/40 backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-4 text-center px-5 pt-6">
                    <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-100">
                        Bem-vindo de volta
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm sm:text-base">
                        Entre para gerenciar suas finanças
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-5 pb-6">
                    {/* Botão de login Google */}
                    <Button
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="w-full h-12 sm:h-14 !bg-white hover:!bg-slate-100 !text-slate-900 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm sm:text-base">Conectando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {/* Google Icon SVG */}
                                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC04"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-sm sm:text-base">Continuar com Google</span>
                            </div>
                        )}
                    </Button>

                    {/* Recursos/benefícios - MODERNO */}
                    <div className="pt-4 border-t border-slate-700/50">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-200">Controle Total</h3>
                                    <p className="text-xs text-slate-400 leading-tight">Acompanhe em tempo real</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-slate-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-200">Finanças a Dois</h3>
                                    <p className="text-xs text-slate-400 leading-tight">Organize juntos</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-200">100% Seguro</h3>
                                    <p className="text-xs text-slate-400 leading-tight">Dados criptografados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer - MODERNO */}
            <div className="mt-6 sm:mt-8 text-center space-y-3 px-4">
                <p className="text-sm text-slate-400">
                    Primeira vez aqui?{' '}
                    <span className="text-emerald-400 font-semibold">
                        Crie sua conta grátis
                    </span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                    <a href="#" className="hover:text-slate-300 transition-colors">
                        Termos de Uso
                    </a>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-300 transition-colors">
                        Privacidade
                    </a>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-300 transition-colors">
                        Suporte
                    </a>
                </div>
            </div>
        </div>
    )
}
