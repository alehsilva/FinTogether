'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Para iOS Safari
      const isIOSStandalone = (window.navigator as any).standalone === true;
      // Para outros navegadores
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      return isIOSStandalone || isStandalone;
    };

    setIsInstalled(checkIfInstalled());

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      // Para iOS, mostrar instruções
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert(
          'Para instalar:\n' +
          '1. Toque no ícone de compartilhar (□↗)\n' +
          '2. Role para baixo\n' +
          '3. Toque em "Adicionar à Tela de Início"'
        );
        return;
      }
      return;
    }

    setIsLoading(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setCanInstall(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    isLoading,
    installPWA,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
  };
}
