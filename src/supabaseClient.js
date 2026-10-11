import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wbymgazbcsgngneinjlk.supabase.co'
const supabaseAnonKey = 'sb_publishable_6noSVXbAlIA2hECyOxowQQ_FYyqvKtE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
