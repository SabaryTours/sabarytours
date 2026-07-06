import { NextResponse } from "next/server";
import { PASSWORD_RECOVERY_COOKIE } from "../../../lib/passwordRecovery";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
