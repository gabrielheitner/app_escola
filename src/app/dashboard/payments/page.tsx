import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import styles from './payments.module.css'

export default async function PaymentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get current user's school_id (or all if admin)
    // For now, simpler query assuming School role or checking filtering
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Pagamentos</h1>
                {/* Placeholder for filters */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ height: '32px', fontSize: '13px' }}>Novo Filtro</button>
                </div>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments?.map((payment) => (
                            <tr key={payment.id} className={styles.row}>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{payment.customer_name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.asaas_payment_id}</div>
                                </td>
                                <td>{payment.customer_phone || '-'}</td>
                                <td>
                                    <span className={`${styles.badge} ${payment.status === 'RECEIVED' || payment.status === 'CONFIRMED' ? styles.success : payment.status === 'PENDING' ? styles.warning : styles.danger}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.value)}
                                </td>
                                <td>
                                    {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                                </td>
                            </tr>
                        ))}

                        {(!payments || payments.length === 0) && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Nenhum pagamento encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
