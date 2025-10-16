'use client';

import { useState, useCallback } from 'react';

export const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

interface UseMonthNavigationProps {
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  swipeSensitivity?: number;
  enabled?: boolean;
}

export function useMonthNavigation({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  swipeSensitivity = 30,
  enabled = true,
}: UseMonthNavigationProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const navigateToMonth = useCallback((direction: 'next' | 'prev') => {
    if (!enabled) return;

    const currentIndex = MONTHS.findIndex(month => month === selectedMonth);

    if (direction === 'next') {
      if (currentIndex < MONTHS.length - 1) {
        onMonthChange(MONTHS[currentIndex + 1]);
      } else {
        // Dezembro -> Janeiro do próximo ano
        onYearChange(selectedYear + 1);
        onMonthChange(MONTHS[0]);
      }
    } else {
      if (currentIndex > 0) {
        onMonthChange(MONTHS[currentIndex - 1]);
      } else {
        // Janeiro -> Dezembro do ano anterior
        onYearChange(selectedYear - 1);
        onMonthChange(MONTHS[11]);
      }
    }
  }, [selectedMonth, selectedYear, onMonthChange, onYearChange, enabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;

    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;

    setTouchEnd(e.targetTouches[0].clientX);

    // Indicar que está fazendo swipe
    if (touchStart) {
      const distance = Math.abs(touchStart - e.targetTouches[0].clientX);
      if (distance > 15) {
        setIsSwiping(true);
      }
    }
  }, [touchStart, enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > swipeSensitivity;
    const isRightSwipe = distance < -swipeSensitivity;

    if (isLeftSwipe) {
      navigateToMonth('next');
    } else if (isRightSwipe) {
      navigateToMonth('prev');
    }

    // Reset das variáveis
    setTouchStart(0);
    setTouchEnd(0);
    setIsSwiping(false);
  }, [touchStart, touchEnd, swipeSensitivity, navigateToMonth, enabled]);

  return {
    isSwiping,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    navigateToMonth,
    months: MONTHS,
  };
}
