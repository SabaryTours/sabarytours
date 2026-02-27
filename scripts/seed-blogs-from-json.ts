import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

type BlogRecord = {
  title: string;
  content: string;
  summary: string;
  image_url: string | null;
  created_at: string | null;
  status: string | null;
  slug: string | null;
};

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const blogsPath = path.join(process.cwd(), "migration_output", "blogs.json");
  if (!fs.existsSync(blogsPath)) {
    console.error(`blogs.json not found at ${blogsPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(blogsPath, "utf-8");
  const blogs: BlogRecord[] = JSON.parse(raw);

  console.log(`Seeding ${blogs.length} blogs into public.posts ...`);

  // Insert in manageable batches
  const batchSize = 100;
  for (let i = 0; i < blogs.length; i += batchSize) {
    const batch = blogs.slice(i, i + batchSize).map((b) => ({
      title: b.title,
      slug: b.slug,
      content: b.content,
      summary: b.summary,
      image_url: b.image_url,
      status: b.status ?? "published",
      created_at: b.created_at ?? new Date().toISOString(),
      updated_at: b.created_at ?? new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("posts")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error("Error inserting blog batch:", error);
      process.exit(1);
    }

    console.log(`Inserted/updated ${Math.min(i + batchSize, blogs.length)} / ${blogs.length}`);
  }

  console.log("Blog seeding complete.");
}

main().catch((err) => {
  console.error("Unexpected error while seeding blogs:", err);
  process.exit(1);
});

