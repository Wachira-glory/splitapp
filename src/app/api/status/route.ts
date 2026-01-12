

// app/api/status/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    // 1. Better validation: if no ID or id is "undefined" string
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const intId = parseInt(id, 10);
    if (isNaN(intId)) {
      return NextResponse.json({ success: false, error: "ID must be an integer" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY!;
    const platformUid = process.env.UNDA_PLATFORM_UID;

    if (!platformUid) {
      return NextResponse.json({ success: false, error: "Missing Platform UID" }, { status: 500 });
    }

    const apiUrl = `${baseUrl}/functions/v1/api-public-payments?id=${intId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: anonKey,
        "x-platform-uid": platformUid, 
      },
    });

    const data = await response.json();

    // If Unda returns empty array, the ID doesn't exist yet
    if (!data || data.length === 0) {
        return NextResponse.json({ success: true, data: [{ status: 'PENDING' }] });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}