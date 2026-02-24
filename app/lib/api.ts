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
    .eq('status', 'published');

  if (error || !tours) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  // Map to frontend Tour interface
  return tours.map((t: any) => {
    // Sort images by order
    const sortedImages = (t.tour_images || []).sort((a: any, b: any) => a.display_order - b.display_order);
    const gallery = sortedImages.map((img: any) => img.image_url);
    const primaryImage = gallery[0] || '/assets/placeholder-tour.jpg'; // fallback

    const basePrice = t.tour_prices?.[0]?.amount || 0;
    const currency = t.tour_prices?.[0]?.currency || t.currency || 'GHS';

    return {
      id: t.id.toString(), // Support UUID
      title: t.title,
      slug: t.slug || generateSlug(t.title),
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
      rating: 4.8, // Mock ratings until reviews are linked
      reviewCount: Math.floor(Math.random() * 100) + 10,
      bookedCount: Math.floor(Math.random() * 500) + 50,
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
      tour_prices(amount, currency, name),
      tour_itineraries(title, description, day_number),
      tour_features(feature)
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

  // Itinerary
  const sortedItin = (t.tour_itineraries || []).sort((a: any, b: any) => a.day_number - b.day_number);
  const mappedItin = sortedItin.map((i: any) => ({
    time: `Day ${i.day_number}`,
    activity: i.title || 'Activity',
    description: i.description
  }));

  // Features
  const features = (t.tour_features || []).map((f: any) => f.feature);

  return {
    id: t.id.toString(),
    title: t.title,
    slug: t.slug || generateSlug(t.title),
    categorySlug: t.category || 'tours',
    image: primaryImage,
    gallery: gallery.length > 0 ? gallery : [primaryImage],
    description: t.description || '',
    price: `${currency} ${basePrice}`,
    priceValue: basePrice,
    duration: t.duration || 'Full Day',
    location: t.location || 'Ghana',
    map_url: t.map_url,
    price_tiers: t.tour_prices || [],
    whatsIncluded: features,
    itinerary: mappedItin,
    rating: 4.8,
    reviewCount: 45,
    bookedCount: 120,
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
