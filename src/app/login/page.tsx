import { GoogleAuth } from '@/components/auth/google-auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Entre no FinTogether e gerencie suas finanças em casal',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen-mobile relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* Grid animado de fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] animate-[grid_20s_linear_infinite]" />

      {/* Gradientes animados flutuantes */}
      <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-slate-500/20 to-emerald-500/15 rounded-full blur-3xl animate-[float_18s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-emerald-400/10 to-slate-400/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />

      {/* Partículas/pontos flutuantes */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-emerald-400/40 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute top-[60%] right-[15%] w-2 h-2 bg-slate-400/40 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-emerald-300/30 rounded-full animate-[ping_5s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[30%] w-1.5 h-1.5 bg-slate-300/30 rounded-full animate-[ping_3.5s_ease-in-out_infinite]" />
      </div>

      {/* Linha de progresso sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Conteúdo de login */}
      <div className="relative z-10 min-h-screen-mobile flex items-center justify-center py-4 sm:py-8 px-4">
        <GoogleAuth />
      </div>

      {/* Vinheta nas bordas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
    </div>
  );
}
