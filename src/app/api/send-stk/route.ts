// //app/api/send-stk/route.ts

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   console.log("📡 SEND STK API CALLED (via UUID)");
  
//   try {
//     const body = await request.json();
//     // 'id' is no longer needed as we use the env variable
//     const { phone, amount, reference, jwtToken } = body; 

//     // Validation
//     if (!phone || !amount || !reference || !jwtToken) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Environment variables
//     const undaUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL;
//     const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY;
//     const platformUid = process.env.UNDA_PLATFORM_UID; // Get the correct UUID
//     const apiKey = '3f8fd65caca749218e4d2fe2f865b7ab'; // Keep the API Key

//     if (!undaUrl || !undaAnonKey || !platformUid) { // Check for platformUid as well
//       return NextResponse.json(
//         { success: false, error: "Missing configuration (URL, Key, or Platform UID)" },
//         { status: 500 }
//       );
//     }

//     const validAmount = Math.floor(Math.abs(amount));

//     // Call Unda Edge Function
//     const apiUrl = `${undaUrl}/functions/v1/api-channels-mpesa-charge-req?api_key=${apiKey}`;
    
//     console.log("🌍 Calling Unda Edge Function:", apiUrl);
//     console.log("📤 Payload:", { phone, amount: validAmount, reference });

//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${jwtToken}`,
//         "apikey": undaAnonKey,
//         // Send the correct UUID from the environment variable
//         "x-platform-uid": platformUid, 
//       },
//       body: JSON.stringify({
//         customer_no: phone,
//         amount: validAmount,
//         reference: reference,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ Unda API Error:", errorText);
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: "Failed to initiate payment", 
//           details: errorText 
//         },
//         { status: 500 }
//       );
//     }

//     const undaResponse = await response.json();
//     console.log("✅ Unda Response:", undaResponse);

//     return NextResponse.json({
//       success: true,
//       data: undaResponse.data || undaResponse,
//       message: undaResponse.message,
//     });

//   } catch (error: any) {
//     console.error("🔥 STK PUSH ERROR:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal Server Error",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }



//app/api/send-stk/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("📡 SEND STK API CALLED (via UUID)");
  
  try {
    const body = await request.json();
    // 'id' is no longer needed as we use the env variable
    const { phone, amount, reference, jwtToken } = body; 

    // Validation
    if (!phone || !amount || !reference || !jwtToken) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Environment variables
    const undaUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL;
    const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY;
    const platformUid = process.env.UNDA_PLATFORM_UID; // Get the correct UUID
    const apiKey = '3f8fd65caca749218e4d2fe2f865b7ab'; // Keep the API Key

    if (!undaUrl || !undaAnonKey || !platformUid) { // Check for platformUid as well
      return NextResponse.json(
        { success: false, error: "Missing configuration (URL, Key, or Platform UID)" },
        { status: 500 }
      );
    }

    const validAmount = Math.floor(Math.abs(amount));

    // Call Unda Edge Function
    const apiUrl = `${undaUrl}/functions/v1/api-channels-mpesa-charge-req?api_key=${apiKey}`;
    
    console.log("🌍 Calling Unda Edge Function:", apiUrl);
    console.log("📤 Payload:", { phone, amount: validAmount, reference });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
        "apikey": undaAnonKey,
        // Send the correct UUID from the environment variable
        "x-platform-uid": platformUid, 
      },
      body: JSON.stringify({
        customer_no: phone,
        amount: validAmount,
        reference: reference.substring(0, 12),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Unda API Error:", errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to initiate payment", 
          details: errorText 
        },
        { status: 500 }
      );
    }

    const undaResponse = await response.json();
    console.log("✅ Unda Response:", undaResponse);

    return NextResponse.json({
      success: true,
      data: undaResponse.data || undaResponse,
      message: undaResponse.message,
    });

  } catch (error: any) {
    console.error("🔥 STK PUSH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


