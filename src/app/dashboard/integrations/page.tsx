import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import styles from './integrations.module.css'

export default async function IntegrationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Getting school ID for context (admin gets generic info for now)
    const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

    // Fallback if production URL is not set (localhost)
    // NOTE: In production (Vercel), we manually set this or use window.location in client
    // For server component, we can use a hardcoded value or env
    const webhookUrl = 'https://app-escola-five.vercel.app/api/webhook'

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Integrações & API</h1>
                <p className={styles.subtitle}>Configure a comunicação entre o n8n/Asaas e o seu Dashboard.</p>
            </header>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Webhook URL</h3>
                        <p>Endpoint para receber atualizações de pagamento.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.codeBlock}>
                            <code>{webhookUrl}</code>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Configure seu workflow no n8n para enviar um <strong>POST</strong> para esta URL.
                        </p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Documentação (JSON Body)</h3>
                        <p>Estrutura obrigatória para o envio dos dados.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <pre className={styles.pre}>
                            {`{
  "school_id": "${profile?.school_id || 'SEU_SCHOOL_ID_AQUI'}",
  "asaas_payment_id": "pay_123456789",
  "customer_name": "Nome do Cliente",
  "customer_phone": "5511999999999",
  "value": 150.00,
  "status": "PENDING",
  "due_date": "2024-12-31"
}`}
                        </pre>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <strong>Importante:</strong> O <code>school_id</code> deve ser exatamente o da sua escola para garantir a segurança dos dados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
