import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma data para string no formato YYYY-MM-DD usando timezone local
 * Evita problemas de conversão UTC que podem mudar o dia
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parser de data local para evitar conversão UTC
 * Converte string "YYYY-MM-DD" para Date no timezone local
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Formata moeda em pt-BR (BRL)
export function formatCurrencyBR(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    ...options,
  }).format(value)
}

// Extrai iniciais de um nome completo (máx. 2 letras)
export function extractInitials(fullName: string, size: number = 2) {
  if (!fullName) return ''
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, Math.max(1, size))
}

// Deriva mês/ano a partir de uma string de data (YYYY-MM-DD) ou Date atual
export function deriveMonthYear(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date()
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}

// Retorna início/fim do mês (YYYY-MM-DD) e os números de mês/ano
export function getMonthlyRange(month?: number, year?: number) {
  const now = new Date()
  const m = month ?? now.getMonth() + 1
  const y = year ?? now.getFullYear()
  const startDate = `${y}-${m.toString().padStart(2, '0')}-01`
  const endDate = getLocalDateString(new Date(y, m, 0))
  return { startDate, endDate, month: m, year: y }
}

// Verifica se uma operação foi abortada
export function isAborted(signal?: AbortSignal | null) {
  try {
    return !!signal?.aborted
  } catch {
    return false
  }
}
