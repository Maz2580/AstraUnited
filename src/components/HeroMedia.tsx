"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroFramesCanvas } from "@/src/components/HeroFramesCanvas";

export type HeroSource =
  | { kind: "image"; src: string; alt: string; blurDataURL?: string }
  | {
      kind: "crossfade";
      images: { src: string; alt: string; blurDataURL?: string; position?: string }[];
      intervalMs: number;
    }
  | { kind: "video"; src: string; poster: string }
  | {
      kind: "frames";
      frameCount: number;
      poster: string;
      posterMobile?: string;
      blurDataURL?: string;
      blurDataURLMobile?: string;
      fps?: number;
      /** Frame folder under /public (defaults to /images/hero-frames). */
      basePath?: string;
      /** Scrub frames with scroll through a [data-hero-scrub] ancestor. */
      scrub?: boolean;
    };

/**
 * Single boundary for hero background media. Swap `source` to upgrade to the
 * team's motion frames later with no other changes to the hero.
 */
export function HeroMedia({ source }: { source: HeroSource }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (source.kind !== "crossfade") return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % source.images.length),
      source.intervalMs
    );
    return () => clearInterval(id);
  }, [source]);

  if (source.kind === "video") {
    return (
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={source.src}
        poster={source.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    );
  }

  if (source.kind === "crossfade") {
    return (
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        {source.images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt=""
            fill
            priority={i === 0}
            placeholder={img.blurDataURL ? "blur" : "empty"}
            blurDataURL={img.blurDataURL}
            sizes="100vw"
            style={img.position ? { objectPosition: img.position } : undefined}
            className={`object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
    );
  }

  if (source.kind === "frames") {
    // Poster paints immediately (desktop landscape stage / mobile portrait),
    // then the canvas player fades in over it once every frame is loaded.
    return (
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src={source.poster}
          alt=""
          fill
          priority
          placeholder={source.blurDataURL ? "blur" : "empty"}
          blurDataURL={source.blurDataURL}
          sizes={source.posterMobile ? "(min-width: 768px) 100vw, 1px" : "100vw"}
          className={`object-cover ${source.posterMobile ? "hidden md:block" : ""}`}
        />
        {source.posterMobile ? (
          <Image
            src={source.posterMobile}
            alt=""
            fill
            priority
            placeholder={source.blurDataURLMobile ? "blur" : "empty"}
            blurDataURL={source.blurDataURLMobile}
            sizes="(max-width: 767px) 100vw, 1px"
            className="object-cover md:hidden"
          />
        ) : null}
        <HeroFramesCanvas
          frameCount={source.frameCount}
          fps={source.fps}
          basePath={source.basePath}
          mode={source.scrub ? "scrub" : "loop"}
        />
      </div>
    );
  }

  return (
    <Image
      src={source.src}
      alt={source.alt}
      fill
      priority
      placeholder={source.blurDataURL ? "blur" : "empty"}
      blurDataURL={source.blurDataURL}
      sizes="100vw"
      className="-z-20 object-cover"
    />
  );
}
