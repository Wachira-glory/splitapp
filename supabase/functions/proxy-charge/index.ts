// Proxy Edge Function for Quikk / Unda M-Pesa charge
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import crypto from "https://deno.land/std@0.168.0/node/crypto.ts";

const QUIKK_URL = "https://tryapi.quikk.dev/v1/mpesa/charge";
const DATE_HEADER = "date";

// Keys stored in Supabase Function ENV
const QUIKK_KEY = Deno.env.get("QUIKK_KEY")!;
const QUIKK_SECRET = Deno.env.get("QUIKK_SECRET")!;

// ✅ Generate HMAC signature
function generateSignature() {
  const timestamp = new Date().toUTCString();
  const signatureBase = `${DATE_HEADER}: ${timestamp}`;
  const hmac = crypto.createHmac("sha256", QUIKK_SECRET)
    .update(signatureBase)
    .digest("base64");
  
  const encoded = encodeURIComponent(hmac);
  const authorization = `keyId="${QUIKK_KEY}",algorithm="hmac-sha256",headers="${DATE_HEADER}",signature="${encoded}"`;

  return { timestamp, authorization };
}

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("🚀 Incoming payload:", JSON.stringify(body, null, 2));

    const { timestamp, authorization } = generateSignature();

    const res = await fetch(QUIKK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        [DATE_HEADER]: timestamp,
        "Authorization": authorization,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    console.log("✅ Quikk/Unda Response:", json);

    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
