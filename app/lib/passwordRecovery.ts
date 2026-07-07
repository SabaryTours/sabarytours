export const PASSWORD_RECOVERY_COOKIE = "password_recovery_pending";

export const PASSWORD_RESET_PATH = "/reset-password?recovery=1";

export function passwordResetRedirectUrl(origin: string): string {
  return `${origin}/auth/callback`;
}

export const RECOVERY_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60,
  path: "/",
};
