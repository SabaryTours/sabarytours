import { NextResponse } from "next/server";
import {
  PASSWORD_RECOVERY_COOKIE,
  RECOVERY_COOKIE_OPTIONS,
} from "../../../lib/passwordRecovery";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", RECOVERY_COOKIE_OPTIONS);
  return response;
}
