'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto - dados considerados frescos
            gcTime: 5 * 60 * 1000, // 5 minutos - garbage collection (antes era cacheTime)
            refetchOnWindowFocus: false, // Não refetch ao focar janela
            refetchOnMount: false, // Não refetch ao montar se dados em cache
            retry: 1, // Apenas 1 retry em caso de erro
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
