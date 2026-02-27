import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Use service role to bypass RLS securely on the server
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { code, discount_percentage, expiry_date } = await request.json();

    if (!code || !discount_percentage) {
      return NextResponse.json({ error: "Code and percentage are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('vouchers')
      .insert({
        code: code.toUpperCase(),
        discount_percentage: parseInt(discount_percentage),
        expiry_date: expiry_date || null,
        active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: "Voucher code already exists" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
