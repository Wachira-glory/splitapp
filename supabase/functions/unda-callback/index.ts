// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// const YOUR_SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
// const YOUR_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// const supabase = createClient(YOUR_SUPABASE_URL, YOUR_SERVICE_ROLE_KEY);

// // Map Unda/Quikk status to your app status
// const mapStatus = (status: string): string => {
//   const statusMap: { [key: string]: string } = {
//     'SUCCESS': 'paid',
//     'COMPLETED': 'paid',
//     'PENDING': 'pending',
//     'FAILED': 'failed',
//     'PROCESSING': 'pending',
//     'INITIATED': 'pending',
//     'EXPIRED': 'failed',
//     'CANCELLED': 'failed',
//     'REJECTED': 'failed'
//   };
//   return statusMap[status?.toUpperCase()] || 'pending';
// };

// serve(async (req) => {
//   try {
//     if (req.method === 'OPTIONS') {
//       return new Response(null, {
//         status: 204,
//         headers: {
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Methods': 'POST, OPTIONS',
//           'Access-Control-Allow-Headers': 'Content-Type',
//         },
//       });
//     }

//     const payload = await req.json();
//     console.log("📥 Webhook received:", JSON.stringify(payload, null, 2));

//     const {
//       id,           // Unda payment public_id / checkout_id
//       status,       // SUCCESS, FAILED, etc.
//       reference,    // Your bill ID
//       txn_id,
//       phone,
//       amount,
//       data,
//     } = payload;

//     const phoneNumber = phone || data?.phone || data?.customer_no || payload.idata?.customer_no;
//     const finalStatus = mapStatus(status);

//     console.log(`📞 Processing callback for phone: ${phoneNumber}, status: ${status} (Mapped: ${finalStatus})`);

//     // 1. Log the webhook event for debugging
//     await supabase.from('payment_webhooks').insert({
//       unda_payment_id: id,
//       bill_reference: reference,
//       status: status,
//       txn_id: txn_id,
//       phone: phoneNumber,
//       amount: amount,
//       raw_payload: payload,
//       received_at: new Date().toISOString()
//     });

//     if (reference && phoneNumber) {
//       // 2. UPDATE THE ACTUAL PARTICIPANTS TABLE
//       // This is what Option A (SQL Trigger) needs to work
//       const { error: participantUpdateError } = await supabase
//         .from('participants')
//         .update({ 
//           status: finalStatus,
//           unda_checkout_id: id // Link the ID if it wasn't linked yet
//         })
//         .eq('bill_id', reference)
//         .eq('phone_number', phoneNumber);

//       if (participantUpdateError) console.error("❌ Error updating participants table:", participantUpdateError);

//       // 3. TRIGGER SETTLEMENT IF PAID
//       if (finalStatus === 'paid') {
//         // Fetch the restaurant's paybill from the bills table
//         const { data: billData } = await supabase
//           .from('bills')
//           .select('paybill')
//           .eq('id', reference)
//           .single();

//         if (billData?.paybill) {
//           console.log(`🚀 Triggering B2B Settlement: ${amount} to Paybill ${billData.paybill}`);
          
//           // Call your settle-to-restaurant edge function
//           const settleResponse = await fetch(`${YOUR_SUPABASE_URL}/functions/v1/settle-to-restaurant`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${YOUR_SERVICE_ROLE_KEY}`
//             },
//             body: JSON.stringify({
//               amount: amount,
//               destination_shortcode: billData.paybill,
//               bill_id: reference
//             })
//           });

//           const settleResult = await settleResponse.json();
//           console.log("💰 Settlement API response:", settleResult);
//         }
//       }

//       // 4. Update the Legacy JSON blob (keeps your current UI working)
//       const { data: billRecord } = await supabase
//         .from('bills')
//         .select('participants_info')
//         .eq('id', reference)
//         .single();

//       if (billRecord) {
//         const participants = JSON.parse(billRecord.participants_info || '[]');
//         const updatedParticipants = participants.map((p: any) => {
//           if (p.phone === phoneNumber || p.phone_number === phoneNumber) {
//             return { ...p, status: finalStatus, updated_at: new Date().toISOString() };
//           }
//           return p;
//         });

//         await supabase
//           .from('bills')
//           .update({ participants_info: JSON.stringify(updatedParticipants) })
//           .eq('id', reference);
//       }
//     }

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
//     });

//   } catch (err) {
//     console.error("❌ Webhook error:", err);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// });


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("📥 Incoming Webhook:", payload);

    const { id, status, reference, phone, data } = payload;
    
    // 1. Normalize Phone (Unda sends 254..., your DB might have +254...)
    let rawPhone = phone || data?.phone || data?.customer_no;
    if (!rawPhone) return new Response("No phone", { status: 400 });
    
    // Convert 2547... to +2547... so it matches your DB
    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

    // 2. Map status to YOUR app's language
    const statusMap: any = {
      'SUCCESS': 'paid',
      'COMPLETED': 'paid',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
      'EXPIRED': 'failed'
    };
    const finalStatus = statusMap[status?.toUpperCase()] || 'pending';

    console.log(`Updating ${formattedPhone} to ${finalStatus} for Bill ${reference}`);

    // 3. Update the participants table
    // This is the "New Way" that triggers the payout
    const { error: partError } = await supabase
      .from('participants')
      .update({ status: finalStatus })
      .eq('bill_id', reference)
      .or(`phone_number.eq.${formattedPhone},phone_number.eq.${rawPhone}`);

    // 4. Update the old JSON blob (The "Old Way" that keeps your old UI happy)
    const { data: bill } = await supabase.from('bills').select('participants_info').eq('id', reference).single();
    if (bill) {
      const parts = JSON.parse(bill.participants_info || '[]');
      const updated = parts.map((p: any) => 
        (p.phone === formattedPhone || p.phone === rawPhone) ? { ...p, status: finalStatus } : p
      );
      await supabase.from('bills').update({ participants_info: JSON.stringify(updated) }).eq('id', reference);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});