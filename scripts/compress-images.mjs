/**
 * Lossy re-encode raster images under public/ to reduce file size.
 * Skips SVG. Run: npm run compress:images
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
const PNG_COMPRESSION = 9;
/** Only write if new file is at least this much smaller (0 = always write) */
const MIN_RATIO = 0.97;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!EXT.has(ext)) return null;

  const before = await fs.stat(filePath);
  const input = await fs.readFile(filePath);

  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();

  let out;
  let outExt = ext;

  if (ext === ".png" && meta.hasAlpha) {
    out = await pipeline.png({ compressionLevel: PNG_COMPRESSION, adaptiveFiltering: true }).toBuffer();
  } else if (ext === ".png") {
    out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    outExt = ".webp";
  } else if (ext === ".webp") {
    out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  } else {
    out = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    outExt = ".jpg";
  }

  if (out.length >= before.size * MIN_RATIO && outExt === ext) {
    return { filePath, skipped: true, before: before.size, after: out.length };
  }

  if (outExt !== ext) {
    const newPath = filePath.slice(0, -ext.length) + outExt;
    await fs.writeFile(newPath, out);
    await fs.unlink(filePath);
    console.warn(`Converted ${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, newPath)} (update code references from ${ext} to ${outExt})`);
    return { filePath: newPath, converted: true, before: before.size, after: out.length };
  }

  await fs.writeFile(filePath, out);
  return { filePath, before: before.size, after: out.length };
}

async function main() {
  let stat;
  try {
    stat = await fs.stat(ROOT);
  } catch {
    console.error("public/ not found");
    process.exit(1);
  }
  if (!stat.isDirectory()) {
    console.error("public is not a directory");
    process.exit(1);
  }

  const files = await walk(ROOT);
  const targets = files.filter((f) => EXT.has(path.extname(f).toLowerCase()));

  if (targets.length === 0) {
    console.log("No JPEG/PNG/WebP files under public/. Add images to public/assets then run again.");
    return;
  }

  let saved = 0;
  for (const f of targets) {
    try {
      const r = await compressFile(f);
      if (!r) continue;
      if (r.skipped) {
        console.log(`Skip (already small): ${path.relative(ROOT, r.filePath)}`);
        continue;
      }
      const rel = path.relative(ROOT, r.filePath);
      saved += r.before - r.after;
      console.log(`${rel}: ${r.before} -> ${r.after} bytes (${((1 - r.after / r.before) * 100).toFixed(1)}% smaller)`);
    } catch (e) {
      console.error(`Failed ${f}:`, e.message || e);
    }
  }
  console.log(`Total bytes saved: ${saved}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
