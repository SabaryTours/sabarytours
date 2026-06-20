import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../utils/supabase/server";
import {
  isAdminRole,
  normalizePermissions,
  type AdminPermission,
} from "./adminPermissions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export type AdminSession = {
  userId: string;
  role: string;
  permissions: AdminPermission[];
};

export async function getAdminSession(userId: string): Promise<AdminSession | null> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, admin_permissions")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !isAdminRole(profile.role)) return null;

  return {
    userId,
    role: profile.role,
    permissions: normalizePermissions(profile.role, profile.admin_permissions),
  };
}

export async function requireAdminUser(): Promise<
  { ok: true; session: AdminSession } | { ok: false; status: 401 | 403 }
> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, status: 401 };

  const session = await getAdminSession(user.id);
  if (!session) return { ok: false, status: 403 };

  return { ok: true, session };
}

export async function requireAdminPermission(
  permission: AdminPermission,
): Promise<
  { ok: true; session: AdminSession } | { ok: false; status: 401 | 403 }
> {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth;

  if (!auth.session.permissions.includes(permission)) {
    return { ok: false, status: 403 };
  }

  return auth;
}

export function adminAuthErrorResponse(auth: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { success: false, error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
    { status: auth.status },
  );
}

export { supabaseAdmin };
