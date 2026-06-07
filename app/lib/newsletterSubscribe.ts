import type { SupabaseClient } from "@supabase/supabase-js";

export type NewsletterSubscribeInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  source: string;
};

export async function upsertNewsletterSubscriber(
  supabase: SupabaseClient,
  input: NewsletterSubscribeInput,
): Promise<{ ok: true; table: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "A valid email address is required." };
  }

  const richRow = {
    email,
    first_name: input.firstName?.trim() || null,
    last_name: input.lastName?.trim() || null,
    source: input.source,
    status: "subscribed",
    updated_at: new Date().toISOString(),
  };

  const { error: richError } = await supabase
    .from("newsletter_subscribers")
    .upsert(richRow, { onConflict: "email" });

  if (!richError) {
    const verified = await verifySubscriber(supabase, "newsletter_subscribers", email);
    if (verified) return { ok: true, table: "newsletter_subscribers" };
    console.error("[newsletter] upsert reported success but row not found:", email);
    return {
      ok: false,
      error: "We could not save your subscription. Please try again later.",
    };
  }

  const useLegacyTable =
    richError.code === "42P01" ||
    richError.message.includes("newsletter_subscribers") ||
    richError.message.includes("does not exist") ||
    richError.message.includes("column");

  if (useLegacyTable) {
    const { error: legacyError } = await supabase.from("subscribers").upsert(
      { email, created_at: new Date().toISOString() },
      { onConflict: "email", ignoreDuplicates: false },
    );
    if (!legacyError) {
      const verified = await verifySubscriber(supabase, "subscribers", email);
      if (verified) return { ok: true, table: "subscribers" };
    }
    console.error("[newsletter] subscribers upsert failed:", legacyError?.message);
  } else {
    console.error("[newsletter] upsert failed:", richError.message, richError.details);
  }

  return {
    ok: false,
    error: "We could not save your subscription. Please try again later.",
  };
}

async function verifySubscriber(
  supabase: SupabaseClient,
  table: "newsletter_subscribers" | "subscribers",
  email: string,
): Promise<boolean> {
  const { data, error } = await supabase.from(table).select("email").eq("email", email).maybeSingle();
  if (error) {
    console.error(`[newsletter] verify ${table}:`, error.message);
    return false;
  }
  return Boolean(data?.email);
}
