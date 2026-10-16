import { createClient } from '@supabase/supabase-js'

// Les vraies valeurs sont configurées dans Vercel. Ces valeurs neutres permettent
// la compilation locale sans exposer ni exiger de secret.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
