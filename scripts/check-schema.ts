import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: ann, error: err1 } = await supabase.from('announcements').select('*').limit(1);
  console.log('Announcements snippet:', JSON.stringify(ann));
  if (err1) console.error('Announcements error:', err1);

  const { data: part, error: err2 } = await supabase.from('partners').select('*').limit(1);
  console.log('Partners snippet:', JSON.stringify(part));
  if (err2) console.error('Partners error:', err2);
}
run();
