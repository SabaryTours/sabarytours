import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

    if (!['admin', 'owner'].includes(profile?.role || '')) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { tourId, is_featured } = await request.json();

    if (!tourId) {
      return NextResponse.json({ success: false, error: "Missing tour ID" }, { status: 400 });
    }

    const MAX_FEATURED = 4;
    
    if (is_featured) {
      const { count, error: countError } = await supabaseAdmin
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("is_featured", true)
        .eq("status", "published")
        .neq("id", tourId);

      if (countError) throw countError;
      if ((count ?? 0) >= MAX_FEATURED) {
        return NextResponse.json(
          {
            success: false,
            error: `You can feature at most ${MAX_FEATURED} tours. Unfeature another tour first.`,
          },
          { status: 400 },
        );
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("tours")
      .update({ is_featured })
      .eq("id", tourId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating featured status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
