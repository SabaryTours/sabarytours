interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showReviewCount?: boolean;
}

export default function StarRating({ 
  rating, 
  reviewCount, 
  size = "md",
  showReviewCount = true 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={sizeClasses[size]}
            fill="#FFB800"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg
            className={sizeClasses[size]}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`half-${rating}`}>
                <stop offset="50%" stopColor="#FFB800" />
                <stop offset="50%" stopColor="#E0E0E0" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" fill={`url(#half-${rating})`} />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={sizeClasses[size]}
            fill="#E0E0E0"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      {showReviewCount && reviewCount !== undefined && (
        <span className="text-[#666] text-[12px] sm:text-[14px] font-sans">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

