'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CentralizedAppProvider } from '@/hooks/useCentralizedAppContext'

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CentralizedAppProvider>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </CentralizedAppProvider>
    )
}
