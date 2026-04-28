// Package Categories (Main Packages Page)
export interface PackageCategory {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
}

// Individual Tours (within a category)
export interface Tour {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  image: string;
  description: string;
  price: string;
  priceValue?: number; // For filtering
  price_tiers?: any[];
  duration?: string;
  rating?: number; // 1-5 stars
  reviewCount?: number;
  bookedCount?: number; // "Booked X times"
  trustBadges?: string[]; // e.g., ["popular", "best-seller", "verified"]
  freeCancellation?: boolean;
  activities?: string[];
  whatsIncluded?: string[];
  exclusions?: string[];
  whatToBring?: string[];
  groupSizeOptions?: string[];
  ageCategories?: string[];
  languages?: string[];
  whyBook?: string[];
  gallery?: string[];
  location?: string;
  map_url?: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  itinerary?: Array<{
    time: string;
    activity: string;
    description?: string;
  }>;
  availableDays?: string[];
  blockedDates?: string[];
  timeSlots?: string[];
}

// Package (legacy - for backward compatibility)
export interface Package {
  id: string;
  title: string;
  slug: string;
  image: string;
  category?: string;
}

// NOTE: All data is now fetched from Supabase via app/lib/api.ts
// These empty arrays are kept for backward compatibility with legacy imports
export const packageCategories: PackageCategory[] = [];
export const tours: Tour[] = [];
export const packages: Package[] = [];
