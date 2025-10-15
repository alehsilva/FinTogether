'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCentralizedApp } from './useCentralizedApp'

type CentralizedAppContextType = ReturnType<typeof useCentralizedApp>

const CentralizedAppContext = createContext<CentralizedAppContextType | null>(null)

export function CentralizedAppProvider({ children }: { children: ReactNode }) {
    const centralizedApp = useCentralizedApp()

    return (
        <CentralizedAppContext.Provider value={centralizedApp}>
            {children}
        </CentralizedAppContext.Provider>
    )
}

export function useCentralizedAppContext() {
    const context = useContext(CentralizedAppContext)
    if (!context) {
        throw new Error('useCentralizedAppContext must be used within CentralizedAppProvider')
    }
    return context
}
