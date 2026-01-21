import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SCHOOL_ID = '7e21c851-2a05-4440-9734-dee35e5ecc86'
const EMAIL = 'admin@escola.com'
const PASSWORD = 'password123'

async function createAdminUser() {
    console.log(`Creating user: ${EMAIL}...`)

    // 1. Create Auth User
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true
    })

    if (authError) {
        console.error('Error creating user:', authError.message)
        return
    }

    const userId = user.user?.id
    console.log(`User created (ID: ${userId})`)

    // 2. Create Profile linked to School
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: EMAIL,
            role: 'school', // Giving 'school' access to see their own data
            school_id: SCHOOL_ID
        })

    if (profileError) {
        console.error('Error creating profile:', profileError.message)
    } else {
        console.log('Profile linking successful!')
        console.log('------------------------------------------------')
        console.log('LOGIN CREDENTIALS:')
        console.log(`Email: ${EMAIL}`)
        console.log(`Password: ${PASSWORD}`)
        console.log('------------------------------------------------')
    }
}

createAdminUser()
