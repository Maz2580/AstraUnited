# Astra United FC Website

Phase 1 greenfield build for the Astra United FC public marketing site.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Framer Motion plus Lenis for the scroll-linked football flow
- Supabase scaffold for auth, events, and future shop data

## Run Locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` before enabling Supabase-backed admin auth.

## Delivery Notes

- `HeroIntro` is the swappable intro slot. It currently renders the polished placeholder and can later accept video, Lottie, Rive, or frame sequence assets.
- `ScrollBallFlow` owns the Part B scroll path, starting at the same handoff position as the hero placeholder.
- The shop is intentionally schema-only for now. Stripe and product UI are left for the future phase.
- Supabase SQL lives in `supabase/schema.sql`.
