// lib/undaClient.ts - Unda System Integration with Enhanced Error Handling

import { createClient } from '@supabase/supabase-js';

// Unda Supabase Client - for reading payments
const undaSupabaseUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL || 'https://zpmyjmzvgmohyqhprqmr.supabase.co';
const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbXlqbXp2Z21vaHlxaHBycW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDE3MjAsImV4cCI6MjA2MjcxNzcyMH0.cn40M6H5wq2lthw8slqBwyEk7KJNWbvVFhGbUKhcdeg';

export const undaSupabase = createClient(undaSupabaseUrl, undaAnonKey);

// Unda API credentials for Edge Function
const UNDA_API_USERNAME = process.env.NEXT_PUBLIC_UNDA_API_USERNAME || '18.ac3356009b7c486e9058a383d15697ed@unda.co';
const UNDA_API_PASSWORD = process.env.NEXT_PUBLIC_UNDA_API_PASSWORD || 'b46ceded2e1c45fe9c5012b96172a833';

// Generate Basic Auth header
export const getUndaAuthHeader = () => {
  const credentials = btoa(`${UNDA_API_USERNAME}:${UNDA_API_PASSWORD}`);
  return `Basic ${credentials}`;
};

// Unda Edge Function URL
export const UNDA_MPESA_CHARGE_URL = `${undaSupabaseUrl}/functions/v1/mpesa-charge`;

// Data mapping: Unda payments → SplitBill format
export interface UndaPayment {
  id: number;
  public_id: number;
  p_id: number;
  channel_id: number;
  from_ac_id?: number;
  to_ac_id?: number;
  uid?: string;
  txn_id?: string;
  amount: number;
  reference?: string;
  category?: string;
  status: string;
  fees?: any;
  data?: any;
  idata?: any;
  p_fk?: any;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SplitBillPayment {
  id: number;
  bill_id: string;
  name: string;
  phone: string;
  amount: number;
  till_number: string;
  status: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  // Unda metadata
  unda_txn_id?: string;
  unda_public_id?: number;
}

/**
 * Map Unda payment to SplitBill format
 */
export const mapUndaToSplitBill = (undaPayment: UndaPayment, billId?: string): SplitBillPayment => {
  // Extract phone from idata or data
  const phone = undaPayment.idata?.customer_no || 
                undaPayment.data?.phone || 
                undaPayment.data?.customer_no || 
                '';
  
  // Extract name from data or reference
  const name = undaPayment.data?.name || 
               undaPayment.reference?.split('-')[1] || 
               'Customer';
  
  // Extract till number (paybill)
  const tillNumber = undaPayment.idata?.short_code || 
                     undaPayment.data?.paybill || 
                     undaPayment.data?.short_code || 
                     '';

  return {
    id: undaPayment.id,
    bill_id: billId || undaPayment.reference || `bill-${undaPayment.public_id}`,
    name: name,
    phone: phone,
    amount: Number(undaPayment.amount),
    till_number: tillNumber,
    status: mapUndaStatus(undaPayment.status),
    paid_at: undaPayment.status === 'SUCCESS' ? undaPayment.updated_at : undefined,
    created_at: undaPayment.created_at,
    updated_at: undaPayment.updated_at,
    unda_txn_id: undaPayment.txn_id,
    unda_public_id: undaPayment.public_id
  };
};

/**
 * Map Unda status to SplitBill status
 */
export const mapUndaStatus = (undaStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'SUCCESS': 'paid',
    'PENDING': 'pending',
    'FAILED': 'cancelled',
    'PROCESSING': 'pending',
    'INITIATED': 'pending',
    'EXPIRED': 'cancelled',
    'CANCELLED': 'cancelled'
  };
  
  return statusMap[undaStatus?.toUpperCase()] || 'pending';
};

/**
 * Fetch payments from Unda
 */
export const fetchUndaPayments = async (billId?: string): Promise<SplitBillPayment[]> => {
  try {
    let query = undaSupabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by bill_id if provided (reference field in Unda)
    if (billId) {
      query = query.eq('reference', billId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching Unda payments:', error);
      return [];
    }
    
    return (data || []).map(payment => mapUndaToSplitBill(payment, billId));
  } catch (error) {
    console.error('Exception fetching Unda payments:', error);
    return [];
  }
};

/**
 * Send STK Push via Unda Edge Function
 */
export const sendUndaSTKPush = async (
  phone: string, 
  amount: number, 
  paybill: string, 
  reference: string,
  name?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.log('🔄 Sending STK Push request:', { phone, amount, paybill, reference, name });

    const response = await fetch(UNDA_MPESA_CHARGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${undaAnonKey}`
      },
      body: JSON.stringify({
        phone: phone,
        amount: amount,
        paybill: paybill,
        reference: reference,
        name: name || 'Customer'
      })
    });

    // Get response text first for debugging
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return { 
        success: false, 
        error: `Invalid response from server: ${responseText.substring(0, 100)}` 
      };
    }
    
    console.log('✅ Parsed response:', result);
    
    // Check for success
    if (response.ok && (result.success || result.data || result.txn_id)) {
      return { 
        success: true, 
        data: result 
      };
    } else {
      const errorMessage = result.error || 
                          result.message || 
                          result.statusText || 
                          `Request failed with status ${response.status}`;
      
      console.error('❌ Request failed:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  } catch (error: any) {
    console.error('❌ Unda STK Push Error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred' 
    };
  }
};

/**
 * Get payment by transaction ID from Unda
 */
export const getUndaPaymentByTxnId = async (txnId: string): Promise<SplitBillPayment | null> => {
  try {
    const { data, error } = await undaSupabase
      .from('payments')
      .select('*')
      .eq('txn_id', txnId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching payment by txn_id:', error);
      return null;
    }
    
    return mapUndaToSplitBill(data);
  } catch (error) {
    console.error('Exception fetching payment by txn_id:', error);
    return null;
  }
};

/**
 * Get payment by public_id from Unda
 */
export const getUndaPaymentByPublicId = async (publicId: number): Promise<SplitBillPayment | null> => {
  try {
    const { data, error } = await undaSupabase
      .from('payments')
      .select('*')
      .eq('public_id', publicId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching payment by public_id:', error);
      return null;
    }
    
    return mapUndaToSplitBill(data);
  } catch (error) {
    console.error('Exception fetching payment by public_id:', error);
    return null;
  }
};

/**
 * Watch for payment status updates (real-time)
 */
export const subscribeToPaymentUpdates = (
  billId: string,
  callback: (payment: SplitBillPayment) => void
) => {
  console.log(`📡 Subscribing to payment updates for bill: ${billId}`);
  
  const channel = undaSupabase
    .channel(`payments:${billId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `reference=eq.${billId}`
      },
      (payload) => {
        console.log('🔔 Payment update received:', payload);
        if (payload.new) {
          const mappedPayment = mapUndaToSplitBill(payload.new as UndaPayment, billId);
          callback(mappedPayment);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  return () => {
    console.log(`📡 Unsubscribing from payment updates for bill: ${billId}`);
    channel.unsubscribe();
  };
};

/**
 * Normalize phone number to 254 format
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Remove any spaces or dashes
  phone = phone.replace(/[\s-]/g, '');
  
  // Convert 07XX to 2547XX
  if (phone.startsWith('07')) {
    return '254' + phone.substring(1);
  }
  
  // Convert 01XX to 2541XX
  if (phone.startsWith('01')) {
    return '254' + phone.substring(1);
  }
  
  // Already in 254 format
  if (phone.startsWith('254')) {
    return phone;
  }
  
  // Add 254 prefix if missing
  if (phone.startsWith('7') || phone.startsWith('1')) {
    return '254' + phone;
  }
  
  return phone;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  
  // Check if it's a valid Kenyan phone number
  // 254 7XX XXX XXX (Safaricom, Airtel)
  // 254 1XX XXX XXX (Safaricom, Airtel landline)
  return /^254[71]\d{8}$/.test(normalized);
};

/**
 * Get payment statistics for a bill
 */
export const getPaymentStats = async (billId: string) => {
  try {
    const payments = await fetchUndaPayments(billId);
    
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failed = payments.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total_amount: total,
      paid_amount: paid,
      pending_amount: pending,
      failed_amount: failed,
      total_participants: payments.length,
      paid_participants: payments.filter(p => p.status === 'paid').length,
      pending_participants: payments.filter(p => p.status === 'pending').length,
      failed_participants: payments.filter(p => p.status === 'cancelled').length,
      completion_rate: total > 0 ? (paid / total) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    return null;
  }
};