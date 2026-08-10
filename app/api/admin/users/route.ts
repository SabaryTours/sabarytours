import { NextResponse } from "next/server";
import { isCustomerRole } from "../../../lib/adminPermissions";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function GET() {
  try {
    const auth = await requireAdminPermission("users");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*");
    if (profilesError) throw profilesError;

    const mergedUsers = users
      .map((user) => {
        const profile = profiles?.find((row) => row.id === user.id);
        return {
          id: user.id,
          email: user.email,
          phone: user.phone || profile?.phone_number || "No phone",
          full_name:
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            "No name",
          role: profile?.role || "subscriber",
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        };
      })
      .filter((user) => isCustomerRole(user.role));

    mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, users: mergedUsers });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
