'use client'

import { FinTogetherIcon } from './fintogether-logo'

interface LoadingProps {
    message?: string
    fullScreen?: boolean
}

export function Loading({ message = 'Carregando...', fullScreen = true }: LoadingProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Logo com animação de pulso */}
            <div className="relative">
                {/* Círculos de fundo animados */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/30 animate-pulse" />
                </div>

                {/* Logo */}
                <div className="relative z-10 animate-bounce">
                    <FinTogetherIcon size={64} />
                </div>
            </div>

            {/* Barra de progresso animada */}
            <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                    style={{ width: '40%' }} />
            </div>

            {/* Mensagem */}
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
                {message}
            </p>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="min-h-screen-mobile flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                {/* Background decorativo */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {/* Conteúdo */}
                <div className="relative z-10">
                    {content}
                </div>
            </div>
        )
    }

    return content
}

// Estilo CSS para a animação customizada (adicionar ao globals.css)
/*
@keyframes loading {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(250%);
  }
}
*/
