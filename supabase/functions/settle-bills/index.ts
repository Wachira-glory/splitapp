import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { record } = await req.json()

    const { data: bill, error: billError } = await supabaseAdmin
      .from('bills')
      .select('*, merchants(paybill_number)')
      .eq('id', record.id)
      .single()

    if (billError || !bill.merchants?.paybill_number) {
      throw new Error("Merchant details not found")
    }

    const undaResponse = await fetch(`${Deno.env.get('NEXT_PUBLIC_UNDA_SUPABASE_URL')}/functions/v1/api-channels-mpesa-charge-req`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-platform-uid': Deno.env.get('UNDA_PLATFORM_UID')!,
        'Authorization': `Bearer ${Deno.env.get('NEXT_PUBLIC_UNDA_JWT')}`
      },
      body: JSON.stringify({
        command_id: "BusinessPayBill",
        amount: Math.floor(bill.total_amount - 22),
        sender_shortcode: "174379",
        destination_shortcode: bill.merchants.paybill_number,
        account_reference: "SETTLE",
        remarks: `Bill ${bill.id}`
      })
    })

    if (undaResponse.ok) {
      await supabaseAdmin.from('bills').update({ is_settled: true }).eq('id', bill.id)
      return new Response(JSON.stringify({ status: "Success" }), { status: 200 })
    }
    
    throw new Error("Unda transfer failed")
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})