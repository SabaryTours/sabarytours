import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tourSlug = searchParams.get('tourSlug');

  try {
    const supabase = await createClient();

    // Fetch approved reviews, ordering by newest first
    let query = supabase
      .from('reviews')
      .select('id, name, image_url, rating, message, created_at')
      .eq('status', 'approved') // Only fetch approved reviews now
      .order('created_at', { ascending: false });

    // Filter by tourSlug if provided (for TourDetailPage), otherwise fetch all (for a general reviews page)
    if (tourSlug) {
      query = query.eq('tour_slug', tourSlug);
    }

    const { data: reviews, error } = await query;

    if (error) throw error;

    // Map the database columns back to the frontend's expected properties
    const formattedReviews = (reviews || []).map(r => ({
      id: r.id,
      name: r.name,
      avatar_url: r.image_url,
      rating: r.rating,
      content: r.message,
      created_at: r.created_at
    }));

    return NextResponse.json(formattedReviews, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { tourSlug, name, rating, content } = body;

    // Basic validation
    if (!name || !rating || !content) {
      return NextResponse.json(
        { error: 'Name, Rating, and Content are required fields.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Get the user if they're logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a lively, random avatar color based on the user's name if they don't have one
    const randomAvatarColor = ['#ff5e00', '#893300', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6'][
      name.length % 6
    ];
    // Create an elegant UI avatar SVG 
    const fallbackAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='${encodeURIComponent(randomAvatarColor)}'/><text x='50' y='50' fill='white' font-family='sans-serif' font-size='40' font-weight='bold' text-anchor='middle' alignment-baseline='middle'>${name.charAt(0).toUpperCase()}</text></svg>`;

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          name: name.trim(),
          rating,
          message: content.trim(),
          image_url: user?.user_metadata?.avatar_url || fallbackAvatar,
          source: tourSlug ? 'tour_comment' : 'website', // Note where it came from
          status: 'pending', // Requires admin approval now
          tour_slug: tourSlug || null, // Associate with specific tour if provided
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Map back for the frontend optimistic update
    const newReview = {
      id: data.id,
      name: data.name,
      avatar_url: data.image_url,
      rating: data.rating,
      content: data.message,
      created_at: data.created_at
    };

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
