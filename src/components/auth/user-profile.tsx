'use client';

import { useCentralizedAppContext } from '@/hooks/useCentralizedAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { extractInitials } from '@/lib/utils';

export function UserProfile() {
  const { user, loading, signOut } = useCentralizedAppContext();

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const userMetadata = user.user_metadata || {};
  const avatarUrl = userMetadata.avatar_url;
  const fullName = userMetadata.full_name || userMetadata.name;
  const initials = fullName ? extractInitials(fullName) : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Meu Perfil</CardTitle>
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
          >
            🟢 Online
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar e informações básicas */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-20 h-20 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
            <AvatarImage src={avatarUrl} alt={fullName || user.email || ''} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {fullName || 'Usuário'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <Separator />

        {/* Informações do perfil */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Provider</span>
            <Badge variant="outline" className="capitalize">
              {userMetadata.provider || 'Google'}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Verificado</span>
            <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>
              {user.email_confirmed_at ? '✅ Sim' : '⏳ Pendente'}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Último acesso</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                : 'Agora'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Botões de ação */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // Aqui você pode adicionar lógica para editar perfil
              console.log('Editar perfil');
            }}
          >
            <span className="mr-2">✏️</span>
            Editar Perfil
          </Button>

          <Button
            onClick={signOut}
            variant="destructive"
            className="w-full justify-start hover:bg-red-600"
          >
            <span className="mr-2">🚪</span>
            Sair da Conta
          </Button>
        </div>

        {/* ID do usuário (colapsível/menor) */}
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            Informações técnicas
          </summary>
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono break-all">
            <strong>ID:</strong> {user.id}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
