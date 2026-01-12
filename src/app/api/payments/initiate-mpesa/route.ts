// src/app/api/payments/initiate-mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { phone, amount, accountNumber, packageName } = await request.json();

    console.log('\n=== M-Pesa Payment Initiation ===');
    console.log('Received request:', { phone, amount, accountNumber, packageName });

    // Validate input
    if (!phone || !amount || !accountNumber) {
      console.error('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      console.error('Invalid phone format:', phone);
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use format: 0712345678' },
        { status: 400 }
      );
    }


    const undaUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL;
    const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY;
    const undaEmail = process.env.UNDA_API_EMAIL;
    const undaPassword = process.env.UNDA_API_PASSWORD;


    console.log('Environment variables:', {
  undaUrl: undaUrl ? `✓ ${undaUrl.substring(0, 30)}...` : '✗ Missing',
  undaAnonKey: undaAnonKey ? `✓ ${undaAnonKey.substring(0, 20)}...` : '✗ Missing',
  undaEmail: undaEmail ? `✓ ${undaEmail}` : '✗ Missing',
  undaPassword: undaPassword ? '✓ Set' : '✗ Missing',
});

    const missingVars = [];
    if (!undaUrl) missingVars.push('NEXT_PUBLIC_UNDA_SUPABASE_URL');
    if (!undaAnonKey) missingVars.push('NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY');
    if (!undaEmail) missingVars.push('UNDA_API_EMAIL');
    if (!undaPassword) missingVars.push('UNDA_API_PASSWORD');

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          details: `Missing: ${missingVars.join(', ')}`

        },
        { status: 500 }
      );
    }

    console.log('Creating Unda Supabase client...');
    const unda = createClient(
  undaUrl as string,
  undaAnonKey as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);


    console.log('Authenticating with Unda...');
    const { data: authData, error: authError } = await unda.auth.signInWithPassword({
      email: undaEmail as string,
      password: undaPassword  as string,
    });

    if (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed',
          details: authError.message
        },
        { status: 401 }
      );
    }

    if (!authData?.session?.access_token) {
      console.error('No access token received');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed - no access token'
        },
        { status: 401 }
      );
    }

    console.log('✓ Authentication successful');
    const accessToken = authData.session.access_token;

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log('Formatted phone:', formattedPhone);

  
    const paymentPayload = {
      customer_no: formattedPhone,
      amount: Math.round(amount),
      reference: accountNumber
    };

    console.log('Payment payload:', paymentPayload);
    console.log('Calling Unda Edge Function: api-channels-mpesa-charge-req');

  
    const { data, error: functionError } = await unda.functions.invoke('api-channels-mpesa-charge-req?api_key=3f8fd65caca749218e4d2fe2f865b7ab', {
      body: paymentPayload,
    });

    console.log('\n=== Unda Response ===');
    console.log('Error:', functionError);
    console.log('Data:', data);

    if (functionError) {
      console.error('Edge Function error:', functionError);
      return NextResponse.json(
        { 
          success: false, 
          error: functionError.message || 'Payment initiation failed',
          details: functionError
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });


 
    // if (data?.error) {
    //   console.error('Unda returned error:', data.error);
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       error: data.error,
    //       details: data
    //     },
    //     { status: 500 }
    //   );
    // }

    // if (!checkoutRequestId) {
    //   console.error('No checkout request ID in response');
    //   console.error('Full response:', JSON.stringify(data, null, 2));
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       error: 'Invalid response from payment service',
    //       details: data
    //     },
    //     { status: 500 }
    //   );
    // }

    // console.log('✓ STK push sent successfully');
    // console.log('Checkout Request ID:', checkoutRequestId);
    // console.log('=== End M-Pesa Request ===\n');

    // return NextResponse.json({
    //   success: true,
    //   checkoutRequestId: checkoutRequestId,
    //   message: 'STK push sent successfully. Please check your phone.',
    // });

  } catch (error: any) {
    console.error('\n=== M-Pesa Fatal Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// Test endpoint - visit /api/payments/initiate-mpesa to test
// export async function GET() {
//   const undaUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL;
//   const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY;
//   const undaEmail = process.env.UNDA_API_EMAIL;
//   const undaPassword = process.env.UNDA_API_PASSWORD;

//   return NextResponse.json({ 
//     message: 'M-Pesa payment initiation endpoint',
//     status: 'ready',
//     timestamp: new Date().toISOString(),
//     config: {
//       undaUrl: undaUrl ? '✓ Set' : '✗ Missing',
//       undaAnonKey: undaAnonKey ? '✓ Set' : '✗ Missing',
//       undaEmail: undaEmail ? '✓ Set' : '✗ Missing',
//       undaPassword: undaPassword ? '✓ Set' : '✗ Missing',
//     }
//   });
// }