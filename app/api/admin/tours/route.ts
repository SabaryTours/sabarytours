import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Initialize Supabase client with the Service Role key to bypass RLS securely on the server
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tourInput, imagesInput, tourId } = body;

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
