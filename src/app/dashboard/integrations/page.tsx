import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import styles from './integrations.module.css'

export default async function IntegrationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

    const webhookUrl = 'https://app.gerautomacoes.com.br/api/webhook'

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Integrações &amp; API</h1>
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
                        <h3>Envio Único (1 pagamento)</h3>
                        <p>Envie um objeto JSON com os dados do pagamento.</p>
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
  "due_date": "14-02-2026",
  "dispatch_date": "{{ $now }}",
  "message_sent": true,
  "payment_date": null,
  "description": "Mensalidade Janeiro 2026"
}`}
                        </pre>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Envio em Lote (batch)</h3>
                        <p>Envie um array de pagamentos de uma vez.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <pre className={styles.pre}>
                            {`[
  { "school_id": "...", "asaas_payment_id": "pay_1", ... },
  { "school_id": "...", "asaas_payment_id": "pay_2", ... }
]`}
                        </pre>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Formatos de Data Aceitos</h3>
                        <p>O endpoint aceita vários formatos automaticamente.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <pre className={styles.pre}>
                            {`✅ "14-02-2026"          (DD-MM-AAAA)
✅ "14/02/2026"          (DD/MM/AAAA)
✅ "2026-02-14"          (AAAA-MM-DD)
✅ "2026-02-14T10:30:00Z" (ISO completo)
✅ "{{ $now }}"           (n8n DateTime)`}
                        </pre>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Status Aceitos</h3>
                        <p>Mapeamento automático de status.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <pre className={styles.pre}>
                            {`PENDING / PENDENTE   →  PENDING
RECEIVED / PAGO / RECEBIDO / CONFIRMED  →  RECEIVED
OVERDUE / VENCIDO / VENCIDA  →  OVERDUE
CANCELLED / CANCELADO  →  CANCELLED
REFUNDED / ESTORNADO  →  REFUNDED`}
                        </pre>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Resposta da API</h3>
                        <p>Formato da resposta retornada pelo webhook.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <pre className={styles.pre}>
                            {`{
  "success": true,
  "received": 3,
  "success": 2,
  "errors": ["Item 2: school_id não encontrado"],
  "timestamp": "2026-02-12T13:00:00.000Z"
}`}
                        </pre>
                        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <strong>Campos obrigatórios:</strong> school_id, asaas_payment_id, customer_name, value
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
