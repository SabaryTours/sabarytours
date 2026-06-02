/**
 * Restores blog view/comment counts from migration_output/blog-view-baseline.json
 * (legacy static-site figures). Only updates rows where stored count is lower than baseline.
 *
 * Run: npx tsx scripts/backfill-blog-view-counts.ts
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type BaselineRow = {
  slug: string;
  view_count?: number;
  comment_count?: number;
};

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const baselinePath = path.join(
    process.cwd(),
    "migration_output",
    "blog-view-baseline.json",
  );
  if (!fs.existsSync(baselinePath)) {
    console.error(`Baseline file not found: ${baselinePath}`);
    process.exit(1);
  }

  const baseline: BaselineRow[] = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
  const supabase = createClient(supabaseUrl, serviceKey);

  let updated = 0;
  let skipped = 0;

  for (const row of baseline) {
    const { data: post } = await supabase
      .from("posts")
      .select("id, view_count, comment_count")
      .eq("slug", row.slug)
      .maybeSingle();

    if (!post) {
      console.warn(`No post found for slug: ${row.slug}`);
      skipped++;
      continue;
    }

    const nextViews = Math.max(post.view_count ?? 0, row.view_count ?? 0);
    const nextComments = Math.max(post.comment_count ?? 0, row.comment_count ?? 0);

    if (nextViews === (post.view_count ?? 0) && nextComments === (post.comment_count ?? 0)) {
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from("posts")
      .update({ view_count: nextViews, comment_count: nextComments })
      .eq("id", post.id);

    if (error) {
      console.error(`Failed to update ${row.slug}:`, error.message);
      continue;
    }

    console.log(`Updated ${row.slug}: views=${nextViews}, comments=${nextComments}`);
    updated++;
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
  console.log(
    "Add more slugs to migration_output/blog-view-baseline.json if you recover counts from Google Analytics or WordPress exports.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
