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

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

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
      return NextResponse.json({ success: false, error: "Missing package ID" }, { status: 400 });
    }

    // 1. Get the package to find its slug (used as category in tours)
    const { data: pkg } = await supabaseAdmin
      .from("packages")
      .select("id, slug")
      .eq("id", id)
      .single();

    if (!pkg) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    // 2. Find all tours that belong to this package category
    const { data: tours } = await supabaseAdmin
      .from("tours")
      .select("id")
      .eq("category", pkg.slug);

    if (tours && tours.length > 0) {
      const tourIds = tours.map((t: any) => t.id);

      // 3. Delete related tour_images and tour_prices for these tours
      await supabaseAdmin.from("tour_images").delete().in("tour_id", tourIds);
      await supabaseAdmin.from("tour_prices").delete().in("tour_id", tourIds);

      // 4. Delete the tours themselves
      await supabaseAdmin.from("tours").delete().in("id", tourIds);
    }

    // 5. Finally delete the package
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting package via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
