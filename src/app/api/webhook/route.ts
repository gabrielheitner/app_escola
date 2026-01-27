import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    console.log('========================================')
    console.log('[WEBHOOK] Received POST request')
    console.log('[WEBHOOK] Timestamp:', new Date().toISOString())

    try {
        const body = await request.json()
        console.log('[WEBHOOK] Body received:', JSON.stringify(body, null, 2))

        // We use the Service Role key here to bypass RLS, 
        // allowing us to insert payments for ANY school.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const {
            school_id,
            asaas_payment_id,
            customer_name,
            customer_phone,
            value,
            status,
            due_date,
            payment_date,
            dispatch_date,
            message_sent,
            description
        } = body

        console.log('[WEBHOOK] Extracted fields:', {
            school_id,
            asaas_payment_id,
            value,
            status
        })

        // Validation (Basic)
        if (!school_id || !asaas_payment_id || !value) {
            console.error('[WEBHOOK] Validation failed - missing required fields')
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('[WEBHOOK] Validation passed, upserting to Supabase...')

        // Upsert payment (Insert or Update if exists)
        const { data, error } = await supabase
            .from('payments')
            .upsert({
                school_id,
                asaas_payment_id,
                customer_name,
                customer_phone,
                value,
                status,
                due_date,
                payment_date: payment_date || null,
                dispatch_date: dispatch_date || null,
                message_sent: message_sent || false,
                last_sync_date: new Date().toISOString(),
                description
            }, { onConflict: 'asaas_payment_id' })
            .select()

        if (error) {
            console.error('[WEBHOOK] Supabase Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log('[WEBHOOK] Success! Data inserted:', data)
        console.log('========================================')
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('[WEBHOOK] Catch Error:', error)
        console.error('[WEBHOOK] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        console.log('========================================')
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

