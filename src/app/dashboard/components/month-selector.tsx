'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';

interface MonthSelectorProps {
  selectedMonth: string;
  selectedYear: number;
  selectedView: 'nosso' | 'meu';
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  summary?: { individual_balance: number } | null;
}

export function MonthSelector({
  selectedMonth,
  selectedYear,
  selectedView,
  onMonthChange,
  onYearChange,
  summary,
}: MonthSelectorProps) {
  const monthsRef = useRef<HTMLDivElement>(null);

  const {
    isSwiping,
    touchHandlers,
    navigateToMonth,
    months
  } = useMonthNavigation({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    swipeSensitivity: 30,
    enabled: true,
  });

  // Animar scroll após navegação
  const handleNavigation = (direction: 'next' | 'prev') => {
    navigateToMonth(direction);
    scrollToCurrentMonth(true);
  };

  const scrollMonths = (direction: 'left' | 'right') => {
    if (!monthsRef.current) return;
    const scrollAmount = 120;
    const currentScroll = monthsRef.current.scrollLeft;
    const newScroll =
      direction === 'left'
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;

    monthsRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  };

  const scrollToCurrentMonth = (animated: boolean = true) => {
    if (!monthsRef.current) return;

    const currentMonthIndex = months.findIndex(month => month === selectedMonth);
    if (currentMonthIndex === -1) return;

    const container = monthsRef.current;
    const buttons = container.children;
    if (buttons[currentMonthIndex]) {
      const buttonElement = buttons[currentMonthIndex] as HTMLElement;
      const containerWidth = container.clientWidth;
      const buttonLeft = buttonElement.offsetLeft;
      const buttonWidth = buttonElement.clientWidth;

      // Calcular posição para centralizar perfeitamente
      const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: animated ? 'smooth' : 'instant',
      });
    }
  };

  // Centralizar no mês selecionado quando muda (sem animação para evitar "folhear")
  useEffect(() => {
    const timer = setTimeout(() => scrollToCurrentMonth(false), 50); // Instantâneo
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  // Centralizar no mount inicial (sem animação)
  useEffect(() => {
    const timer = setTimeout(() => scrollToCurrentMonth(false), 100); // Instantâneo

    // Listener para mudanças de orientação/resize (sem animação)
    const handleResize = () => {
      setTimeout(() => scrollToCurrentMonth(false), 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div className="px-4 pt-2 pb-4 md:relative md:z-auto sticky top-0 z-30 bg-gradient-to-b from-slate-50 via-white to-transparent dark:from-slate-900 dark:via-slate-800 dark:to-transparent transition-colors duration-150">
      {/* Container dos meses - design limpo */}
      <div className="relative group">
        <div
          className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-3 shadow-md border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-150 ${isSwiping ? 'scale-[0.98] shadow-lg' : ''}`}
        >
          {/* Gradiente sutil no fundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-slate-100/20 to-slate-200/40 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-slate-800/40 transition-colors duration-150"></div>

          {/* Indicador de swipe */}
          {isSwiping && (
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-2xl transition-opacity duration-150"></div>
          )}

          {/* Setinhas para desktop - z-index maior para funcionar */}
          <div className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30">
            <button
              onClick={() => handleNavigation('prev')}
              className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-150 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 active:scale-90 shadow-sm bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30">
            <button
              onClick={() => handleNavigation('next')}
              className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-150 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 active:scale-90 shadow-sm bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            ref={monthsRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-2 relative z-10 md:px-12 touch-pan-y"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-y pinch-zoom', // Permite scroll vertical, mas captura swipe horizontal
            }}
            {...touchHandlers}
          >
            {months.map((month, index) => (
              <Button
                key={month}
                size="sm"
                variant="ghost"
                onClick={() => {
                  onMonthChange(month);
                  scrollToCurrentMonth(true); // Anima quando clica direto no mês
                  // Não precisa mudar ano no click direto, só nos swipes nos limites
                }}
                className={`text-sm font-bold transition-all duration-150 ease-in-out flex-shrink-0 min-w-[85px] h-12 rounded-xl relative overflow-hidden ${selectedMonth === month
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105 border border-emerald-500'
                  : 'text-slate-700 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/30 hover:bg-slate-300/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300/40 dark:border-transparent hover:border-slate-400/60 dark:hover:border-slate-600/50'
                  }`}
              >
                <span className="relative z-10 flex flex-col items-center">
                  <span className="text-xs font-semibold tracking-wider">{month}</span>
                  <span className="text-[10px] opacity-80 font-medium">{selectedYear}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}
