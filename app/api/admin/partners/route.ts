import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerInput, partnerId } = body;

    let finalId = partnerId;

    if (finalId) {
      const { error } = await supabaseAdmin.from("partners").update(partnerInput).eq("id", finalId);
      if (error) throw error;
    } else {
      const { data: newItem, error } = await supabaseAdmin.from("partners").insert(partnerInput).select().single();
      if (error) throw error;
      finalId = newItem.id;
    }

    return NextResponse.json({ success: true, partnerId: finalId });
  } catch (error: any) {
    console.error("Error creating/updating partner via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
