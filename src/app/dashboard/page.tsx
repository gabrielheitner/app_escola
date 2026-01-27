'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import styles from './dashboard.module.css'

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    const [allPayments, setAllPayments] = useState<any[]>([])
    const [filteredPayments, setFilteredPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null
    })

    useEffect(() => {
        checkUser()
        fetchPayments()
    }, [])

    useEffect(() => {
        filterPaymentsByDate()
    }, [dateRange, allPayments])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
        }
    }

    async function fetchPayments() {
        setLoading(true)
        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000)

        setAllPayments(payments || [])
        setLoading(false)
    }

    function filterPaymentsByDate() {
        if (!dateRange.start || !dateRange.end) {
            setFilteredPayments(allPayments)
            return
        }

        const filtered = allPayments.filter(payment => {
            const paymentDate = new Date(payment.created_at)
            return paymentDate >= dateRange.start! && paymentDate <= dateRange.end!
        })

        setFilteredPayments(filtered)
    }

    function handleDateRangeChange(startDate: Date | null, endDate: Date | null) {
        setDateRange({ start: startDate, end: endDate })
    }

    // Calculate KPIs using filtered payments
    const totalCobrado = filteredPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const receivedPayments = filteredPayments.filter(p => ['RECEIVED', 'CONFIRMED', 'PAGO'].includes(p.status?.toUpperCase()))
    const totalRecebido = receivedPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const pendingPayments = filteredPayments.filter(p => ['PENDING', 'PENDENTE', 'OVERDUE'].includes(p.status?.toUpperCase()))
    const totalPendente = pendingPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const conversionRate = filteredPayments.length > 0
        ? ((receivedPayments.length / filteredPayments.length) * 100).toFixed(1)
        : '0.0'

    // Conversion KPIs
    const dispatchedPayments = filteredPayments.filter(p => p.message_sent)
    const convertedPayments = dispatchedPayments.filter(p => ['RECEIVED', 'CONFIRMED', 'PAGO'].includes(p.status?.toUpperCase()))
    const valorRecuperado = convertedPayments.reduce((acc, curr) => acc + Number(curr.value), 0)

    const conversions = filteredPayments.filter(p => p.conversion_time_hours && p.conversion_time_hours > 0)
    const avgConversionTime = conversions.length > 0
        ? Math.round(conversions.reduce((acc, p) => acc + Number(p.conversion_time_hours), 0) / conversions.length)
        : null

    // Prepare Overview Data (Monthly)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const overviewData = months.map((month, index) => {
        const monthPayments = filteredPayments.filter(p => {
            const date = new Date(p.due_date)
            return date.getMonth() === index && date.getFullYear() === new Date().getFullYear()
        })
        const total = monthPayments.reduce((acc, curr) => acc + Number(curr.value), 0)
        return { name: month, total }
    })

    // Prepare Recent Sales
    const recentSales = filteredPayments.slice(0, 5).map(p => ({
        id: p.id,
        name: p.customer_name,
        email: p.customer_phone || '-',
        amount: Number(p.value)
    }))

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p>Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2 className={styles.title}>Dashboard</h2>
                <div className={styles.actions}>
                    <DateRangePicker onDateRangeChange={handleDateRangeChange} />
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

            <div className={`${styles.grid} ${styles['grid-cols-4']}`} style={{ marginTop: '1.5rem' }}>
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Disparos Realizados</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {dispatchedPayments.length}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mensagens enviadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Convertidos</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {convertedPayments.length}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {dispatchedPayments.length > 0
                                ? `${((convertedPayments.length / dispatchedPayments.length) * 100).toFixed(1)}% de conversão`
                                : '0% de conversão'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Valor Recuperado</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorRecuperado)}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pós-disparo</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Tempo Médio</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {avgConversionTime ? `${avgConversionTime}h` : '-'}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>De conversão</p>
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
