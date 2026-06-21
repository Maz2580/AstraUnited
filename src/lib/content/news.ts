import type { EventPost } from "./types";

// A card summary for listings (homepage teaser + blog index), and a full article
// for a post subpage. Both the admin event posts and the seed sample posts map
// into these shapes, so every consumer is source-agnostic.
export type PostSummary = {
  id: string;
  href: string;
  image: string;
  kicker: string;
  title: string;
  body: string;
};

export type Article = {
  id: string;
  title: string;
  category: string;
  dateLabel?: string;
  image: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type SamplePost = {
  slug: string;
  title: string;
  category: string;
  dateLabel: string;
  excerpt: string;
  body: string;
  image: string;
};

// Seed blog posts from the revised content spec §8, shown until real posts are
// published via the admin event system. Each has its own subpage at
// /news-media/<slug>. Bodies are deliberately general placeholder copy (no
// invented scores or names) — the club replaces them with real posts.
export const samplePosts: SamplePost[] = [
  {
    slug: "senior-team-secure-three-points",
    title: "Senior Team Secure Crucial Three Points",
    category: "Match Report",
    dateLabel: "14 June 2026",
    excerpt:
      "A composed, disciplined performance saw the Astra senior side control the game and take all three points on the road.",
    body: "Astra United's senior side produced a composed, disciplined performance to take all three points, controlling long spells of the game and defending resolutely when it mattered most.\n\nThe result reflects the standards the club is building from the academy up — players who compete for every ball, support one another, and stay true to the way Astra wants to play.\n\nFull match reports, line-ups, and highlights are published here through the season. Check back each week for the latest from across our senior and academy teams.",
    image: "/images/academy/astra-academy-dribble-duel-1280.webp"
  },
  {
    slug: "expanding-programs-melbourne-suburbs",
    title: "Astra Expands Programs into New Melbourne Suburbs",
    category: "Community Update",
    dateLabel: "7 June 2026",
    excerpt:
      "Professional coaching and a clear development pathway are coming closer to more local families for the 2026 season.",
    body: "Astra United is expanding its football programs into new neighbourhoods across Melbourne's north for the 2026 season, bringing professional coaching and a clear development pathway closer to more local families.\n\nThe expansion adds new training groups and trial opportunities for players from our youngest Future Stars through to the competitive youth tiers — all built on the same coaching standards and community-first values that define the club.\n\nRegistration for the 2026 season is open now. Visit the Join the Club page to find a program near you.",
    image: "/images/community/astra-community-team-photo-1280.webp"
  },
  {
    slug: "winter-development-camp-recap",
    title: "Academy Players Shine at Winter Development Camp",
    category: "Academy",
    dateLabel: "30 May 2026",
    excerpt:
      "A productive block of winter training focused on technical detail, game understanding, and elite habits.",
    body: "Our academy players capped a productive block of winter training with a development camp focused on technical detail, game understanding, and the habits that define elite young footballers.\n\nUnder our accredited coaching staff, sessions blended high-intensity skill work with small-sided games — the environment where players learn fastest and enjoy their football most.\n\nMore academy updates, photos, and player spotlights are shared here throughout the year.",
    image: "/images/academy/astra-academy-coaching-huddle-1280.webp"
  }
];

/** Listing cards: live admin posts if any, otherwise the seed sample posts. */
export function listSummaries(liveEvents: EventPost[]): PostSummary[] {
  if (liveEvents.length > 0) {
    return liveEvents.map((e) => ({
      id: e.id,
      href: `/news-media/${e.id}`,
      image: e.image,
      kicker: e.category || "Club News",
      title: e.headline,
      body: e.body
    }));
  }
  return samplePosts.map((p) => ({
    id: p.slug,
    href: `/news-media/${p.slug}`,
    image: p.image,
    kicker: p.category,
    title: p.title,
    body: p.excerpt
  }));
}

/** Resolve a single article by event id first, then by sample-post slug. */
export function findArticle(id: string, allEvents: EventPost[]): Article | null {
  const event = allEvents.find((e) => e.id === id);
  if (event) {
    return {
      id: event.id,
      title: event.headline,
      category: event.category || "Club News",
      image: event.image,
      body: event.body,
      ctaLabel: event.ctaLabel,
      ctaHref: event.ctaHref
    };
  }
  const sample = samplePosts.find((p) => p.slug === id);
  if (sample) {
    return {
      id: sample.slug,
      title: sample.title,
      category: sample.category,
      dateLabel: sample.dateLabel,
      image: sample.image,
      body: sample.body
    };
  }
  return null;
}
