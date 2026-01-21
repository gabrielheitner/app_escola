import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()

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
            description
        } = body

        // Validation (Basic)
        if (!school_id || !asaas_payment_id || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

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
                description
            }, { onConflict: 'asaas_payment_id' })
            .select()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
