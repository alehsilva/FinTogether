'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAPromptBanner() {
  const { canInstall, isInstalled, installPWA, isIOS } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Mostrar o prompt após 3 segundos se pode instalar e não foi dispensado
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !isDismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, isDismissed]);

  // Verificar se já foi dispensado antes
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstall = () => {
    installPWA();
    setShowPrompt(false);
  };

  if (!showPrompt || !canInstall || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg shadow-green-100/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Ícone */}
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                Instalar FinTogether
              </h3>
              <p className="text-xs text-green-700 mb-3">
                {isIOS 
                  ? 'Adicione à tela inicial para acesso rápido e experiência de app nativo!'
                  : 'Instale como app para acesso rápido e use offline!'
                }
              </p>

              {/* Benefícios */}
              <div className="flex items-center gap-4 mb-3 text-xs text-green-600">
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <span>Acesso rápido</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tablet className="w-3 h-3" />
                  <span>Offline</span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isIOS ? 'Adicionar' : 'Instalar'}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  Agora não
                </Button>
              </div>
            </div>

            {/* Botão fechar */}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 w-6 h-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}