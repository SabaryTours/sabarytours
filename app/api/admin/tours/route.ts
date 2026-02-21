import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Initialize Supabase client with the Service Role key to bypass RLS securely on the server
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tourInput, pricesInput, itinerariesInput, imagesInput, tourId } = body;

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

    // 2. Upsert Prices (Clear and add new)
    if (pricesInput && Array.isArray(pricesInput)) {
      await supabaseAdmin.from("tour_prices").delete().eq("tour_id", finalTourId);
      if (pricesInput.length > 0) {
        const priceInserts = pricesInput.map((p: any) => ({
          tour_id: finalTourId,
          name: p.name,
          amount: parseFloat(p.amount),
          currency: tourInput.currency || "GHS",
          description: p.description || null
        }));
        await supabaseAdmin.from("tour_prices").insert(priceInserts);
      }
    }

    // 3. Upsert Itineraries (Clear and add new)
    if (itinerariesInput && Array.isArray(itinerariesInput)) {
      await supabaseAdmin.from("tour_itineraries").delete().eq("tour_id", finalTourId);
      if (itinerariesInput.length > 0) {
        const itineraryInserts = itinerariesInput.map((i: any, index: number) => ({
          tour_id: finalTourId,
          title: i.title,
          description: i.description,
          day_number: i.day_number || index + 1
        }));
        await supabaseAdmin.from("tour_itineraries").insert(itineraryInserts);
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
