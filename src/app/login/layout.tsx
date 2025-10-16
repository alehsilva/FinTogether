import type { Metadata } from 'next';
import '../globals.css';
import { QueryProvider } from '@/lib/query-client';

export const metadata: Metadata = {
  title: 'Login - FinTogether',
  description: 'Entre na sua conta FinTogether',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <QueryProvider>{children}</QueryProvider>;
}
