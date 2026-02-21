require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: ann } = await supabase.from('announcements').select('*').limit(1);
  const { data: part } = await supabase.from('partners').select('*').limit(1);
  fs.writeFileSync('schema.json', JSON.stringify({ ann, part }, null, 2));
}
run();
