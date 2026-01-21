import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    // Check if school exists
    const { data: existing } = await supabase
        .from('schools')
        .select('id, name')
        .eq('slug', 'default-school')
        .single()

    if (existing) {
        console.log('School already exists:', existing)
        console.log('SCHOOL_ID:', existing.id)
        return
    }

    // Create school
    const { data: newSchool, error } = await supabase
        .from('schools')
        .insert({
            name: 'Escola Modelo',
            slug: 'default-school'
        })
        .select()
        .single()

    if (error) {
        console.log('Error creating school:', error)
    } else {
        console.log('School created successfully!')
        console.log('SCHOOL_ID:', newSchool.id)
    }
}

seed()
