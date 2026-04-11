import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('--- Orders ---')
  const { data: orders, error: ordersErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
  if (ordersErr) console.log(ordersErr)
  else console.log(orders)

  console.log('--- Profiles ---')
  const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*').limit(5)
  if (profilesErr) console.log(profilesErr)
  else console.log(profiles)
}

check()
