import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const list = JSON.parse(await readFile(join(root, "scripts/curated-images.json"), "utf8"));
const outRoot = join(root, "public/images");
const widths = [1920, 1280, 800];
const manifest = [];

for (const item of list) {
  const base = sharp(item.src).rotate(); // auto-orient via EXIF
  const meta = await base.metadata();
  const outBase = item.out.replace(/\.webp$/, "");
  for (const w of widths) {
    if (meta.width && meta.width < w && w !== widths[widths.length - 1]) continue;
    const outPath = join(outRoot, `${outBase}-${w}.webp`);
    await mkdir(dirname(outPath), { recursive: true });
    await sharp(item.src).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(outPath);
  }
  const blur = await sharp(item.src).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest.push({
    category: item.category,
    alt: item.alt,
    base: `/images/${outBase}`,
    widths,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`
  });
  console.log("processed", item.out);
}

await writeFile(join(outRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`done: ${manifest.length} images`);
