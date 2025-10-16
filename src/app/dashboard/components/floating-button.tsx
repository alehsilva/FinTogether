'use client';

import { Button } from '@/components/ui/button';

interface FloatingButtonProps {
  selectedView: 'nosso' | 'meu';
  onClick: () => void;
  summary?: { individual_balance: number } | null;
}

export function FloatingButton({ selectedView, onClick, summary }: FloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-500/20 border-2 border-emerald-400/30 dark:border-emerald-600/30 backdrop-blur-sm transition-all duration-150 hover:scale-110 active:scale-95 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        strokeWidth="2.5"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </Button>
  );
}
