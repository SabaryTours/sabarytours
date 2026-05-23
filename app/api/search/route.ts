import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';
import { rateLimit } from '../../lib/rateLimit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ tours: [], message: 'Search query must be at least 2 characters' });
  }

  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const { ok } = rateLimit({ key: `search:${ip}`, limit: 30, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json(
        { tours: [], error: 'Too many search requests. Please slow down.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const searchTerm = `%${query.trim()}%`;

    const { data: tours, error } = await supabase
      .from('tours')
      .select(`
        id, title, slug, description, duration, location, category, currency,
        tour_images(image_url, display_order),
        tour_prices(amount, currency, name)
      `)
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const results = (tours || []).map((t: any) => {
      const sortedImages = (t.tour_images || []).sort((a: any, b: any) => a.display_order - b.display_order);
      const primaryImage = sortedImages[0]?.image_url || '/assets/placeholder-tour.jpg';
      const validTiers = (t.tour_prices || [])
        .map((tier: any) => ({ amount: Number(tier?.amount), currency: tier?.currency }))
        .filter((tier: any) => Number.isFinite(tier.amount) && tier.amount > 0);
      const lowestTier = validTiers.length
        ? validTiers.reduce((acc: any, curr: any) => (curr.amount < acc.amount ? curr : acc))
        : null;
      const basePrice = lowestTier?.amount || 0;
      const currency = lowestTier?.currency || t.currency || 'GHS';

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        category: t.category,
        image: primaryImage,
        description: (t.description || '').substring(0, 150),
        price: `${currency} ${basePrice}`,
        priceValue: basePrice,
        duration: t.duration || 'Full Day',
        location: t.location || 'Ghana',
      };
    });

    return NextResponse.json({ tours: results });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ tours: [], error: error.message }, { status: 500 });
  }
}
