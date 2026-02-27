import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// We must use the service role key to access the Auth admin API
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // 1. Fetch all users from Auth (contains emails)
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // 2. Fetch profiles (contains roles, phone numbers, avatars)
    const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*");

    if (profilesError) {
      throw profilesError;
    }

    // 3. Merge them
    const mergedUsers = users.map(u => {
      const profile = profiles?.find(p => p.id === u.id);
      return {
        id: u.id,
        email: u.email,
        phone: u.phone || profile?.phone_number || "No phone",
        full_name:
          profile?.full_name ||
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email ||
          "No name",
        role: profile?.role || "user",
        created_at: u.created_at,
        avatar_url: profile?.avatar_url || u.user_metadata?.avatar_url
      };
    });

    // Sort by newest
    mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, users: mergedUsers });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
