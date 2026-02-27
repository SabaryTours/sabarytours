import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        tour_date,
        booking_status,
        number_of_people,
        total_cost,
        amount_paid,
        payment_status,
        payment_option,
        package_name,
        tour_id
      `
      )
      .eq("user_id", user.id)
      .order("tour_date", { ascending: false });

    if (error) {
      console.error("Dashboard bookings API error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json(bookings ?? [], { status: 200 });
  } catch (err: any) {
    console.error("Dashboard bookings API:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
