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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                style={{ height: '1rem', width: '1rem', color: 'var(--text-muted)' }}
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ 45.231,89</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+20.1% em relação ao mês anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Recebido</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                style={{ height: '1rem', width: '1rem', color: 'var(--text-muted)' }}
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <polyline points="17 11 19 13 23 9" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ 23.500,00</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+180.1% em relação ao mês anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Pendente</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                style={{ height: '1rem', width: '1rem', color: 'var(--text-muted)' }}
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ 12.234,00</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+19% em relação ao mês anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Taxa de Conversão</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                style={{ height: '1rem', width: '1rem', color: 'var(--text-muted)' }}
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>57.3%</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+2.1% desde a última hora</p>
                    </CardContent>
                </Card>
            </div>

            <div className={`${styles.grid} ${styles['grid-cols-7']}`}>
                <Card className={styles['col-span-4']}>
                    <CardHeader>
                        <CardTitle>Visão Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Overview />
                    </CardContent>
                </Card>
                <Card className={styles['col-span-3']}>
                    <CardHeader>
                        <CardTitle>Recentes</CardTitle>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Você teve 265 pagamentos este mês.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <RecentSales />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
