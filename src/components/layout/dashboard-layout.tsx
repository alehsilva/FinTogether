'use client'

import { useCentralizedAppContext } from '@/hooks/useCentralizedAppContext'
import { Header } from './header'
import { GoogleAuth } from '@/components/auth/google-auth'
import { Sidebar } from './sidebar'
import { DashboardLayoutProps } from '@/models'
import { Loading } from '@/components/ui/loading'

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, loading, signOut } = useCentralizedAppContext()

    // Mostrar loading enquanto carrega
    if (loading) {
        return <Loading message="Carregando seus dados..." />
    }    // Se não há usuário após carregar, redirecionar para login
    if (!user) {
        // Redirecionar para login usando window.location para evitar loops
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
        }
        return null
    }

    // Layout do dashboard para usuários logados
    return (
        <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Background grid sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Sidebar - oculto no mobile */}
            <div className="hidden lg:flex lg:flex-shrink-0 relative z-10">
                <Sidebar user={user} />
            </div>

            {/* Conteúdo principal */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
                {/* Header */}
                <Header user={user} onSignOut={signOut} />

                {/* Main content */}
                <main className="flex-1 relative overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
