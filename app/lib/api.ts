import { resolveBlogImageUrl } from './blogImages';
import { normalizeBlogTags } from './blogTags';
import { createClient } from '../utils/supabase/server';
import { Tour } from '../data/packages';
import { getTourBookingCounts } from './packagePopularity';
import { getLowestTierPrice, sortTourPriceTiers } from './tourPricing';
import {
  FEATURED_TOUR_MATCHERS,
  MAX_FEATURED_TOURS,
  matcherToFallbackCard,
  matchTourByPatterns,
  tourToFeaturedCard,
  type FeaturedTourCard,
  type TourForFeaturedCard,
} from './featuredTours';

type TourImageRow = {
  image_url: string;
  display_order: number;
};

type TourPriceRow = {
  amount: number;
  currency?: string | null;
  name?: string | null;
};

type ItineraryRow = {
  type?: "time" | "day";
  day?: number;
  time?: string;
  title?: string;
  activity?: string;
  description?: string;
};

type TourRow = {
  id: string | number;
  title: string;
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  duration?: string | null;
  location?: string | null;
  map_url?: string | null;
  currency?: string | null;
  tour_images?: TourImageRow[] | null;
  tour_prices?: TourPriceRow[] | null;
  itinerary?: ItineraryRow[] | null;
  whats_included?: string[] | null;
  exclusions?: string[] | null;
  what_to_bring?: string[] | null;
  group_size_options?: string[] | null;
  age_categories?: string[] | null;
  languages?: string[] | null;
  available_days?: string[] | null;
  blocked_dates?: string[] | null;
  time_slots?: string[] | null;
  total_seats?: number | null;
  seats_remaining?: number | null;
  show_booking_count?: boolean | null;
  view_count?: number | null;
};

type ReviewRow = {
  tour_slug?: string | null;
  rating: number;
};

// Helper to generate a slug if missing
const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function mapTourMetaFields(t: TourRow) {
  const parseCount = (value: unknown) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    totalSeats: parseCount(t.total_seats),
    seatsRemaining: parseCount(t.seats_remaining),
    showBookingCount: Boolean(t.show_booking_count),
    viewCount: parseCount(t.view_count) ?? 0,
  };
}

const FEATURED_TOUR_SELECT = `
  title,
  slug,
  category,
  duration,
  location,
  description,
  whats_included,
  tour_images(image_url, display_order)
`;

/** All published tours for the full catalog page (`/featured-tours`). */
export async function getAllPublishedTours(): Promise<FeaturedTourCard[]> {
  const supabase = await createClient();

  const { data: tours, error } = await supabase
    .from("tours")
    .select(FEATURED_TOUR_SELECT)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !tours) {
    console.error("getAllPublishedTours:", error);
    return [];
  }

  return (tours as TourForFeaturedCard[]).map((tour) => tourToFeaturedCard(tour));
}

/** Featured tours marked in admin (`is_featured`), with legacy title-matcher fallback. */
export async function getFeaturedTours(
  limit = MAX_FEATURED_TOURS,
): Promise<FeaturedTourCard[]> {
  const supabase = await createClient();

  const { data: adminFeatured, error: featuredError } = await supabase
    .from("tours")
    .select(FEATURED_TOUR_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("updated_at", { ascending: false });

  if (!featuredError && adminFeatured && adminFeatured.length > 0) {
    return (adminFeatured as TourForFeaturedCard[])
      .slice(0, limit)
      .map((tour) => tourToFeaturedCard(tour));
  }

  if (featuredError && !/is_featured/i.test(featuredError.message)) {
    console.error("getFeaturedTours (admin featured):", featuredError);
  }

  const { data: tours, error } = await supabase
    .from("tours")
    .select(FEATURED_TOUR_SELECT)
    .eq("status", "published");

  if (error) {
    console.error("getFeaturedTours:", error);
    return FEATURED_TOUR_MATCHERS.slice(0, limit).map(matcherToFallbackCard);
  }

  const published = (tours || []) as TourForFeaturedCard[];

  return FEATURED_TOUR_MATCHERS.slice(0, limit).map((matcher) => {
    const tour = matchTourByPatterns(published, matcher.titlePatterns);
    if (!tour) return matcherToFallbackCard(matcher);

    return tourToFeaturedCard(tour, {
      title: matcher.displayTitle,
      duration: formatTourDurationFromMatcher(tour.duration, matcher.duration),
      location: tour.location?.trim() || matcher.location,
      highlights: matcher.highlights,
    });
  });
}

function formatTourDurationFromMatcher(
  tourDuration: string | null | undefined,
  matcherDuration: string
): string {
  const raw = tourDuration ? String(tourDuration).trim() : "";
  if (raw && /day|hour|min/i.test(raw)) return raw;
  if (raw && /^\d+(\.\d+)?$/.test(raw)) return matcherDuration;
  return raw || matcherDuration;
}

export async function getPackageBySlug(slug: string) {
  const supabase = await createClient();
  const { data: pkg, error } = await supabase
    .from('packages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !pkg) return null;
  return pkg;
}

export async function getToursByCategory(categorySlug: string): Promise<Tour[]> {
  const supabase = await createClient();

  const { data: tours, error } = await supabase
    .from('tours')
    .select(`
      *,
      tour_images(image_url, display_order),
      tour_prices(amount, currency)
    `)
    .eq('category', categorySlug)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !tours) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  // Fetch review stats for all tours in this category
  const typedTours = tours as TourRow[];
  const tourSlugs = typedTours.map((t) => t.slug || generateSlug(t.title)).filter(Boolean);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('tour_slug, rating')
    .eq('status', 'approved')
    .in('tour_slug', tourSlugs);

  // Aggregate ratings per tour
  const ratingMap: Record<string, { total: number; count: number }> = {};
  ((reviewStats || []) as ReviewRow[]).forEach((r) => {
    if (!r.tour_slug) return;
    if (!ratingMap[r.tour_slug]) ratingMap[r.tour_slug] = { total: 0, count: 0 };
    ratingMap[r.tour_slug].total += r.rating;
    ratingMap[r.tour_slug].count += 1;
  });

  const tourIds = typedTours.map((t) => String(t.id));
  const bookingCounts = await getTourBookingCounts(supabase, tourIds);

  const mapped = typedTours.map((t) => {
    // Sort images by order
    const sortedImages = [...(t.tour_images || [])].sort((a, b) => a.display_order - b.display_order);
    const gallery = sortedImages.map((img) => img.image_url);
    const primaryImage = gallery[0] || '/assets/placeholder-tour.jpg'; // fallback

    const sortedTiers = sortTourPriceTiers(t.tour_prices || []);
    const { amount: basePrice, currency } = getLowestTierPrice(sortedTiers, t.currency);
    const slug = t.slug || generateSlug(t.title);
    const stats = ratingMap[slug];

    return {
      id: t.id.toString(), // Support UUID
      title: t.title,
      slug: slug,
      categorySlug: categorySlug, // keeping UI context
      image: primaryImage,
      gallery: gallery,
      description: t.description || '',
      price: `${currency} ${basePrice}`,
      priceValue: basePrice,
      priceCurrency: currency,
      duration: t.duration || 'Full Day',
      location: t.location || 'Ghana',
      map_url: t.map_url,
      price_tiers: sortedTiers,
      rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : undefined,
      reviewCount: stats?.count || 0,
      bookedCount: bookingCounts[String(t.id)] || 0,
      freeCancellation: true,
      ...mapTourMetaFields(t),
    } as Tour;
  });

  return mapped.sort((a, b) => (b.bookedCount || 0) - (a.bookedCount || 0));
}

export async function getSimilarTours(
  excludeSlug: string,
  categorySlug?: string | null,
): Promise<Tour[]> {
  if (categorySlug) {
    const tours = await getToursByCategory(categorySlug);
    return tours.filter((tour) => tour.slug !== excludeSlug).slice(0, 3);
  }

  const supabase = await createClient();
  const { data: tours, error } = await supabase
    .from("tours")
    .select(`
      *,
      tour_images(image_url, display_order),
      tour_prices(amount, currency)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !tours) return [];

  const typedTours = (tours as TourRow[]).filter((tour) => {
    const slug = tour.slug || generateSlug(tour.title);
    return slug !== excludeSlug;
  });

  return typedTours.slice(0, 3).map((t) => {
    const sortedImages = [...(t.tour_images || [])].sort((a, b) => a.display_order - b.display_order);
    const gallery = sortedImages.map((img) => img.image_url);
    const primaryImage = gallery[0] || "/assets/placeholder-tour.jpg";
    const sortedTiers = sortTourPriceTiers(t.tour_prices || []);
    const { amount: basePrice, currency } = getLowestTierPrice(sortedTiers, t.currency);
    const slug = t.slug || generateSlug(t.title);

    return {
      id: t.id.toString(),
      title: t.title,
      slug,
      categorySlug: t.category || "",
      image: primaryImage,
      gallery,
      description: t.description || "",
      price: `${currency} ${basePrice}`,
      priceValue: basePrice,
      priceCurrency: currency,
      duration: t.duration || "Full Day",
      location: t.location || "Ghana",
      map_url: t.map_url,
      price_tiers: sortedTiers,
      freeCancellation: true,
      ...mapTourMetaFields(t),
    } as Tour;
  });
}

export async function getPublishedTourOptions(): Promise<
  Array<{ slug: string; title: string; category: string | null }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("title, slug, category")
    .eq("status", "published")
    .order("title", { ascending: true });

  if (error || !data) return [];

  return data.map((tour) => ({
    slug: tour.slug || generateSlug(tour.title),
    title: tour.title,
    category: tour.category || null,
  }));
}

export async function getTourBySlug(tourSlug: string): Promise<Tour | null> {
  const supabase = await createClient();

  const { data: tours, error } = await supabase
    .from('tours')
    .select(`
      *,
      tour_images(image_url, display_order),
      tour_prices(amount, currency, name)
    `)
    .eq('status', 'published');

  if (error || !tours) return null;

  // Find by active generated slug
  const typedTours = tours as TourRow[];
  const matchedTour = typedTours.find((t) => (t.slug || generateSlug(t.title)) === tourSlug);

  if (!matchedTour) return null;
  const t = matchedTour;

  const sortedImages = [...(t.tour_images || [])].sort((a, b) => a.display_order - b.display_order);
  const gallery = sortedImages.map((img) => img.image_url);
  const primaryImage = gallery[0] || '/assets/placeholder-tour.jpg';

  const sortedTiers = sortTourPriceTiers(t.tour_prices || []);
  const { amount: basePrice, currency } = getLowestTierPrice(sortedTiers, t.currency);

  // Itinerary from JSONB column
  const rawItinerary = Array.isArray(t.itinerary) ? t.itinerary : [];
  const mappedItin = rawItinerary.map((i) => ({
    type: i.type === 'time' || (i.time && !i.day) ? 'time' : 'day',
    time: i.type === 'time' || (i.time && !i.day) ? i.time || '' : `Day ${i.day || ''}`,
    activity: i.title || i.activity || 'Activity',
    description: i.description || ''
  }));

  // What's Included from JSONB column
  const whatsIncluded = Array.isArray(t.whats_included) ? t.whats_included : [];
  const exclusions = Array.isArray(t.exclusions) ? t.exclusions : [];
  const whatToBring = Array.isArray(t.what_to_bring) ? t.what_to_bring : [];
  const groupSizeOptions = Array.isArray(t.group_size_options) ? t.group_size_options : [];
  const ageCategories = Array.isArray(t.age_categories) ? t.age_categories : [];
  const languages = Array.isArray(t.languages) ? t.languages : [];

  // Fetch real review stats for this tour
  const resolvedSlug = t.slug || generateSlug(t.title);
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'approved')
    .eq('tour_slug', resolvedSlug);

  const reviewCount = reviewData?.length || 0;
  const avgRating = reviewCount > 0
    ? Math.round((((reviewData || []) as Pick<ReviewRow, "rating">[]).reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : undefined;

  const bookingCounts = await getTourBookingCounts(supabase, [String(t.id)]);

  return {
    id: t.id.toString(),
    title: t.title,
    slug: resolvedSlug,
    categorySlug: t.category || "",
    image: primaryImage,
    gallery: gallery.length > 0 ? gallery : [primaryImage],
    availableDays: Array.isArray(t.available_days) ? t.available_days : [],
    blockedDates: Array.isArray(t.blocked_dates) ? t.blocked_dates : [],
    timeSlots: Array.isArray(t.time_slots) ? t.time_slots : [],
    description: t.description || '',
    price: `${currency} ${basePrice}`,
    priceValue: basePrice,
    priceCurrency: currency,
    duration: t.duration || 'Full Day',
    location: t.location || 'Ghana',
    map_url: t.map_url,
    price_tiers: sortedTiers,
    whatsIncluded: whatsIncluded,
    exclusions,
    whatToBring,
    groupSizeOptions,
    ageCategories,
    languages,
    itinerary: mappedItin,
    rating: avgRating,
    reviewCount: reviewCount,
    bookedCount: bookingCounts[String(t.id)] || 0,
    freeCancellation: true,
    ...mapTourMetaFields(t),
  } as Tour;
}

// Blog Posts
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  views: number;
  comments: number;
  author: string;
  date: string;
  publishedAtIso: string;
  modifiedAtIso?: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  category?: string | null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .single();

  if (error || !post) return null;

  const resolvedSlug = post.slug || generateSlug(post.title);

  const publishedAtIso = post.created_at
    ? new Date(post.created_at).toISOString()
    : new Date().toISOString();
  const modifiedAtIso = post.updated_at
    ? new Date(post.updated_at).toISOString()
    : publishedAtIso;

  return {
    id: post.id.toString(),
    title: post.title,
    slug: resolvedSlug,
    image: resolveBlogImageUrl(post.image_url, resolvedSlug),
    views: post.view_count ?? 0,
    comments: post.comment_count ?? 0,
    author: 'Sabary Tours',
    date: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    publishedAtIso,
    modifiedAtIso,
    content: post.content || '',
    excerpt: post.summary || '',
    tags: normalizeBlogTags(Array.isArray(post.tags) ? post.tags.filter(Boolean) : []),
    category: typeof post.category === 'string' ? post.category : null,
  } as BlogPost;
}

export async function getRelatedBlogPosts(
  currentSlug: string,
  limit = 3,
): Promise<BlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((post) => {
    const resolvedSlug = post.slug || generateSlug(post.title);
    const publishedAtIso = post.created_at
      ? new Date(post.created_at).toISOString()
      : new Date().toISOString();
    const modifiedAtIso = post.updated_at
      ? new Date(post.updated_at).toISOString()
      : publishedAtIso;
    return {
      id: post.id.toString(),
      title: post.title,
      slug: resolvedSlug,
      image: resolveBlogImageUrl(post.image_url, resolvedSlug),
      views: post.view_count ?? 0,
      comments: post.comment_count ?? 0,
      author: 'Sabary Tours',
      date: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      publishedAtIso,
      modifiedAtIso,
      content: post.content || '',
      excerpt: post.summary || '',
      tags: normalizeBlogTags(Array.isArray(post.tags) ? post.tags.filter(Boolean) : []),
      category: typeof post.category === 'string' ? post.category : null,
    } as BlogPost;
  });
}

// Hero Images
export interface HeroImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export async function getHeroImages(activeOnly: boolean = false): Promise<HeroImage[]> {
  const supabase = await createClient();
  let query = supabase
    .from('hero_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching hero images:", error);
    return [];
  }

  return data as HeroImage[];
}

export async function addHeroImage(imageUrl: string, displayOrder: number = 0): Promise<HeroImage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hero_images')
    .insert([{ image_url: imageUrl, display_order: displayOrder, is_active: true }])
    .select()
    .single();

  if (error) {
    console.error("Error adding hero image:", error);
    return null;
  }
  return data as HeroImage;
}

export async function updateHeroImage(id: string, updates: Partial<HeroImage>): Promise<HeroImage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hero_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating hero image:", error);
    return null;
  }
  return data as HeroImage;
}

export async function deleteHeroImage(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('hero_images')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting hero image:", error);
    return false;
  }
  return true;
}

// What's Happening Now
export interface NowHappening {
  id: string;
  name: string;
  status: string;
  image_url: string;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export function filterLiveHappenings(events: NowHappening[]): NowHappening[] {
  return events.filter(
    (event) =>
      event.is_active &&
      (event.status === "ongoing" || event.status === "upcoming")
  );
}

export async function getHappenings(): Promise<NowHappening[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("now_happenings")
    .select("*")
    .eq("is_active", true)
    .in("status", ["ongoing", "upcoming"])
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching happenings:", error);
    return [];
  }

  return data as NowHappening[];
}

export interface TripOutlineMonth {
  id?: string;
  year: number;
  month: number;
  title: string;
  body: string | null;
  description?: string | null;
  image_url?: string | null;
  book_url?: string | null;
  card_type?: "featured" | "upcoming";
  accent_color: string;
  is_published?: boolean;
  sort_order?: number;
}

export async function getTripOutlineForYear(year: number): Promise<TripOutlineMonth[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_year_outline")
    .select("id, year, month, title, body, description, image_url, book_url, card_type, accent_color, is_published, sort_order")
    .eq("year", year)
    .eq("is_published", true)
    .order("month", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("trip_year_outline fetch:", error);
    return [];
  }
  return (data as TripOutlineMonth[]) || [];
}

