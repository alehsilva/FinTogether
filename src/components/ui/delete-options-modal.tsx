'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react'
import { Button } from './button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from './sheet'

interface DeleteOptionsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (option: 'single' | 'all') => Promise<void>
    transactionTitle: string
    transactionType: 'parcela' | 'assinado'
    isLoading?: boolean
}

export const DeleteOptionsModal: React.FC<DeleteOptionsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    transactionTitle,
    transactionType,
    isLoading = false
}) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [isMobile, setIsMobile] = useState<boolean | null>(null) // null = não detectado ainda
    const [isInitialized, setIsInitialized] = useState(false)

    // Detectar tamanho da tela
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 640
            setIsMobile(mobile)
            setIsInitialized(true)
        }

        checkIsMobile()
        window.addEventListener('resize', checkIsMobile)

        return () => window.removeEventListener('resize', checkIsMobile)
    }, [])

    const typeLabel = transactionType === 'parcela' ? 'Parcelamento' : 'Assinatura'
    const singleLabel = transactionType === 'parcela' ? 'apenas esta parcela' : 'apenas esta ocorrência'
    const allLabel = transactionType === 'parcela' ? 'todo o parcelamento' : 'toda a assinatura'

    const handleOptionClick = async (option: 'single' | 'all') => {
        if (isProcessing) return

        try {
            setIsProcessing(true)
            await onConfirm(option)
            onClose()
        } catch (error) {
            console.error('Erro ao excluir:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const isDisabled = isLoading || isProcessing

    // Não renderizar nada até detectar o tamanho da tela
    if (!isInitialized || isMobile === null) {
        return null
    }

    // Mobile: Sheet bottom
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="h-auto max-h-[90vh] rounded-t-xl"
                >
                    <SheetTitle className="sr-only">Opções de Exclusão</SheetTitle>
                    <SheetDescription className="sr-only">
                        Escolha como deseja excluir {typeLabel.toLowerCase()}
                    </SheetDescription>
                    <ModalContent
                        typeLabel={typeLabel}
                        transactionTitle={transactionTitle}
                        singleLabel={singleLabel}
                        allLabel={allLabel}
                        handleOptionClick={handleOptionClick}
                        onClose={onClose}
                        isDisabled={isDisabled}
                        isProcessing={isProcessing}
                        isMobile={true}
                    />
                </SheetContent>
            </Sheet>
        )
    }

    // Desktop: Modal centralizado
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <div
                        className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalContent
                            typeLabel={typeLabel}
                            transactionTitle={transactionTitle}
                            singleLabel={singleLabel}
                            allLabel={allLabel}
                            handleOptionClick={handleOptionClick}
                            onClose={onClose}
                            isDisabled={isDisabled}
                            isProcessing={isProcessing}
                            isMobile={false}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

// Componente de conteúdo compartilhado
const ModalContent: React.FC<{
    typeLabel: string
    transactionTitle: string
    singleLabel: string
    allLabel: string
    handleOptionClick: (option: 'single' | 'all') => void
    onClose: () => void
    isDisabled: boolean
    isProcessing: boolean
    isMobile: boolean
}> = ({ typeLabel, transactionTitle, singleLabel, allLabel, handleOptionClick, onClose, isDisabled, isProcessing, isMobile }) => (
    <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                    {isMobile ? (
                        <>
                            <SheetTitle className="text-lg font-semibold text-slate-900">
                                Excluir {typeLabel}
                            </SheetTitle>
                            <SheetDescription className="text-sm text-slate-600 mt-1">
                                {transactionTitle}
                            </SheetDescription>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Excluir {typeLabel}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                                {transactionTitle}
                            </p>
                        </>
                    )}
                </div>
            </div>
            {!isMobile && (
                <button
                    onClick={onClose}
                    disabled={isDisabled}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* Aviso */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 text-sm font-medium">
                Esta é uma transação {typeLabel.toLowerCase()}. Como deseja excluir?
            </p>
        </div>

        {/* Opções */}
        <div className="space-y-3 mb-6">
            {/* Excluir apenas esta */}
            <button
                onClick={() => handleOptionClick('single')}
                disabled={isDisabled}
                className="w-full p-4 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 text-blue-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                            Excluir {singleLabel}
                        </h4>
                        <p className="text-sm text-slate-600">
                            Remove apenas esta transação. {typeLabel === 'Parcelamento'
                                ? 'As outras parcelas continuam.'
                                : 'As outras ocorrências continuam.'}
                        </p>
                    </div>
                </div>
            </button>

            {/* Excluir todas */}
            <button
                onClick={() => handleOptionClick('all')}
                disabled={isDisabled}
                className="w-full p-4 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-rose-100 group-hover:bg-rose-200 rounded-lg flex items-center justify-center transition-colors">
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 text-rose-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                            Excluir {allLabel}
                        </h4>
                        <p className="text-sm text-slate-600">
                            Remove {typeLabel.toLowerCase()} completo. {typeLabel === 'Parcelamento'
                                ? 'Todas as parcelas serão excluídas.'
                                : 'Toda a série de recorrências será excluída.'}
                        </p>
                    </div>
                </div>
            </button>
        </div>

        {/* Botão Cancelar */}
        <Button
            onClick={onClose}
            disabled={isDisabled}
            variant="outline"
            className="w-full"
        >
            {isProcessing ? 'Processando...' : 'Cancelar'}
        </Button>
    </div>
)
