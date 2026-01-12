// //app/api/settle-to-resstaurant/route.ts

// export async function POST(req: Request) {
//   try {
//     const { amount, destination_shortcode, bill_id } = await req.json();

//     // We send the FULL amount now. 
//     // Safaricom will deduct their fee from your "Float" balance instead.
//     const netAmount = Math.floor(amount); 

//     if (netAmount < 1) {
//       return NextResponse.json({ success: false, error: "Amount invalid" }, { status: 400 });
//     }

//     const response = await fetch(`${process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL}/functions/v1/api-channels-mpesa-charge-req`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UNDA_JWT}`,
//         'apikey': process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY!,
//         'x-platform-uid': process.env.UNDA_PLATFORM_UID!,
//       },
//       body: JSON.stringify({
//         command_id: "BusinessPayBill", 
//         amount: netAmount,           // The exact amount the customer paid
//         sender_shortcode: "174379",    
//         destination_shortcode: destination_shortcode, 
//         account_reference: bill_id.substring(0, 12),
//         remarks: `Full Settlement`
//       }),
//     });

//     const result = await response.json();
    
//     if (!response.ok) {
//        return NextResponse.json({ success: false, error: result.message || "B2B Failed" }, { status: 400 });
//     }

//     return NextResponse.json({ success: true, data: result });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, destination_shortcode, bill_id, restaurant_name } = await req.json();

    const netAmount = Math.floor(amount); 

    if (netAmount < 1) {
      return NextResponse.json({ success: false, error: "Amount invalid" }, { status: 400 });
    }

    // 🔥 CORRECTION: Use the payout function, NOT the charge-req function
    const apiUrl = `${process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL}/functions/v1/api-channels-mpesa-payout`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UNDA_JWT}`,
        'apikey': process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY!,
        'x-platform-uid': process.env.UNDA_PLATFORM_UID!,
      },
      body: JSON.stringify({
        amount: netAmount,
        customer_no: destination_shortcode, // The Restaurant's Paybill
        customer_type: "business_paybill",  // This makes it B2B (Triggers SMS)
        reference: restaurant_name.substring(0, 12),
        remarks: `Settlement for ${bill_id}`
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
       console.error("B2B Payout Failed:", result);
       return NextResponse.json({ success: false, error: result.message || "B2B Failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}