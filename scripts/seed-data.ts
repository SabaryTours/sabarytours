import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// import { Database } from '../database.types'; 

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role to bypass RLS

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const MIGRATION_DIR = path.join(process.cwd(), 'migration_output');


const seedTours = async () => {
  console.log('Seeding Tours...');
  if (!fs.existsSync(path.join(MIGRATION_DIR, 'tours.json'))) {
    console.error('tours.json missing');
    return;
  }
  const data = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'tours.json'), 'utf-8'));

  for (const item of data) {
    // 1. Insert Tour
    const { data: tour, error } = await supabase
      .from('tours')
      .insert({
        token_id: item.token_id,
        legacy_id: parseInt(item.id),
        title: item.title,
        category: item.category,
        location: item.location,
        description: item.description,
        map_url: item.map_url,
        duration: item.duration,
        start_time: item.start_time,
        currency: item.currency,
        created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
        status: item.status === 'published' ? 'published' : 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting tour ${item.title}:`, error.message);
      continue; // Skip details if tour fails
    }

    const tourId = tour.id;

    // 2. Images
    if (item.images && item.images.length > 0) {
      const imageInserts = item.images.map((url: string, idx: number) => ({
        tour_id: tourId,
        image_url: url,
        display_order: idx
      }));
      const { error: imgErr } = await supabase.from('tour_images').insert(imageInserts);
      if (imgErr) console.error(`Error inserting images for ${item.title}:`, imgErr.message);
    }

    // 3. Prices
    if (item.prices && item.prices.length > 0) {
      const priceInserts = item.prices.map((p: any) => ({
        tour_id: tourId,
        name: p.name,
        amount: parseFloat(p.amount) || 0,
        currency: item.currency || 'GHS'
      }));
      const { error: priceErr } = await supabase.from('tour_prices').insert(priceInserts);
      if (priceErr) console.error(`Error inserting prices for ${item.title}:`, priceErr.message);
    }

    // 4. Features
    if (item.features && item.features.length > 0) {
      const featureInserts = item.features.filter((f: string) => f.trim() !== '').map((f: string) => ({
        tour_id: tourId,
        feature: f
      }));
      if (featureInserts.length > 0) {
        const { error: featErr } = await supabase.from('tour_features').insert(featureInserts);
        if (featErr) console.error(`Error inserting features for ${item.title}:`, featErr.message);
      }
    }

    // 5. Itineraries
    if (item.itinerary && item.itinerary.length > 0) {
      const itinInserts = item.itinerary.filter((i: any) => i.title || i.description).map((i: any, idx: number) => ({
        tour_id: tourId,
        title: i.title,
        description: i.description,
        day_number: idx + 1
      }));
      if (itinInserts.length > 0) {
        const { error: itinErr } = await supabase.from('tour_itineraries').insert(itinInserts);
        if (itinErr) console.error(`Error inserting itinerary for ${item.title}:`, itinErr.message);
      }
    }
  }
  console.log(`Seeded ${data.length} tours.`);
};


const seedBookings = async () => {
  console.log('Seeding Bookings...');
  if (!fs.existsSync(path.join(MIGRATION_DIR, 'bookings.json'))) {
    console.error('bookings.json missing');
    return;
  }
  const data = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'bookings.json'), 'utf-8'));

  // Let's fallback to looking up by title since we don't have matching easy ids in bookings JSON
  const { data: tours } = await supabase.from('tours').select('id, title, legacy_id');
  const tourMap = new Map();
  tours?.forEach(t => {
    if (t.title) tourMap.set(t.title.toLowerCase(), t.id); // Map by title
  });

  for (const item of data) {
    let tourId = null;
    if (item.tour_title) {
      tourId = tourMap.get(item.tour_title.toLowerCase());
    }

    const { data: booking, error } = await supabase.from('bookings').insert({
      legacy_id: parseInt(item.id),
      invoice_number: item.invoice_number,
      customer_name: item.user_name,
      customer_email: item.user_email,
      customer_phone: item.user_phone,
      tour_id: tourId,
      tour_date: item.tour_date ? new Date(item.tour_date).toISOString() : null,
      total_cost: parseFloat(item.total_cost) || 0,
      amount_paid: parseFloat(item.amount_paid) || 0,
      booking_status: item.status === 'done' ? 'completed' : 'pending',
      created_at: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error(`Error inserting booking ${item.invoice_number}:`, error.message);
      continue;
    }

    // Guests
    if (item.guests && item.guests.length > 0) {
      const guestInserts = item.guests.map((g: any) => ({
        booking_id: booking.id,
        name: g.name,
        email: g.email,
        phone: g.phone
      }));
      const { error: guestErr } = await supabase.from('booking_guests').insert(guestInserts);
      if (guestErr) console.error(`Error inserting guests for ${item.invoice_number}:`, guestErr.message);
    }
  }
  console.log(`Seeded ${data.length} bookings.`);

};

const seedMisc = async () => {
  // Blogs
  console.log('Seeding Blogs/Posts...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'blogs.json'))) {
    const blogs = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'blogs.json'), 'utf-8'));
    const { error } = await supabase.from('posts').insert(blogs.map((b: any) => ({
      title: b.title,
      slug: b.slug,
      content: b.content,
      summary: b.summary,
      image_url: b.image_url,
      status: b.status,
      created_at: b.created_at ? new Date(b.created_at).toISOString() : undefined
    })));
    if (error) console.error('Error seeding blogs:', error.message);
  }


  // Announcements
  console.log('Seeding Announcements...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'announcements.json'))) {
    const announcements = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'announcements.json'), 'utf-8'));
    const { error } = await supabase.from('announcements').insert(announcements.map((a: any) => ({
      title: a.title,
      content: a.content,
      type: a.type,
      image_url: a.image,
      created_at: a.created_at ? new Date(a.created_at).toISOString() : undefined
    })));
    if (error) console.error('Error seeding announcements:', error.message);
  }

  // Partners
  console.log('Seeding Partners...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'partners.json'))) {
    const partners = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'partners.json'), 'utf-8'));
    const { error } = await supabase.from('partners').insert(partners.map((p: any) => ({
      name: p.name,
      image_url: p.image
    })));
    if (error) console.error('Error seeding partners:', error.message);
  }

  // Testimonials
  console.log('Seeding Reviews...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'testimonials.json'))) {
    const reviews = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'testimonials.json'), 'utf-8'));
    const { error } = await supabase.from('reviews').insert(reviews.map((r: any) => ({
      name: r.name,
      position: r.position,
      message: r.message,
      image_url: r.image,
      source: 'website',
      status: 'approved', // Assuming
      created_at: r.date ? new Date(r.date).toISOString() : undefined
    })));
    if (error) console.error('Error seeding reviews:', error.message);
  }

  // Subscribers
  console.log('Seeding Subscribers...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'subscribers.json'))) {
    const subs = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'subscribers.json'), 'utf-8'));
    // Filter valid emails
    const validSubs = subs.filter((s: any) => s.email && s.email.includes('@'));
    // Insert in chunks or ignore duplicates?
    const { error } = await supabase.from('subscribers').upsert(validSubs.map((s: any) => ({
      email: s.email,
      created_at: s.date ? new Date(s.date).toISOString() : undefined
    })), { onConflict: 'email', ignoreDuplicates: true });
    if (error) console.error('Error seeding subscribers:', error.message);
  }

  // Inquiries
  console.log('Seeding Inquiries...');
  if (fs.existsSync(path.join(MIGRATION_DIR, 'inquiries.json'))) {
    const inquiries = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'inquiries.json'), 'utf-8'));
    const { error } = await supabase.from('inquiries').insert(inquiries.map((i: any) => ({
      name: i.name,
      email: i.email,
      phone: i.phone,
      subject: i.subject,
      message: i.message,
      type: i.type,
      package_name: i.package_name,
      created_at: i.date ? new Date(i.date).toISOString() : undefined
    })));
    if (error) console.error('Error seeding inquiries:', error.message);
  }

};

// Run Seeder
const run = async () => {
  try {
    await seedMisc();
    await seedTours();
    await seedBookings();
    console.log('Seeding complete!');
  } catch (e) {
    console.error('Fatal Error:', e);
  }
};

run();
