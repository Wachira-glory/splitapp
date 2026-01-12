import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Add CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { amount, destination_shortcode, bill_id } = await req.json()
    
    // 1. Get Unda Auth Token (Using your Unda Credentials)
    const authRes = await fetch(`${Deno.env.get("NEXT_PUBLIC_UNDA_SUPABASE_URL")}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 
        'apikey': Deno.env.get("NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY")!, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        email: Deno.env.get("NEXT_PUBLIC_UNDA_API_USERNAME"), 
        password: Deno.env.get("NEXT_PUBLIC_UNDA_API_PASSWORD") 
      })
    })
    
    const authData = await authRes.json()
    const access_token = authData.access_token

    // 2. Trigger the B2B Payout (The Settlement)
    const settleRes = await fetch(`${Deno.env.get("NEXT_PUBLIC_UNDA_SUPABASE_URL")}/rest/v1/rpc/b2b_payout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': Deno.env.get("NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY")!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        destination_type: 'PAYBILL', 
        destination_shortcode: destination_shortcode,
        reference: `SETTLE-${bill_id}`
      })
    })

    console.log(`✅ Settlement triggered for Bill ${bill_id}: KES ${amount}`)
    
    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } 
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})