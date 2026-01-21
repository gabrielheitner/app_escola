import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all payments for the user's school (RLS handles filtering)
    // In a real heavy app, we would use Supabase .rpc() or count() for performant aggregates
    // For now, fetching all (limit 1000) and calculating JS side is fine for MVP
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

    const allPayments = payments || []

    // 1. Calculate KPIs
    const totalCobrado = allPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    // Status can be 'RECEIVED', 'CONFIRMED', 'PAGO' (n8n might send distinct values)
    const receivedPayments = allPayments.filter(p => ['RECEIVED', 'CONFIRMED', 'PAGO'].includes(p.status?.toUpperCase()))
    const totalRecebido = receivedPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const pendingPayments = allPayments.filter(p => ['PENDING', 'PENDENTE', 'OVERDUE'].includes(p.status?.toUpperCase()))
    const totalPendente = pendingPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const conversionRate = allPayments.length > 0
        ? ((receivedPayments.length / allPayments.length) * 100).toFixed(1)
        : '0.0'

    // 2. Prepare Overview Data (Monthly)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const overviewData = months.map((month, index) => {
        const monthPayments = allPayments.filter(p => {
            const date = new Date(p.due_date) // or created_at? typically financial is cash basis (payment_date) or accrual (due_date)
            return date.getMonth() === index && date.getFullYear() === new Date().getFullYear()
        })
        const total = monthPayments.reduce((acc, curr) => acc + Number(curr.value), 0)
        return { name: month, total }
    })

    // 3. Prepare Recent Sales
    // We don't have email in payments table, so we use customer_name or phone
    const recentSales = allPayments.slice(0, 5).map(p => ({
        id: p.id,
        name: p.customer_name,
        email: p.customer_phone || '-', // Using phone as subtitle fallback
        amount: Number(p.value)
    }))

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2 className={styles.title}>Dashboard</h2>
                <div className={styles.actions}>
                    <DateRangePicker />
                </div>
            </div>

            <div className={`${styles.grid} ${styles['grid-cols-4']}`}>
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Total Cobrado</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCobrado)}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Recebido</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+0% do último mês</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Pendente</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Taxa de Conversão</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{conversionRate}%</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</p>
                    </CardContent>
                </Card>
            </div>

            <div className={`${styles.grid} ${styles['grid-cols-7']}`}>
                <Card className={styles['col-span-4']}>
                    <CardHeader>
                        <CardTitle>Visão Geral (Anual)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Overview data={overviewData} />
                    </CardContent>
                </Card>
                <Card className={styles['col-span-3']}>
                    <CardHeader>
                        <CardTitle>Recentes</CardTitle>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Últimos {recentSales.length} pagamentos registrados.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <RecentSales sales={recentSales} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
