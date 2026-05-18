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
  name: string;
};

const DEFAULT_LINKS: Record<SocialNetwork, string> = {
  twitter: "https://twitter.com/SabaryTours",
  facebook: "https://www.facebook.com/Sabaryco",
  instagram:
    "https://instagram.com/sabarytours?igshid=iuznzf668v60",
  youtube: "https://www.youtube.com/channel/UC3LkE6ieyyA5E7CSF-iAFgw",
  linkedin: "https://www.linkedin.com/company/sabarytours/",
  whatsapp: "https://wa.me/message/HCCRQBKBLXEVI1",
};

const ENV_KEYS: Record<SocialNetwork, string> = {
  twitter: "NEXT_PUBLIC_SOCIAL_X",
  facebook: "NEXT_PUBLIC_SOCIAL_FACEBOOK",
  instagram: "NEXT_PUBLIC_SOCIAL_INSTAGRAM",
  youtube: "NEXT_PUBLIC_SOCIAL_YOUTUBE",
  linkedin: "NEXT_PUBLIC_SOCIAL_LINKEDIN",
  whatsapp: "NEXT_PUBLIC_SOCIAL_WHATSAPP",
};

const DISPLAY_ORDER: SocialNetwork[] = [
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "whatsapp",
  "twitter",
];

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function resolveUrl(network: SocialNetwork): string {
  const fromEnv = env(ENV_KEYS[network]);
  return fromEnv || DEFAULT_LINKS[network];
}

/**
 * Ordered social links for footer / blog / contact.
 */
export function resolveSocialLinks(): ResolvedSocialLink[] {
  const names: Record<SocialNetwork, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    twitter: "X (Twitter)",
  };

  return DISPLAY_ORDER.map((network) => ({
    network,
    href: resolveUrl(network),
    name: names[network],
  }));
}
