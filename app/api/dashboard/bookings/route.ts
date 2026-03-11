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

    const email = user.email;

    // Fetch bookings where this auth user is linked by user_id
    const { data: bookingsByUser, error: byUserError } = await supabaseAdmin
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
        tour_id,
        customer_email,
        user_id
      `
      )
      .eq("user_id", user.id);

    if (byUserError) {
      console.error("Dashboard bookings API error (by user):", byUserError);
      return NextResponse.json(
        { error: byUserError.message || "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    let combined = bookingsByUser || [];

    // Also include legacy bookings that match the user's email but have no user_id
    if (email) {
      const { data: bookingsByEmail, error: byEmailError } = await supabaseAdmin
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
          tour_id,
          customer_email,
          user_id
        `
        )
        .eq("customer_email", email)
        .is("user_id", null);

      if (byEmailError) {
        console.error("Dashboard bookings API error (by email):", byEmailError);
      } else if (bookingsByEmail && bookingsByEmail.length > 0) {
        const existingIds = new Set(combined.map((b: any) => b.id));
        combined = combined.concat(
          bookingsByEmail.filter((b: any) => !existingIds.has(b.id))
        );
      }
    }

    // Sort by tour_date descending (nulls last)
    combined.sort((a: any, b: any) => {
      if (!a.tour_date && !b.tour_date) return 0;
      if (!a.tour_date) return 1;
      if (!b.tour_date) return -1;
      return a.tour_date < b.tour_date ? 1 : -1;
    });

    return NextResponse.json(combined ?? [], { status: 200 });
  } catch (err: any) {
    console.error("Dashboard bookings API:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
