// supabase/functions/mpesa-callback/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")!;
const MPESA_CHARGE_TIMEOUT_SEC = parseInt(Deno.env.get("MPESA_CHARGE_TIMEOUT_SEC") ?? "20");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabaseQueryClient = (() => {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
})();

async function handleMpesaCallback(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    if (!payload?.data?.attributes) {
      return new Response(JSON.stringify({ error: "Invalid payload structure" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { txn_id, amount, sender_no_sha256, reference, status } = payload.data.attributes;

    console.log(`[🔔] Incoming callback for txn_id: ${txn_id}, reference: ${reference}, status: ${status}`);
    console.log("Looking for payment with:", { txn_id, amount, reference, sender_no_sha256 });

    // Lookup payment using your RPC
    const { data: payments, error: findError } = await supabaseQueryClient.rpc('find_matching_payment', {
      param_amount: amount ?? null,
      param_id: null,
      param_charge_txn_charge_id: null,
      param_txn_id: txn_id ?? null,
      param_sender_sha256: sender_no_sha256 ?? null,
      param_reference: reference ?? null,
      param_seconds_ago: MPESA_CHARGE_TIMEOUT_SEC,
    });

    if (findError) throw findError;

    const existingPayment = payments?.[0];

    if (existingPayment) {
      const { error: rpcError } = await supabaseQueryClient.rpc('job_payment_update_quikk_response', {
        param_p_id: existingPayment.p_id,
        param_payment_id: existingPayment.id,
        param_payload: payload,
        param_log_type: 'payin_ipn',
      });

      if (rpcError) throw rpcError;

      console.log(`[✅] Payment ${existingPayment.id} updated successfully to status: ${status}`);
    } else {
      console.warn(`[⚠️] No matching payment found for txn_id: ${txn_id}, reference: ${reference}`);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[❌] Callback error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(handleMpesaCallback);
