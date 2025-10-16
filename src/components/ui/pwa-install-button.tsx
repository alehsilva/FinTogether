'use client';

import { Download, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallButton() {
  const { canInstall, isInstalled, isLoading, installPWA, isIOS } = usePWAInstall();

  // Não mostrar o botão se já estiver instalado
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="w-4 h-4" />
        <span className="hidden sm:inline">App Instalado</span>
      </div>
    );
  }

  // Não mostrar se não pode instalar (exceto no iOS)
  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <Button
      onClick={installPWA}
      variant="outline"
      size="sm"
      disabled={isLoading}
      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
    >
      {isLoading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      ) : (
        <>
          <Download className="w-4 h-4" />
          <Smartphone className="w-4 h-4 sm:hidden" />
        </>
      )}
      <span className="hidden sm:inline">{isIOS ? 'Adicionar à Tela' : 'Instalar App'}</span>
      <span className="sm:hidden">App</span>
    </Button>
  );
}

export default PWAInstallButton;
