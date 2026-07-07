import crypto from "crypto";

const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

interface TokenPayload {
  /** Supabase user ID */
  sub: string;
  /** User email */
  email: string;
  /** User updated_at timestamp — used for single-use verification */
  uat: string;
  /** Expiry (unix seconds) */
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return secret;
}

/**
 * Create a signed password-reset token containing the user ID, email,
 * and a snapshot of the user's `updated_at` timestamp (for single-use).
 *
 * Format: base64url(payload) + "." + HMAC-SHA256(secret, payloadB64)
 */
export function createResetToken(
  userId: string,
  email: string,
  userUpdatedAt: string,
): string {
  const payload: TokenPayload = {
    sub: userId,
    email,
    uat: userUpdatedAt,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verify a password-reset token and return the decoded payload.
 * Returns `null` if the token is malformed, tampered with, or expired.
 */
export function verifyResetToken(token: string): TokenPayload | null {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString(),
    );

    // Check expiry
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;

    // Basic shape check
    if (!payload.sub || !payload.email) return null;

    return payload;
  } catch {
    return null;
  }
}
