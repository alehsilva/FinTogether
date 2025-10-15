'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { SidebarProps } from '@/models'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Settings2 } from 'lucide-react'
import type { AuthUser } from '@/models/auth'

interface NavItem {
    title: string
    icon: React.ComponentType<any>
    href: string
}

const navigation: NavItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        title: 'Configurações',
        icon: Settings2,
        href: '/configuracoes',
    },
]

interface SidebarComponentProps extends SidebarProps {
    user: AuthUser | null
}

export function Sidebar({ user, className }: SidebarComponentProps) {
    const router = useRouter()
    const pathname = usePathname()

    const renderNavItem = (item: NavItem) => {
        const isActive = pathname === item.href
        const IconComponent = item.icon

        return (
            <Button
                key={item.title}
                variant="ghost"
                size="icon"
                className={cn(
                    'w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer',
                    isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer'
                )}
                onClick={() => {
                    if (item.href) {
                        router.push(item.href)
                    }
                }}
                title={item.title}
            >
                <IconComponent strokeWidth={1.5} className="w-7 h-7" />
            </Button>
        )
    }

    if (!user) return null

    return (
        <div className={cn('flex h-full w-[72px] flex-col bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-700/50 transition-all duration-300', className)}>
            {/* Header */}
            <div className="flex h-16 items-center justify-center border-b border-slate-200/80 dark:border-slate-700/50 transition-colors duration-300">
            </div>

            {/* Navegação principal - apenas ícones */}
            <ScrollArea className="flex-1 py-4">
                <div className="flex flex-col items-center space-y-3 px-3">
                    {/* Menu principal */}
                    <div className="space-y-3">
                        {navigation.map(item => renderNavItem(item))}
                    </div>
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700/50 p-3 transition-colors duration-300">
            </div>
        </div>
    )
}
