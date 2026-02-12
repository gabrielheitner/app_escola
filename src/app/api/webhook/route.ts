import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ============================================================
// Helpers
// ============================================================

/**
 * Normaliza status do Asaas/n8n para formato padronizado.
 * Ex: "pago" → "RECEIVED", "pendente" → "PENDING"
 */
function normalizeStatus(raw: string | undefined): string {
    if (!raw) return 'PENDING'
    const upper = raw.trim().toUpperCase()

    const map: Record<string, string> = {
        'PAGO': 'RECEIVED',
        'RECEBIDO': 'RECEIVED',
        'RECEIVED': 'RECEIVED',
        'CONFIRMED': 'RECEIVED',
        'PENDENTE': 'PENDING',
        'PENDING': 'PENDING',
        'OVERDUE': 'OVERDUE',
        'VENCIDO': 'OVERDUE',
        'VENCIDA': 'OVERDUE',
        'REFUNDED': 'REFUNDED',
        'ESTORNADO': 'REFUNDED',
        'CANCELLED': 'CANCELLED',
        'CANCELADO': 'CANCELLED',
        'CANCELADA': 'CANCELLED',
    }

    return map[upper] || upper
}

/**
 * Parseia datas vindas do n8n em vários formatos possíveis:
 * - "[DateTime: 2026-02-12T13:25:33.560-03:00]"  (n8n $now)
 * - "14-02-2026"  (DD-MM-YYYY)
 * - "14/02/2026"  (DD/MM/YYYY)
 * - "2026-02-14"  (ISO / YYYY-MM-DD)
 * - "2026-02-14T10:30:00Z" (ISO completo)
 * Retorna ISO string ou null.
 */
function parseDate(raw: any): string | null {
    if (!raw) return null

    let str = String(raw).trim()

    // Formato n8n DateTime: "[DateTime: 2026-02-12T13:25:33.560-03:00]"
    const dtMatch = str.match(/\[DateTime:\s*(.+?)\]/)
    if (dtMatch) {
        str = dtMatch[1].trim()
    }

    // Formato DD-MM-YYYY ou DD/MM/YYYY
    const dmy = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
    if (dmy) {
        const [, day, month, year] = dmy
        return `${year}-${month}-${day}`
    }

    // Tentar parse direto (ISO e variações)
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString()
    }

    return null
}

/**
 * Valida e extrai campos de um item de pagamento.
 * Retorna { valid: true, data } ou { valid: false, error }.
 */
function validatePaymentItem(item: any, index: number) {
    const errors: string[] = []

    if (!item.school_id) errors.push('school_id obrigatório')
    if (!item.asaas_payment_id) errors.push('asaas_payment_id obrigatório')
    if (item.value === undefined || item.value === null) errors.push('value obrigatório')
    if (!item.customer_name) errors.push('customer_name obrigatório')

    if (errors.length > 0) {
        return { valid: false as const, error: `Item ${index}: ${errors.join(', ')}` }
    }

    const dueDateParsed = parseDate(item.due_date)
    const paymentDateParsed = parseDate(item.payment_date)
    const dispatchDateParsed = parseDate(item.dispatch_date)

    return {
        valid: true as const,
        data: {
            school_id: item.school_id,
            asaas_payment_id: String(item.asaas_payment_id),
            customer_name: String(item.customer_name),
            customer_phone: item.customer_phone ? String(item.customer_phone) : null,
            value: Number(item.value),
            status: normalizeStatus(item.status),
            due_date: dueDateParsed || new Date().toISOString().split('T')[0],
            payment_date: paymentDateParsed,
            dispatch_date: dispatchDateParsed,
            message_sent: item.message_sent === true || item.message_sent === 'true',
            last_sync_date: new Date().toISOString(),
            description: item.description || null,
        }
    }
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(request: Request) {
    const timestamp = new Date().toISOString()

    try {
        // 1. Parse body
        let body: any
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { error: 'Body inválido — envie JSON válido' },
                { status: 400 }
            )
        }

        // 2. Suporte a batch: normalizar para array
        const items: any[] = Array.isArray(body) ? body : [body]

        if (items.length === 0) {
            return NextResponse.json(
                { error: 'Nenhum item enviado' },
                { status: 400 }
            )
        }

        // 3. Supabase client (Service Role para bypass RLS)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 4. Validar school_ids existentes (batch de uma vez)
        const uniqueSchoolIds = [...new Set(items.map(i => i.school_id).filter(Boolean))]

        const { data: validSchools } = await supabase
            .from('schools')
            .select('id')
            .in('id', uniqueSchoolIds)

        const validSchoolIdSet = new Set((validSchools || []).map(s => s.id))

        // 5. Processar cada item
        const results = {
            received: items.length,
            inserted: 0,
            errors: [] as string[],
            timestamp,
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // Validar campos
            const validation = validatePaymentItem(item, i)
            if (!validation.valid) {
                results.errors.push(validation.error)
                continue
            }

            // Validar school_id existe
            if (!validSchoolIdSet.has(validation.data.school_id)) {
                results.errors.push(`Item ${i}: school_id "${validation.data.school_id}" não encontrado`)
                continue
            }

            // Upsert
            const { error } = await supabase
                .from('payments')
                .upsert(validation.data, { onConflict: 'asaas_payment_id' })

            if (error) {
                results.errors.push(`Item ${i}: ${error.message}`)
            } else {
                results.inserted++
            }
        }

        // 6. Resposta
        const httpStatus = results.errors.length > 0 && results.inserted === 0 ? 422 : 200

        return NextResponse.json({
            success: results.inserted > 0,
            ...results,
        }, { status: httpStatus })

    } catch (error) {
        console.error('[WEBHOOK] Unexpected error:', error instanceof Error ? error.message : error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
