import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageInput, packageId } = body;

    let finalPackageId = packageId;

    if (finalPackageId) {
      const { error } = await supabaseAdmin.from("packages").update(packageInput).eq("id", finalPackageId);
      if (error) throw error;
    } else {
      const { data: newPackage, error } = await supabaseAdmin.from("packages").insert(packageInput).select().single();
      if (error) throw error;
      finalPackageId = newPackage.id;
    }

    return NextResponse.json({ success: true, packageId: finalPackageId });
  } catch (error: any) {
    console.error("Error creating/updating package via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
