'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Componente que detecta atualizações do Service Worker
 * e permite ao usuário atualizar o PWA manualmente
 */
export function PWAUpdatePrompt() {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        // Só funciona no navegador e se Service Workers são suportados
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Detecta quando há um novo Service Worker esperando
        const onUpdate = (registration: ServiceWorkerRegistration) => {
            if (registration.waiting) {
                setWaitingWorker(registration.waiting);
                setShowUpdatePrompt(true);
            }
        };

        // Registra o listener
        navigator.serviceWorker.ready.then((registration) => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            onUpdate(registration);
                        }
                    });
                }
            });

            // Verifica se já existe um worker esperando
            if (registration.waiting) {
                onUpdate(registration);
            }
        });

        // Escuta mensagens do Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }, []);

    const updateServiceWorker = () => {
        if (waitingWorker) {
            // Envia mensagem para o Service Worker pular a espera
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    if (!showUpdatePrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
            <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-medium">Nova versão disponível!</p>
                    <p className="text-xs text-muted-foreground">
                        Clique em atualizar para obter a versão mais recente.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpdatePrompt(false)}
                    >
                        Depois
                    </Button>
                    <Button
                        size="sm"
                        onClick={updateServiceWorker}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Atualizar
                    </Button>
                </div>
            </div>
        </div>
    );
}
