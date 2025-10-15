import { useEffect, useRef } from 'react'

/**
 * Hook para bloquear/desbloquear o scroll do body
 * Útil para modais, overlays ou componentes expandidos no mobile
 */
export function useScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0)
  const originalStylesRef = useRef<{
    overflow: string
    position: string
    top: string
    width: string
  }>({
    overflow: '',
    position: '',
    top: '',
    width: ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isLocked) {
      // Salvar posição atual do scroll
      scrollPositionRef.current = window.pageYOffset

      // Salvar estilos originais
      const computedStyle = window.getComputedStyle(document.body)
      originalStylesRef.current = {
        overflow: computedStyle.overflow,
        position: computedStyle.position,
        top: document.body.style.top,
        width: document.body.style.width
      }

      // Aplicar scroll lock
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      document.body.style.left = '0'
    } else {
      // Restaurar estilos originais
      document.body.style.overflow = originalStylesRef.current.overflow
      document.body.style.position = originalStylesRef.current.position
      document.body.style.top = originalStylesRef.current.top
      document.body.style.width = originalStylesRef.current.width
      document.body.style.left = ''

      // Restaurar posição do scroll
      window.scrollTo(0, scrollPositionRef.current)
    }

    return () => {
      // Cleanup: sempre restaurar o estado original
      if (isLocked) {
        document.body.style.overflow = originalStylesRef.current.overflow
        document.body.style.position = originalStylesRef.current.position
        document.body.style.top = originalStylesRef.current.top
        document.body.style.width = originalStylesRef.current.width
        document.body.style.left = ''
        window.scrollTo(0, scrollPositionRef.current)
      }
    }
  }, [isLocked])
}
