import { MainNav } from '@/components/dashboard/main-nav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MainNav />
            <main style={{ flex: 1, marginLeft: '240px' }}>
                {children}
            </main>
        </div>
    )
}
