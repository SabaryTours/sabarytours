import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyResetToken } from "../../../lib/resetToken";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, password } = body as { token?: string; password?: string };

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Missing reset token." },
        { status: 400 },
      );
    }

    // ── 1. Verify token signature + expiry ───────────────────────────
    const payload = verifyResetToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Your reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // ── 2. Fetch user to confirm single-use ──────────────────────────
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(payload.sub);

    if (userError || !userData?.user) {
      return NextResponse.json(
        {
          valid: false,
          message: "User not found. Please request a new reset link.",
        },
        { status: 400 },
      );
    }

    // If user was modified since the token was issued the token is stale
    // (password was already reset, or profile changed).
    if ((userData.user.updated_at || "") !== payload.uat) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "This reset link has already been used. Please request a new one if needed.",
        },
        { status: 400 },
      );
    }

    // ── 3. Verify-only mode (no password supplied) ───────────────────
    if (!password) {
      return NextResponse.json({ valid: true });
    }

    // ── 4. Validate + set new password via Admin API ─────────────────
    if (password.length < 6) {
      return NextResponse.json(
        { valid: false, message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(payload.sub, { password });

    if (updateError) {
      console.error(
        "[reset-password] updateUserById failed:",
        updateError.message,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to reset password. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}
