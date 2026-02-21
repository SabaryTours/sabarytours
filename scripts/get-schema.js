require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // PostgREST doesn't expose information_schema easily, so we can just do a select with limit 0 or 1, and get the shape.
  // Actually, let's just insert a blank row and see the error? No, let's read pg_catalog if possible.
  
  // Alternative: fetch CSV format which includes column headers
  try {
    const resB = await fetch(`${supabaseUrl}/rest/v1/bookings?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'text/csv'
      }
    });
    const csvB = await resB.text();
    
    const resI = await fetch(`${supabaseUrl}/rest/v1/inquiries?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'text/csv'
      }
    });
    const csvI = await resI.text();
    
    fs.writeFileSync('schema-headers.json', JSON.stringify({ 
      bookings: csvB.split('\n')[0], 
      inquiries: csvI.split('\n')[0] 
    }, null, 2));
    console.log('Saved headers to schema-headers.json');
  } catch (e) {
    console.error(e);
  }
}
run();
