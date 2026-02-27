import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Voucher code is required" }, { status: 400 });
    }

    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .select('id, code, discount_percentage, expiry_date, active')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !voucher) {
      return NextResponse.json({ error: "Invalid voucher code" }, { status: 404 });
    }

    if (!voucher.active) {
      return NextResponse.json({ error: "This voucher is no longer active" }, { status: 400 });
    }

    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return NextResponse.json({ error: "This voucher has expired" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discount_percentage: voucher.discount_percentage,
      voucher_id: voucher.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Error validating voucher" }, { status: 500 });
  }
}
