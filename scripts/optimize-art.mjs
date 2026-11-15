// Shrinks insert art in public/inserts to what a card can actually show, in place.
//
// A card is at most ~420 CSS px wide on screen, so 900 x 1260 covers a 2x display with room to
// spare. Files keep their name and format (insert-art.ts paths stay valid); EXIF orientation is
// applied and metadata dropped. Files already within the box and under the size budget are left
// alone, so it is safe to run after every batch of new art:
//
//   npm run art            (or: node scripts/optimize-art.mjs [file ...])
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = new URL("../public/inserts/", import.meta.url);
const MAX_W = 900;
const MAX_H = 1260;
const BUDGET = 260 * 1024; // bytes; anything bigger gets re-encoded even if it already fits

const args = process.argv.slice(2);
const files = (args.length ? args.map((f) => path.basename(f)) : readdirSync(DIR)).filter((f) =>
  /\.(jpe?g|png|webp|avif)$/i.test(f),
);

let before = 0;
let after = 0;
let changed = 0;
for (const f of files) {
  const p = new URL(f, DIR);
  const src = readFileSync(p);
  const size = statSync(p).size;
  before += size;
  const meta = await sharp(src).metadata();
  const w = meta.autoOrient?.width ?? meta.width;
  const h = meta.autoOrient?.height ?? meta.height;
  if (w <= MAX_W && h <= MAX_H && size <= BUDGET) {
    after += size;
    continue;
  }
  let img = sharp(src).rotate().resize({ width: MAX_W, height: MAX_H, fit: "inside", withoutEnlargement: true });
  const ext = path.extname(f).toLowerCase();
  if (ext === ".png") img = img.png({ compressionLevel: 9, effort: 8 });
  else if (ext === ".webp") img = img.webp({ quality: 80 });
  else if (ext === ".avif") img = img.avif({ quality: 55 });
  else img = img.jpeg({ quality: 80, mozjpeg: true });
  const out = await img.toBuffer();
  if (out.length >= size) {
    after += size; // re-encoding would not help; keep the original
    continue;
  }
  writeFileSync(p, out);
  after += out.length;
  changed++;
  console.log(`${f.padEnd(12)} ${(size / 1024).toFixed(0).padStart(5)} KB -> ${(out.length / 1024).toFixed(0).padStart(4)} KB`);
}
const mb = (n) => (n / 1048576).toFixed(1);
console.log(`optimized ${changed} of ${files.length} files: ${mb(before)} MB -> ${mb(after)} MB`);
