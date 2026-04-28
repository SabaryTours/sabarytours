import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Initialize Supabase client with the Service Role key to bypass RLS securely on the server
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // Admin auth guard
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { tourInput, imagesInput, tourId, priceInput } = body;

    let finalTourId = tourId;

    // 1. Upsert Tour
    if (finalTourId) {
      const { error: tourError } = await supabaseAdmin.from("tours").update(tourInput).eq("id", finalTourId);
      if (tourError) throw tourError;
    } else {
      const { data: newTour, error: tourError } = await supabaseAdmin.from("tours").insert(tourInput).select().single();
      if (tourError) throw tourError;
      finalTourId = newTour.id;
    }

    // 2. Upsert Tour Prices (supports multiple tiers)
    if (priceInput) {
      await supabaseAdmin.from("tour_prices").delete().eq("tour_id", finalTourId);

      const tiers = Array.isArray(priceInput)
        ? priceInput
        : priceInput.amount !== undefined
        ? [{ amount: priceInput.amount, currency: priceInput.currency || "GHS", name: "Base Price" }]
        : [];

      const normalizedTiers = tiers
        .map((tier: any) => ({
          tour_id: finalTourId,
          amount: Number(tier.amount),
          currency: tier.currency || "GHS",
          name: (tier.name || "Base Price").toString().trim(),
        }))
        .filter((tier: any) => Number.isFinite(tier.amount) && tier.amount >= 0);

      if (normalizedTiers.length > 0) {
        const { error: priceError } = await supabaseAdmin.from("tour_prices").insert(normalizedTiers);
        if (priceError) throw priceError;
      }
    }


    // 4. Upsert Images
    if (imagesInput && Array.isArray(imagesInput)) {
      await supabaseAdmin.from("tour_images").delete().eq("tour_id", finalTourId);
      if (imagesInput.length > 0) {
        const imageInserts = imagesInput.map((url: string, index: number) => ({
          tour_id: finalTourId,
          image_url: url.trim(),
          display_order: index,
        }));
        await supabaseAdmin.from("tour_images").insert(imageInserts);
      }
    }

    return NextResponse.json({ success: true, tourId: finalTourId });
  } catch (error: any) {
    console.error("Error creating/updating tour via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Admin auth guard
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing tour ID" }, { status: 400 });
    }

    // Cascade delete: images, prices, then tour
    await supabaseAdmin.from("tour_images").delete().eq("tour_id", id);
    await supabaseAdmin.from("tour_prices").delete().eq("tour_id", id);

    const { error } = await supabaseAdmin.from("tours").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting tour via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
