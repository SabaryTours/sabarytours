import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; // Load env vars

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use Service Role Key for Admin bypass

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MIGRATION_DIR = path.join(process.cwd(), 'migration_output');

const pushBlogs = async () => {
  const data = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'blogs.json'), 'utf-8'));
  console.log(`Pushing ${data.length} blogs to Supabase...`);

  for (const item of data) {
    const { error } = await supabase.from('blogs').upsert({
      title: item.title,
      slug: item.slug,
      content: item.content,
      summary: item.summary,
      image_url: item.image_url,
      status: item.status,
      created_at: item.created_at
    }, { onConflict: 'slug' });

    if (error) console.error(`Error pushing blog ${item.title}:`, error.message);
  }
  console.log('Blogs push complete.');
};

const pushAnnouncements = async () => {
  const data = JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, 'announcements.json'), 'utf-8'));
  console.log(`Pushing ${data.length} announcements to Supabase...`);

  for (const item of data) {
    const { error } = await supabase.from('announcements').insert({
      title: item.title,
      content: item.content,
      type: item.type,
      image_url: item.image,
      created_at: item.created_at
    }); // No unique ref, so just insert. In real world maybe check if title exists.

    if (error) console.error(`Error pushing announcement ${item.title}:`, error.message);
  }
  console.log('Announcements push complete.');
};


const main = async () => {
  await pushBlogs();
  await pushAnnouncements();
};

main();
