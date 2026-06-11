import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "../utils/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function requireAdminUser(): Promise<
  { ok: true; userId: string } | { ok: false; status: 401 | 403 }
> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { ok: false, status: 403 };

  return { ok: true, userId: user.id };
}

export { supabaseAdmin };
