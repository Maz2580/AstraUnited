// Build a stop-motion frame set from curated burst photos.
// Usage: node scripts/build-hero-frames.mjs [path/to/config.json]
// Defaults to scripts/hero-frames.config.json; outputs webp frames + posters
// and prints { frameCount, blurDataURL, blurDataURLMobile } for the consumer.
//
// The source bursts are PORTRAIT (camera held vertically). Desktop frames are
// built as a 1280x720 landscape "stage": the photo blurred+darkened fills the
// background and the sharp portrait strip is composited at SUBJECT_X with
// soft-faded edges — full body always visible, no head-cropping. Mobile
// frames stay native portrait because phone heroes are portrait viewports.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const configPath = process.argv[2] ?? "scripts/hero-frames.config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const { sourceDir, outDir, frames } = config;

// Where the subject strip's centre sits on the landscape stage (0..1).
// Hero default 0.62 keeps the subject right-of-centre so the headline owns
// the left; other sets override via config.
const SUBJECT_X = config.subjectX ?? 0.62;

const STAGE = { width: 1280, height: 720, quality: 50, ...config.stage }; // desktop
const PORTRAIT = { width: 960, quality: 48, ...config.portrait }; // mobile
// "stage": composite the portrait strip onto a dark brand stage (hero look).
// "cover": plain cover-crop of the source to the stage box (for sets whose
// subject framing survives a straight crop).
const MODE = config.mode ?? "stage";

fs.mkdirSync(outDir, { recursive: true });

// Apply EXIF rotation up front (DSLR gotcha), then measure the REAL
// post-rotation dimensions — metadata() on the original reports pre-rotation
// width/height.
async function rotatedInput(file) {
  const buffer = await sharp(path.join(sourceDir, file)).rotate().toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, meta };
}

function edgeFadeMask(width, height, fadePct = 0.22) {
  const f = Math.max(0.01, Math.min(fadePct, 0.45));
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="${f}" stop-color="#000" stop-opacity="1"/>
        <stop offset="${1 - f}" stop-color="#000" stop-opacity="1"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  return Buffer.from(svg);
}

// Dark brand-gradient stage (matches --astra-navy -> --astra-ink). A blurred
// photo background was tried first but the subject's own blur reads as a
// creepy giant figure; the brand gradient melts into the hero's ink overlays
// and costs almost no bytes.
function stageBackground(width, height) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b2434"/>
        <stop offset="0.55" stop-color="#001c2a"/>
        <stop offset="1" stop-color="#06111a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
  </svg>`;
  return Buffer.from(svg);
}

/** Composite the portrait shot onto the dark landscape stage. */
async function buildStage(buffer, meta, outWidth, outHeight, quality, outPath) {
  // Background: blurred grass cropped from the photo's bottom band (no
  // subject in it), darkened toward the brand ink, then a brand-gradient
  // tint composited on top at partial opacity for cohesion.
  const grassBand = await sharp(buffer)
    .extract({
      left: 0,
      top: Math.round(meta.height * 0.78),
      width: meta.width,
      height: Math.round(meta.height * 0.22)
    })
    .resize(outWidth, outHeight, { fit: "cover" })
    .blur(26)
    .modulate({ brightness: 0.52, saturation: 0.82 })
    .toBuffer();
  const tint = await sharp(stageBackground(outWidth, outHeight))
    .ensureAlpha(0.55)
    .png()
    .toBuffer();
  const background = await sharp(grassBand)
    .composite([{ input: tint, blend: "over" }])
    .toBuffer();

  const stripWidth = Math.round(meta.width * (outHeight / meta.height));
  const strip = await sharp(buffer)
    .resize({ height: outHeight })
    .composite([{ input: edgeFadeMask(stripWidth, outHeight), blend: "dest-in" }])
    .png() // keep the alpha edge fade for the final composite
    .toBuffer();

  const left = Math.round(outWidth * SUBJECT_X - stripWidth / 2);
  await sharp(background)
    .composite([{ input: strip, left, top: 0 }])
    .webp({ quality })
    .toFile(outPath);
}

/** Plain cover crop — used when the source framing survives a straight crop. */
async function buildCover(buffer, outWidth, outHeight, quality, outPath) {
  await sharp(buffer)
    .resize(outWidth, outHeight, { fit: "cover", position: "attention" })
    .webp({ quality })
    .toFile(outPath);
}

async function processFrame(file, index) {
  const { buffer, meta } = await rotatedInput(file);
  const n = String(index + 1).padStart(3, "0");
  const outPath = path.join(outDir, `frame-${n}-${STAGE.width}.webp`);
  if (MODE === "cover") {
    await buildCover(buffer, STAGE.width, STAGE.height, STAGE.quality, outPath);
  } else {
    await buildStage(buffer, meta, STAGE.width, STAGE.height, STAGE.quality, outPath);
  }
  await sharp(buffer)
    .resize({ width: PORTRAIT.width })
    .webp({ quality: PORTRAIT.quality })
    .toFile(path.join(outDir, `frame-${n}-${PORTRAIT.width}.webp`));
}

async function blurFor(filePath) {
  const blur = await sharp(filePath).resize(16).webp({ quality: 30 }).toBuffer();
  return `data:image/webp;base64,${blur.toString("base64")}`;
}

async function buildPosters(file) {
  const { buffer, meta } = await rotatedInput(file);
  const desktopPath = path.join(outDir, "poster-1920.webp");
  if (MODE === "cover") {
    const scale = 1920 / STAGE.width;
    await buildCover(buffer, 1920, Math.round(STAGE.height * scale), 55, desktopPath);
  } else {
    await buildStage(buffer, meta, 1920, 1080, 55, desktopPath);
  }
  const mobilePath = path.join(outDir, `poster-${PORTRAIT.width}.webp`);
  await sharp(buffer)
    .resize({ width: PORTRAIT.width })
    .webp({ quality: 55 })
    .toFile(mobilePath);
  return {
    blurDataURL: await blurFor(desktopPath),
    blurDataURLMobile: await blurFor(mobilePath)
  };
}

const start = Date.now();
for (let i = 0; i < frames.length; i++) {
  await processFrame(frames[i], i);
}
const blurs = await buildPosters(frames[0]);

const totalBytes = fs
  .readdirSync(outDir)
  .reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);

console.log(JSON.stringify({ frameCount: frames.length, ...blurs }, null, 2));
console.log(
  `${frames.length} frames -> ${outDir} | total ${(totalBytes / 1024 / 1024).toFixed(2)} MB | ${Date.now() - start}ms`
);
