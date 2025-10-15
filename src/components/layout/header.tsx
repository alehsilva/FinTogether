'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { FinTogetherLogo, FinTogetherIcon } from '@/components/ui/fintogether-logo'
import { useTheme } from '@/contexts/ThemeContext'
import type { Partner } from '@/models/user'
import type { AuthUser } from '@/models/auth'
import { extractInitials } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
    user: AuthUser | null
    onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [partner, setPartner] = useState<Partner | null>(null)

    // Usar dados do casal já carregados pelo useAuth (evita query duplicada)
    useEffect(() => {
        if (!user || !user.coupleId || !user.partnerEmail) {
            setPartner(null)
            return
        }

        // Extrair nome do email como fallback
        const partnerName = user.partnerEmail?.split('@')[0] || user.partnerEmail

        setPartner({
            name: partnerName,
            avatar_url: '', // Sem avatar por enquanto para evitar query extra
            email: user.partnerEmail
        })
    }, [user?.coupleId, user?.partnerEmail])

    if (!user) return null

    const userMetadata = user.user_metadata || {}
    const avatarUrl = userMetadata.avatar_url
    const fullName = userMetadata.full_name || userMetadata.name
    const firstName = fullName?.split(' ')[0] || 'Usuário'
    const initials = fullName ? extractInitials(fullName) : (user.email?.[0]?.toUpperCase() || 'U')

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                {/* Logo e menu mobile */}
                <div className="flex items-center gap-4">
                    {/* Menu mobile */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="lg:hidden cursor-pointer">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                            <SheetDescription className="sr-only">
                                Menu lateral com opções de navegação do aplicativo
                            </SheetDescription>
                            {/* Mobile sidebar content */}
                            <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                                <div className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 px-4">
                                    <FinTogetherLogo size={32} />
                                </div>

                                {/* Menu Items */}
                                <nav className="flex-1 p-4">
                                    <div className="space-y-2">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                                            onClick={() => router.push('/dashboard')}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                                            onClick={() => router.push('/configuracoes')}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Configurações</span>
                                        </Button>
                                    </div>
                                </nav>

                                {/* User info at bottom */}
                                <div className="border-t border-slate-200 dark:border-slate-700/50 p-4 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={avatarUrl} alt={fullName || ''} />
                                            <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{fullName || 'Usuário'}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={onSignOut}
                                    >
                                        <span className="text-base mr-2">🚪</span>
                                        Sair
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo */}
                    <FinTogetherLogo size={40} />
                </div>

                {/* User dropdown com fotos do casal */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-12 px-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors duration-200">
                            <div className="flex items-center gap-3">
                                {/* Fotos do casal lado a lado */}
                                <div className="flex items-center -space-x-2">
                                    {/* Avatar do usuário atual */}
                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 ring-2 ring-slate-200 dark:ring-slate-700">
                                        {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName || ''} /> : null}
                                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs font-semibold">
                                            {extractInitials(user?.user_metadata?.full_name || user?.email || 'U')}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Avatar do parceiro (ou botão para adicionar) */}
                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 ring-2 ring-slate-300 dark:ring-slate-600">
                                        {partner ? (
                                            <>
                                                {partner.avatar_url ? (
                                                    <AvatarImage src={partner.avatar_url} alt={partner.name} />
                                                ) : null}
                                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-semibold">
                                                    {extractInitials(partner.name)}
                                                </AvatarFallback>
                                            </>
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-900 dark:to-black text-slate-200 dark:text-slate-400 hover:from-slate-600 hover:to-slate-700 transition-colors cursor-pointer">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>

                                {/* Nome do usuário */}
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{firstName}</span>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                                        {partner ? `& ${partner.name.split(' ')[0]}` : 'Adicionar parceiro(a)'}
                                    </span>
                                </div>

                                {/* Ícone dropdown */}
                                <svg className="h-4 w-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64 p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                        {/* Header do dropdown com info do usuário */}
                        <div className="flex items-center gap-3 p-2 mb-2 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-lg transition-colors duration-300">
                            <Avatar className="h-10 w-10 border-2 border-emerald-500">
                                <AvatarImage src={avatarUrl} alt={fullName || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-semibold">
                                    {extractInitials(user?.user_metadata?.full_name || user?.email || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{fullName || 'Usuário'}</p>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />

                        {/* Seletor de Tema */}
                        <div className="px-2 py-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2 px-2">APARÊNCIA</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${theme === 'light'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-xs font-semibold">Claro</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${theme === 'dark'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    <span className="text-xs font-semibold">Escuro</span>
                                </button>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-slate-700/50" />

                        {/* Menu items (somente Configurações) */}
                        <DropdownMenuItem
                            className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-slate-700/50 focus:text-slate-900 dark:focus:text-white"
                            onClick={() => router.push('/configuracoes')}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">⚙️</span>
                                <span className="font-medium">Configurações</span>
                            </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700/50" />

                        {/* Sair */}
                        <DropdownMenuItem
                            onClick={onSignOut}
                            className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">🚪</span>
                                <span className="font-medium">Sair</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
