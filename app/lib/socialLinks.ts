/** Optional overrides via NEXT_PUBLIC_SOCIAL_* in .env.local */

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "whatsapp"
  | "twitter";

export type ResolvedSocialLink = {
  network: SocialNetwork;
  href: string;
  /** Concise name for aria-label (e.g. "Facebook") */
  name: string;
};

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/**
 * Ordered social links for footer / blog / contact. Omits networks with no URL.
 * WhatsApp defaults to the site contact line (+233 57 609 3838) when unset.
 */
export function resolveSocialLinks(): ResolvedSocialLink[] {
  const out: ResolvedSocialLink[] = [];

  const fb = env("NEXT_PUBLIC_SOCIAL_FACEBOOK");
  if (fb) out.push({ network: "facebook", href: fb, name: "Facebook" });

  const ig = env("NEXT_PUBLIC_SOCIAL_INSTAGRAM");
  if (ig) out.push({ network: "instagram", href: ig, name: "Instagram" });

  const yt = env("NEXT_PUBLIC_SOCIAL_YOUTUBE");
  if (yt) out.push({ network: "youtube", href: yt, name: "YouTube" });

  const li = env("NEXT_PUBLIC_SOCIAL_LINKEDIN");
  if (li) out.push({ network: "linkedin", href: li, name: "LinkedIn" });

  const wa =
    env("NEXT_PUBLIC_SOCIAL_WHATSAPP") || "https://wa.me/233576093838";
  out.push({ network: "whatsapp", href: wa, name: "WhatsApp" });

  const x = env("NEXT_PUBLIC_SOCIAL_X");
  if (x) out.push({ network: "twitter", href: x, name: "X" });

  return out;
}
