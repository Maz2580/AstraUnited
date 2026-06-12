"use client";

import Image from "next/image";
import { HeroFramesCanvas } from "@/src/components/HeroFramesCanvas";

// Values from `node scripts/build-hero-frames.mjs scripts/women-frames.config.json`.
const FRAME_COUNT = 16;
const POSTER = "/images/women-frames/poster-1920.webp";
const BLUR =
  "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACQAQCdASoQAAsABABoJQAAQiLs6AAA/sum6eaY/l8axyEpHoT9/rQpg++7X98Sw29kVXpWuVJBxImboie/+gQ1sAA=";

/**
 * Women's First Team card (homepage section 5): hero-style ping-pong
 * stop-motion loop. Below the fold, so frames only preload when the card
 * nears the viewport; the poster paints first and simply stays for
 * reduced-motion users or on any load failure.
 */
export function WomensMotionCard() {
  return (
    <div className="relative h-[460px] w-full">
      <Image
        src={POSTER}
        alt="Astra United women's player juggling the ball in the late-afternoon sun at DISC Darebin"
        fill
        placeholder="blur"
        blurDataURL={BLUR}
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="object-cover"
      />
      <HeroFramesCanvas
        frameCount={FRAME_COUNT}
        fps={7}
        basePath="/images/women-frames"
        preload="near-viewport"
      />
    </div>
  );
}
