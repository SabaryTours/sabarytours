import { createClient } from '../utils/supabase/server';
import { Tour } from '../data/packages';

// Helper to generate a slug if missing
const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
  const tourSlugs = tours.map((t: any) => t.slug || generateSlug(t.title)).filter(Boolean);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('tour_slug, rating')
    .eq('status', 'approved')
    .in('tour_slug', tourSlugs);

  // Aggregate ratings per tour
  const ratingMap: Record<string, { total: number; count: number }> = {};
  (reviewStats || []).forEach((r: any) => {
    if (!r.tour_slug) return;
    if (!ratingMap[r.tour_slug]) ratingMap[r.tour_slug] = { total: 0, count: 0 };
    ratingMap[r.tour_slug].total += r.rating;
    ratingMap[r.tour_slug].count += 1;
  });

  // Map to frontend Tour interface
  return tours.map((t: any) => {
    // Sort images by order
    const sortedImages = (t.tour_images || []).sort((a: any, b: any) => a.display_order - b.display_order);
    const gallery = sortedImages.map((img: any) => img.image_url);
    const primaryImage = gallery[0] || '/assets/placeholder-tour.jpg'; // fallback

    const basePrice = t.tour_prices?.[0]?.amount || 0;
    const currency = t.tour_prices?.[0]?.currency || t.currency || 'GHS';
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
      duration: t.duration || 'Full Day',
      location: t.location || 'Ghana',
      map_url: t.map_url,
      price_tiers: t.tour_prices || [],
      rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : undefined,
      reviewCount: stats?.count || 0,
      bookedCount: 0,
      freeCancellation: true,
    } as Tour;
  });
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
  const matchedTour = tours.find((t: any) => (t.slug || generateSlug(t.title)) === tourSlug);

  if (!matchedTour) return null;
  const t = matchedTour;

  const sortedImages = (t.tour_images || []).sort((a: any, b: any) => a.display_order - b.display_order);
  const gallery = sortedImages.map((img: any) => img.image_url);
  const primaryImage = gallery[0] || '/assets/placeholder-tour.jpg';

  const basePrice = t.tour_prices?.[0]?.amount || 0;
  const currency = t.tour_prices?.[0]?.currency || t.currency || 'GHS';

  // Itinerary from JSONB column
  const rawItinerary = Array.isArray(t.itinerary) ? t.itinerary : [];
  const mappedItin = rawItinerary.map((i: any) => ({
    time: i.time || `Day ${i.day || ''}`,
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
    ? Math.round((reviewData!.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : undefined;

  return {
    id: t.id.toString(),
    title: t.title,
    slug: resolvedSlug,
    categorySlug: t.category || 'tours',
    image: primaryImage,
    gallery: gallery.length > 0 ? gallery : [primaryImage],
    availableDays: Array.isArray(t.available_days) ? t.available_days : [],
    blockedDates: Array.isArray(t.blocked_dates) ? t.blocked_dates : [],
    timeSlots: Array.isArray(t.time_slots) ? t.time_slots : [],
    description: t.description || '',
    price: `${currency} ${basePrice}`,
    priceValue: basePrice,
    duration: t.duration || 'Full Day',
    location: t.location || 'Ghana',
    map_url: t.map_url,
    price_tiers: t.tour_prices || [],
    whatsIncluded: whatsIncluded,
    exclusions,
    whatToBring,
    groupSizeOptions,
    ageCategories,
    languages,
    itinerary: mappedItin,
    rating: avgRating,
    reviewCount: reviewCount,
    bookedCount: 0,
    freeCancellation: true,
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
  content: string;
  excerpt?: string;
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

  return {
    id: post.id.toString(),
    title: post.title,
    slug: post.slug || generateSlug(post.title),
    image: post.image_url || '/assets/placeholder-blog.jpg',
    views: Math.floor(Math.random() * 1000) + 100,
    comments: Math.floor(Math.random() * 50),
    author: 'Sabary Tours',
    date: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    content: post.content || '',
    excerpt: post.summary || '',
  } as BlogPost;
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

export async function getHappenings(): Promise<NowHappening[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("now_happenings")
    .select("*")
    .eq("is_active", true)
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
  accent_color: string;
}

export async function getTripOutlineForYear(year: number): Promise<TripOutlineMonth[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_year_outline")
    .select("id, year, month, title, body, accent_color")
    .eq("year", year)
    .eq("is_published", true)
    .order("month", { ascending: true });

  if (error) {
    console.error("trip_year_outline fetch:", error);
    return [];
  }
  return (data as TripOutlineMonth[]) || [];
}

