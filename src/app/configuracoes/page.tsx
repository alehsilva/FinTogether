'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCentralizedAppContext } from '@/hooks/useCentralizedAppContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import { couplesService } from '@/services/couplesService'
import type { PartnerData } from '@/models/user'
import { extractInitials } from '@/lib/utils'
import { PWAInstallButton } from '@/components/ui/pwa-install-button'

export default function ConfiguracoesPage() {
    const { user, loading } = useCentralizedAppContext()
    const { theme, setTheme } = useTheme()
    const [partnerEmail, setPartnerEmail] = useState('')
    const [partner, setPartner] = useState<PartnerData | null>(null)
    const [couple, setCouple] = useState<any | null>(null)
    const [pending, setPending] = useState<any | null>(null)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')
    const supabase = createClient()

    const userMetadata = user?.user_metadata || {}
    const currentUserName = userMetadata.full_name || userMetadata.name || 'Você'

    const myEmail = user?.email?.toLowerCase() || ''

    // Carregar estado inicial de pareamento (ativo ou pendente)
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const c = await couplesService.getCurrentCouple()
                if (!cancelled) setCouple(c)
                const p = await couplesService.getPendingInvite()
                if (!cancelled) setPending(p)
            } catch { }
        }
        load()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const manualRefresh = async () => {
        setButtonLoading(true)
        try {
            const c = await couplesService.getCurrentCouple()
            setCouple(c)
            const p = await couplesService.getPendingInvite()
            setPending(p)
        } finally {
            setButtonLoading(false)
        }
    }

    const isActive = couple?.status === 'active'
    const isPendingInvitee = pending && pending.partner_2_email?.toLowerCase() === myEmail
    const isPendingInviter = couple?.status === 'pending' && couple.partner_1_email?.toLowerCase() === myEmail
    const inviterAccepted = Boolean(couple?.partner_1_accepted)
    const inviteeAccepted = Boolean((pending || couple)?.partner_2_accepted)
    const partnerEmailFromState = useMemo(() => {
        if (isActive) {
            return couple.partner_1_email?.toLowerCase() === myEmail ? couple.partner_2_email : couple.partner_1_email
        }
        if (isPendingInviter) {
            return couple.partner_2_email
        }
        if (isPendingInvitee) {
            return pending.partner_1_email
        }
        return partner?.email || ''
    }, [isActive, isPendingInviter, isPendingInvitee, couple, pending, partner, myEmail])

    // Buscar/validar parceiro por email e criar convite (pendente)
    const searchPartner = async () => {
        if (!partnerEmail.trim()) {
            setMessage('Por favor, digite o email do(a) seu(sua) parceiro(a)')
            setMessageType('error')
            return
        }

        setButtonLoading(true)
        setMessage('')

        try {
            const couple = await couplesService.requestPair(partnerEmail)
            setCouple(couple)
            // Carregar dados mínimos do parceiro na UI (placeholder com email)
            const partnerName = couple.partner_1_email.toLowerCase() === partnerEmail.toLowerCase()
                ? couple.partner_1_email
                : couple.partner_2_email
            setPartner({ id: couple.id, email: partnerEmail, full_name: partnerName, avatar_url: '' })
            if (couple.status === 'active') {
                setMessage('Pareamento ativado!')
                setMessageType('success')
            } else if (couple.status === 'pending') {
                setMessage('Convite enviado. Aguarde o aceite do(a) parceiro(a).')
                setMessageType('success')
            } else {
                setMessage('Convite criado.')
                setMessageType('success')
            }
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao criar pareamento. Tente novamente.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    const sendPartnerRequest = async () => {
        if (!partnerEmail.trim()) return
        setButtonLoading(true)
        try {
            const couple = await couplesService.requestPair(partnerEmail)
            setCouple(couple)
            setMessage(couple.status === 'pending' ? 'Convite enviado. Aguarde aceite.' : 'Pareamento ativado!')
            setMessageType('success')
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao criar pareamento.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    const removePairing = async () => {
        setButtonLoading(true)
        try {
            await couplesService.unlinkCouple()
            setPartner(null)
            setPartnerEmail('')
            setCouple(null)
            setPending(null)
            setMessage('Pareamento removido com sucesso.')
            setMessageType('success')
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao remover pareamento.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    const acceptInvite = async () => {
        setButtonLoading(true)
        try {
            const c = await couplesService.acceptInvite()
            setCouple(c)
            setPending(null)
            setMessage('Convite aceito! Agora vocês são um casal no app.')
            setMessageType('success')
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao aceitar convite.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    const confirmAsInviter = async () => {
        setButtonLoading(true)
        try {
            const c = await couplesService.confirmAsInviter()
            setCouple(c)
            setMessage(c.status === 'active' ? 'Pareamento ativado!' : 'Aceite confirmado. Aguardando parceiro(a).')
            setMessageType('success')
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao confirmar aceite.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    const declineInvite = async () => {
        setButtonLoading(true)
        try {
            await couplesService.declineInvite()
            setPending(null)
            setCouple(null)
            setMessage('Convite recusado/cancelado.')
            setMessageType('success')
        } catch (error: any) {
            setMessage(error?.message || 'Erro ao recusar/cancelar convite.')
            setMessageType('error')
        } finally {
            setButtonLoading(false)
        }
    }

    if (loading) {
        return <Loading message="Carregando configurações..." fullScreen={false} />
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400">Erro: Usuário não encontrado</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto py-6 px-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                        Configurações
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gerencie suas configurações e pareamento com seu(ua) parceiro(a)
                    </p>
                </div>

                {/* Card principal unificado */}
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/50 shadow-xl">
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-700/50">

                            {/* Seção do Perfil */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Seu Perfil</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações da sua conta no FinTogether</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <Avatar className="h-16 w-16 ring-2 ring-emerald-200 dark:ring-emerald-800 ring-offset-2 dark:ring-offset-slate-900">
                                        <AvatarImage src={userMetadata.avatar_url} alt={currentUserName} />
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-lg font-bold">
                                            {extractInitials(currentUserName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{currentUserName}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-2">{user.email}</p>
                                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium">
                                            Conta Principal
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={manualRefresh}
                                        disabled={buttonLoading}
                                        className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer transition-all duration-200 shadow-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Atualizar
                                    </Button>
                                </div>
                            </div>

                            {/* Seção PWA - App Installation */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Instalar App</h2>
                                        <p className="text-slate-600 dark:text-slate-400">Baixe o FinTogether como aplicativo nativo</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg mb-2">Instale como App Nativo</h4>
                                            <p className="text-blue-800 dark:text-blue-400 leading-relaxed mb-4">
                                                Instale o FinTogether no seu dispositivo para ter acesso rápido, funcionar offline e uma experiência mais fluida.
                                            </p>

                                            {/* Benefícios */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                    </svg>
                                                    <span>Acesso rápido</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                    </svg>
                                                    <span>Funciona offline</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                    </svg>
                                                    <span>Ícone na tela inicial</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                    </svg>
                                                    <span>Experiência nativa</span>
                                                </div>
                                            </div>

                                            {/* Botão de instalação */}
                                            <div className="flex items-center gap-3">
                                                <PWAInstallButton />
                                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                                    Disponível para Android, iOS e Desktop
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção de Pareamento */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pareamento do Casal</h2>
                                        <p className="text-slate-600 dark:text-slate-400">Conecte-se com seu(ua) parceiro(a) para compartilhar finanças</p>
                                    </div>
                                </div>

                                {/* Estados do pareamento */}
                                <div className="space-y-4">
                                    {/* Estado: Convite pendente para o usuário (ele é o convidado) */}
                                    {isPendingInvitee ? (
                                        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800 shadow-sm">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Convite Recebido</h4>
                                                    <p className="text-blue-800 dark:text-blue-400 leading-relaxed">
                                                        <strong>{pending.partner_1_email}</strong> te convidou para formar um casal no FinTogether.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={acceptInvite}
                                                    disabled={buttonLoading}
                                                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                    </svg>
                                                    Aceitar Convite
                                                </Button>
                                                <Button
                                                    onClick={declineInvite}
                                                    variant="outline"
                                                    disabled={buttonLoading}
                                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                >
                                                    Recusar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isActive ? (
                                        // Estado: Casal ativo
                                        <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-lg">Pareamento Ativo</h4>
                                                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">Parceiro: {partnerEmailFromState}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={removePairing}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={buttonLoading}
                                                    className="border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-400 dark:hover:border-rose-600 cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                    Desvincular
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isPendingInviter ? (
                                        // Estado: Convite enviado pelo usuário (aguardando aceite)
                                        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 shadow-sm">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Aguardando Resposta</h4>
                                                    <p className="text-blue-800 dark:text-blue-400 leading-relaxed">
                                                        Convite enviado para <strong>{partnerEmailFromState}</strong>.
                                                        {inviterAccepted ? ' Você já confirmou seu aceite. ' : ' Confirme seu aceite para agilizar a ativação. '}
                                                        {inviteeAccepted ? ' Parceiro(a) já aceitou.' : ' Aguardando aceite do(a) parceiro(a).'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                {!inviterAccepted && (
                                                    <Button
                                                        onClick={confirmAsInviter}
                                                        disabled={buttonLoading}
                                                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
                                                    >
                                                        Confirmar meu aceite
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={declineInvite}
                                                    variant="outline"
                                                    disabled={buttonLoading}
                                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                >
                                                    Cancelar Convite
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Estado: Nenhum pareamento
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="partner-email" className="text-base font-semibold text-slate-900 dark:text-slate-100">Email do(a) parceiro(a)</Label>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                    Digite o email do(a) seu(sua) parceiro(a) para enviar um convite de pareamento.
                                                </p>
                                                <div className="flex gap-3">
                                                    <Input
                                                        id="partner-email"
                                                        type="email"
                                                        placeholder="exemplo@email.com"
                                                        value={partnerEmail}
                                                        onChange={(e) => setPartnerEmail(e.target.value)}
                                                        className="flex-1 h-11"
                                                    />
                                                    <Button
                                                        onClick={searchPartner}
                                                        disabled={buttonLoading || !partnerEmail.trim()}
                                                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 shadow-sm cursor-pointer h-11"
                                                    >
                                                        {buttonLoading ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Enviando...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                Enviar Convite
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensagem de feedback */}
                                    {message && (
                                        <Alert className={messageType === 'success'
                                            ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 shadow-sm'
                                            : 'border-rose-200 dark:border-rose-800 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-900/50 shadow-sm'
                                        }>
                                            <AlertDescription className={messageType === 'success'
                                                ? 'text-emerald-800 dark:text-emerald-300 font-medium'
                                                : 'text-rose-800 dark:text-rose-300 font-medium'
                                            }>
                                                <div className="flex items-center gap-2">
                                                    {messageType === 'success' ? (
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                                        </svg>
                                                    )}
                                                    {message}
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            {/* Seção de Zona Perigosa */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Zona Perigosa</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Ações irreversíveis da conta</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-800 bg-gradient-to-r from-rose-50/50 to-red-50/50 dark:from-rose-950/30 dark:to-red-950/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Excluir conta</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Remove permanentemente sua conta e todos os dados associados
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white shadow-sm cursor-pointer"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                            Excluir Conta
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
