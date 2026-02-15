interface TrustBadgeProps {
  badges: string[];
}

const badgeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  popular: {
    label: "Popular",
    color: "#0060CC",
    bgColor: "#E6F2FF",
  },
  "best-seller": {
    label: "Best Seller",
    color: "#FF5E00",
    bgColor: "#FFF5E6",
  },
  verified: {
    label: "Verified",
    color: "#00A86B",
    bgColor: "#E6F9F0",
  },
};

export default function TrustBadge({ badges }: TrustBadgeProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const config = badgeConfig[badge] || { label: badge, color: "#666", bgColor: "#F5F5F5" };
        return (
          <span
            key={badge}
            className="px-2 py-1 rounded text-[10px] sm:text-[12px] font-bold font-sans"
            style={{
              color: config.color,
              backgroundColor: config.bgColor,
            }}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}

