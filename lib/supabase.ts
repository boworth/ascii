import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key (for admin operations)
export function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface User {
  id: string
  username: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  label: string
  address: string
  cc_balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  wallet_id: string
  transaction_hash: string | null
  type: 'BUY' | 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
  usd_value: number | null
  status: 'pending' | 'completed' | 'failed'
  to_address: string | null
  from_address: string | null
  paid_with: string | null
  paid_amount: number | null
  created_at: string
  updated_at: string
}

export interface DailyPurchaseLimit {
  id: string
  wallet_id: string
  purchase_date: string
  total_cc_purchased: number
  daily_limit: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

