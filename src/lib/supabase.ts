import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on your schema
export interface Payment {
  id: number
  bill_id: string
  name: string
  phone: string
  amount: number
  till_number: string
  status: 'pending' | 'paid' | 'cancelled'
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  total_amount: number
  till_number: string
  number_of_diners: number
  amount_per_person: number
  payment_method: 'stk' | 'link'
  share_link: string | null
  status: 'pending' | 'completed' | 'cancelled'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PaymentStats {
  completed_count: number
  pending_count: number
  cancelled_count: number
  total_paid_amount: number
  total_pending_amount: number
  total_bills: number
}