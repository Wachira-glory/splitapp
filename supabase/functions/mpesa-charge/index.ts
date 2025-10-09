// supabase/functions/mpesa-charge/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const QUIKK_URL = "https://tryapi.quikk.dev/v1/mpesa/charge"
const DATE_HEADER = "date"

const CREDENTIALS = {
  key: Deno.env.get("QUIKK_API_KEY") || "",
  secret: Deno.env.get("QUIKK_API_SECRET") || ""
}

// Generate HMAC signature - Fixed async handling
async function generateHmacSignature(): Promise<[string, string]> {
  const timestamp = new Date().toUTCString()
  const toEncode = `${DATE_HEADER}: ${timestamp}`
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(CREDENTIALS.secret)
  const messageData = encoder.encode(toEncode)
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData)
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
  const urlEncoded = encodeURIComponent(base64Signature)
  const authString = `keyId="${CREDENTIALS.key}",algorithm="hmac-sha256",headers="${DATE_HEADER}",signature="${urlEncoded}"`
  
  return [timestamp, authString]
}

// Format phone number to 254 format
function formatPhone(phone: string): string {
  phone = phone.replace(/[\s\-\(\)]/g, '')
  
  if (phone.startsWith('07')) {
    return '254' + phone.substring(1)
  }
  if (phone.startsWith('01')) {
    return '254' + phone.substring(1)
  }
  if (phone.startsWith('+254')) {
    return phone.substring(1)
  }
  if (phone.startsWith('254')) {
    return phone
  }
  
  return phone
}

// Validate phone number
function validatePhone(phone: string): boolean {
  const formatted = formatPhone(phone)
  return /^254(7|1)\d{8}$/.test(formatted)
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8) // For tracking parallel requests
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { amount, phone, paybill, reference } = await req.json()

    console.log(`[${requestId}] Received Request:`, { amount, phone, paybill, reference })

    // Validate inputs
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return new Response(
        JSON.stringify({ error: "Valid amount is required" }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    if (!paybill) {
      return new Response(
        JSON.stringify({ error: "Paybill/Till number is required" }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Format and validate phone number
    const formattedPhone = formatPhone(phone)
    
    if (!validatePhone(formattedPhone)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid phone number format. Use: 254XXXXXXXXX, 07XXXXXXXX, or 01XXXXXXXX" 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Generate HMAC signature
    const [timestamp, authString] = await generateHmacSignature()

    // Construct Quikk API request
    const requestBody = {
      data: {
        id: "gid",
        type: "charge",
        attributes: {
          amount: parseFloat(amount),
          posted_at: new Date().toISOString(),
          reference: reference || "SplitBill Payment",
          short_code: paybill.toString(),
          customer_no: formattedPhone,
          customer_type: "msisdn"
        }
      }
    }

    console.log(`[${requestId}] Sending to Quikk:`, formattedPhone)

    // Send request to Quikk API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const response = await fetch(QUIKK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        [DATE_HEADER]: timestamp,
        "Authorization": authString,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    const responseData = await response.json()
    
    console.log(`[${requestId}] Quikk Response:`, responseData.meta?.status || 'success')

    // Check for errors in response
    if (responseData.errors || responseData.meta?.status === 'FAIL') {
      return new Response(
        JSON.stringify({ 
          error: "Payment request failed", 
          details: responseData.errors || responseData.meta?.detail || "Unknown error"
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "STK Push sent successfully",
        data: responseData,
        phone: formattedPhone // Return formatted phone for confirmation
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error: any) {
    console.error(`[${requestId}] Payment Error:`, error.message)
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ 
          error: "Request timeout",
          message: "The payment request took too long. Please try again."
        }),
        { 
          status: 504,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})