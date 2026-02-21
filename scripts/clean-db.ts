import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function cleanAndSeed() {
  console.log("Cleaning database to remove duplicates...");

  // Use a blanket condition to delete all rows. 
  // Cascading deletes on tours will automatically clear tour_images, tour_prices, bookings, etc.
  await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Just in case any orphaned bookings exist
  await supabase.from('inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('subscribers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("All tables cleared successfully.");
}

cleanAndSeed();
