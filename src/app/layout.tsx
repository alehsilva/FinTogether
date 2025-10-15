import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Poppins } from 'next/font/google';
import './globals.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { QueryProvider } from '@/lib/query-client';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PWAUpdatePrompt } from '@/components/ui/pwa-update-prompt';

// IBM Plex Sans - Fonte profissional para fintechs
// Excelente legibilidade, desenhada para apps corporativos
const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// IBM Plex Mono - Perfeita para valores monetários
// Números alinhados (tabular), visual profissional
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
  adjustFontFallback: true,
  fallback: ['Courier New', 'monospace'],
});

// Poppins - Fonte moderna para a logo
// Design clean e profissional, perfeita para branding
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'FinTogether - Controle Financeiro para Casais',
    template: '%s | FinTogether',
  },
  description: 'Gerencie suas finanças em casal de forma simples e organizada. Controle receitas, despesas e metas financeiras juntos.',
  keywords: ['finanças', 'casais', 'controle financeiro', 'orçamento', 'despesas', 'receitas', 'gestão financeira'],
  authors: [{ name: 'FinTogether' }],
  creator: 'FinTogether',
  publisher: 'FinTogether',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FinTogether - Controle Financeiro para Casais',
    description: 'Gerencie suas finanças em casal de forma simples e organizada.',
    url: '/',
    siteName: 'FinTogether',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinTogether - Controle Financeiro para Casais',
    description: 'Gerencie suas finanças em casal de forma simples e organizada.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon-512.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinTogether',
    startupImage: [
      {
        url: '/icon-512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  applicationName: 'FinTogether',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fintogether-theme') || 'dark';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <PWAUpdatePrompt />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
