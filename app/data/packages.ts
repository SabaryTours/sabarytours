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
}

// Package (legacy - for backward compatibility)
export interface Package {
  id: string;
  title: string;
  slug: string;
  image: string;
  category?: string;
}

// Categories
export const packageCategories: PackageCategory[] = [
  {
    id: "1",
    title: "Historical/City Tours",
    slug: "historical-city-tours",
    image: "/assets/package-img1.png",
    description: "These set of packages involves touring historic landmarks in selected cities in Ghana. Pick where you plan to visit and experience authentic traditions like naming ceremonies and local crafts.",
  },
  {
    id: "2",
    title: "Accommodation Packages",
    slug: "accommodation-packages",
    image: "/assets/package-img2.png",
    description: "Comfortable and authentic accommodation options across Ghana.",
  },
  {
    id: "3",
    title: "Dining & Other Packages",
    slug: "dining-other-packages",
    image: "/assets/package-img3.png",
    description: "Experience authentic Ghanaian cuisine and more.",
  },
  {
    id: "4",
    title: "Dining & Other Packages",
    slug: "dining-other-packages",
    image: "/assets/package-img3.png",
    description: "Experience authentic Ghanaian cuisine and more.",
  },
  {
    id: "5",
    title: "Dining & Other Packages",
    slug: "dining-other-packages",
    image: "/assets/package-img3.png",
    description: "Experience authentic Ghanaian cuisine and more.",
  },

];

// Tours within categories
export const tours: Tour[] = [
  // Historical/City Tours
  {
    id: "1",
    title: "Accra Explorer",
    slug: "accra-explorer",
    categorySlug: "historical-city-tours",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop",
    description: "Accra Explorer Tour offers a day immersed in Ghana's history, culture, and heritage, providing travelers with an authentic connection to the country's past and present",
    price: "$100 +",
    priceValue: 100,
    duration: "Full Day",
    rating: 4.8,
    reviewCount: 127,
    bookedCount: 523,
    trustBadges: ["popular", "best-seller", "verified"],
    freeCancellation: true,
    activities: [
      "W.E.B. Du Bois Centre : a library to commemorate the late W.E.B DuBois",
      "Osu Castle : A colonial-era fortress central to the slave trade and governance.",
      "Kwame Nkrumah Memorial Park : A park dedicated to Ghana's first president and independence leader.",
      "Black StarGate and Independence Square : Ghana's iconic symbol of independence from colonial rule.",
      "Arts Center : A vibrant market near Kwame Nkrumah Memorial Park, where local artisans offer handcrafted goods such as kente cloth, carvings, beads, and drums—perfect for authentic cultural shopping and souvenirs.",
    ],
    whatsIncluded: [
      "Professional guided tour by a historian",
      "Air-conditioned transportation",
      "All entrance fees to listed attractions",
      "Complimentary bottled water",
    ],
    whyBook: [
      "Authentic Cultural Experience - Connect with Ghana's history through live storytelling",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    ],
    location: "Accra, Ghana",
    mapCoordinates: {
      lat: 5.6037,
      lng: -0.1870,
    },
    faq: [
      {
        question: "What should I bring on the tour?",
        answer: "We recommend bringing comfortable walking shoes, sunscreen, a hat, and a camera to capture your experience.",
      },
      {
        question: "Is transportation included?",
        answer: "Yes, air-conditioned transportation is included in the tour price.",
      },
    ],
    itinerary: [
      {
        time: "8:00 AM",
        activity: "Hotel Pickup",
        description: "We'll pick you up from your hotel in Accra",
      },
      {
        time: "9:00 AM",
        activity: "W.E.B. Du Bois Centre",
        description: "Visit the library commemorating the late W.E.B DuBois",
      },
      {
        time: "10:30 AM",
        activity: "Osu Castle",
        description: "Explore the colonial-era fortress central to the slave trade",
      },
      {
        time: "12:00 PM",
        activity: "Kwame Nkrumah Memorial Park",
        description: "Visit the park dedicated to Ghana's first president",
      },
      {
        time: "1:30 PM",
        activity: "Lunch Break",
        description: "Enjoy authentic Ghanaian cuisine",
      },
      {
        time: "3:00 PM",
        activity: "Black Star Gate & Independence Square",
        description: "See Ghana's iconic symbol of independence",
      },
      {
        time: "4:30 PM",
        activity: "Arts Center",
        description: "Shop for authentic cultural goods and souvenirs",
      },
      {
        time: "6:00 PM",
        activity: "Hotel Drop-off",
        description: "Return to your hotel",
      },
    ],
  },
  {
    id: "2",
    title: "Kumasi City Tour",
    slug: "kumasi-city-tour",
    categorySlug: "historical-city-tours",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    description: "A visit to the capital of the Ashanti Kingdom of Ghana. Visit museums, marketplace, the king's palace and more.",
    price: "$100 +",
    priceValue: 100,
    duration: "Full Day",
    rating: 4.6,
    reviewCount: 89,
    bookedCount: 312,
    trustBadges: ["popular", "verified"],
    freeCancellation: true,
    activities: [],
    whatsIncluded: [],
    whyBook: [],
    gallery: [],
    location: "Kumasi, Ghana",
    mapCoordinates: {
      lat: 6.6885,
      lng: -1.6244,
    },
  },
  {
    id: "3",
    title: "Cape Coast Historical Tour",
    slug: "cape-coast-historical-tour",
    categorySlug: "historical-city-tours",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    description: "Visit the Capecoast and Assin Manso in the Central region of Ghana and explore slave castles and the Slave River to get deep insight into the transatlantic slave trade and its...",
    price: "$100 +",
    priceValue: 100,
    duration: "Full Day",
    rating: 4.9,
    reviewCount: 203,
    bookedCount: 789,
    trustBadges: ["best-seller", "popular", "verified"],
    freeCancellation: true,
    activities: [],
    whatsIncluded: [],
    whyBook: [],
    gallery: [],
    location: "Cape Coast, Ghana",
    mapCoordinates: {
      lat: 5.1053,
      lng: -1.2466,
    },
  },
  {
    id: "4",
    title: "Volta Tour",
    slug: "volta-tour",
    categorySlug: "historical-city-tours",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    description: "Visit the Volta Region of Ghana and get a full-day experience of hiking, nature exploration, wildlife encounters, and cultural insight. Ideal for groups and individuals se...",
    price: "$100 +",
    priceValue: 100,
    duration: "Full Day",
    rating: 4.7,
    reviewCount: 156,
    bookedCount: 445,
    trustBadges: ["popular"],
    freeCancellation: false,
    activities: [],
    whatsIncluded: [],
    whyBook: [],
    gallery: [],
    location: "Volta Region, Ghana",
    mapCoordinates: {
      lat: 6.5,
      lng: 0.5,
    },
  },
];

// Helper functions
export function getCategoryBySlug(slug: string): PackageCategory | undefined {
  return packageCategories.find((cat) => cat.slug === slug);
}

export function getTourBySlug(categorySlug: string, tourSlug: string): Tour | undefined {
  return tours.find((tour) => tour.categorySlug === categorySlug && tour.slug === tourSlug);
}

export function getTourBySlugOnly(tourSlug: string): Tour | undefined {
  return tours.find((tour) => tour.slug === tourSlug);
}

export function getToursByCategory(categorySlug: string): Tour[] {
  return tours.filter((tour) => tour.categorySlug === categorySlug);
}

export function getSimilarTours(currentTour: Tour, limit: number = 3): Tour[] {
  return tours
    .filter((tour) =>
      tour.id !== currentTour.id &&
      tour.categorySlug === currentTour.categorySlug
    )
    .slice(0, limit);
}

// Legacy support
export const packages: Package[] = packageCategories.map((cat) => ({
  id: cat.id,
  title: cat.title,
  slug: cat.slug,
  image: cat.image,
}));

export function getPackageBySlug(slug: string): Package | undefined {
  return packages.find((pkg) => pkg.slug === slug);
}
