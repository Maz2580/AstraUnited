// Extract the approved hero clip into the webp frame set that HeroFramesCanvas
// scrubs by scroll. Re-run after dropping a new source video to swap the hero
// footage with no code change (frameCount stays in sync via the printed value).
//
//   node scripts/build-hero-video-frames.mjs [path/to/source.mp4]
//
// Requires ffmpeg on PATH. Writes to public/images/hero-video-frames/.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC =
  process.argv[2] ||
  "motion-lab/approved_video/istockphoto-1449566043-640_adpp_is.mp4";
const OUT = "public/images/hero-video-frames";
const FRAMES = 60; // keep in sync with heroMedia.frameCount in HeroIntro.tsx

// Probe duration so frames are spaced evenly across the whole clip.
const duration = Number(
  execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    SRC
  ]).toString().trim()
);
const rate = `${FRAMES}/${duration}`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Desktop set (loader key -1280) at 1280px. Quality is kept modest because the
// heavy dark hero overlay hides fine detail — keeps the frame payload lean.
execFileSync("ffmpeg", [
  "-y", "-i", SRC,
  "-vf", `fps=${rate},scale=1280:-2`,
  "-c:v", "libwebp", "-quality", "68", "-compression_level", "6",
  join(OUT, "frame-%03d-1280.webp")
], { stdio: "inherit" });

// Mobile set (loader key -960) at 640px.
execFileSync("ffmpeg", [
  "-y", "-i", SRC,
  "-vf", `fps=${rate},scale=640:-2`,
  "-c:v", "libwebp", "-quality", "66", "-compression_level", "6",
  join(OUT, "frame-%03d-960.webp")
], { stdio: "inherit" });

// Posters for first paint (before frames finish loading).
for (const [w, name] of [[1280, "poster-desktop.webp"], [640, "poster-mobile.webp"]]) {
  execFileSync("ffmpeg", [
    "-y", "-ss", "2.5", "-i", SRC,
    "-frames:v", "1", "-vf", `scale=${w}:-2`,
    "-c:v", "libwebp", "-quality", "80",
    join(OUT, name)
  ], { stdio: "inherit" });
}

const count = readdirSync(OUT).filter((f) => f.endsWith("-1280.webp")).length;
const bytes = readdirSync(OUT)
  .map((f) => statSync(join(OUT, f)).size)
  .reduce((a, b) => a + b, 0);
console.log(
  `\nDone: ${count} frames/size → ${OUT} (${(bytes / 1048576).toFixed(2)} MB total).` +
  `\nSet heroMedia.frameCount = ${count} in src/components/HeroIntro.tsx.`
);
