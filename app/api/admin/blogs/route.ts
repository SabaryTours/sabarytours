import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { BLOG_CATEGORIES } from "../../../lib/blogCategories";
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

    const body = await request.json();
    const { postInput, blogId } = body;

    if (postInput?.is_featured) {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 7);
      postInput.featured_until = featuredUntil.toISOString();

      await supabaseAdmin
        .from("posts")
        .update({ is_featured: false, featured_until: null })
        .eq("is_featured", true)
        .neq("id", blogId || "00000000-0000-0000-0000-000000000000");
    } else if (postInput && "is_featured" in postInput && !postInput.is_featured) {
      postInput.featured_until = null;
    }

    if (
      typeof postInput?.category === "string" &&
      postInput.category &&
      !BLOG_CATEGORIES.some((item) => item.slug === postInput.category)
    ) {
      return NextResponse.json({ success: false, error: "Invalid blog category." }, { status: 400 });
    }

    if (blogId) {
      const { error } = await supabaseAdmin.from("posts").update(postInput).eq("id", blogId);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("posts").insert(postInput);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating/updating blog via Admin API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
