import {
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export type Highlight = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

export type Block =
  | { type: "prose"; title: string; copy: string; bullets?: string[] }
  | { type: "cards"; title?: string; intro?: string; items: { title: string; copy: string }[] }
  | { type: "table"; title?: string; intro?: string; columns: string[]; rows: string[][] }
  | { type: "steps"; title?: string; items: { title: string; copy: string }[] }
  | { type: "pillars"; title?: string; items: { label: string; copy: string }[] }
  | {
      type: "contact";
      email: string;
      phone?: string;
      welfare?: string;
      socials: { label: string; handle: string; href: string }[];
      address: string;
      mapEmbed: string;
    }
  | { type: "form"; title: string; intro?: string; subjects?: string[]; submitLabel: string; mailto: string };

export type PageHero = { src: string; alt: string; blurDataURL: string };

export type MarketingPage = {
  slug: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  hero: PageHero;
  blocks: Block[];
};

export const clubContact = {
  email: "info@astraunitedfootballclub.com",
  ground: "Darebin International Sports Centre",
  address: "281 Darebin Road, Thornbury VIC 3071"
};

export const socialLinks = [
  { label: "Instagram", handle: "@AstraFC_Official", href: "https://instagram.com/AstraFC_Official" },
  { label: "Facebook", handle: "/AstraFootballClub", href: "https://facebook.com/AstraFootballClub" },
  { label: "X (Twitter)", handle: "@Astra_FC", href: "https://x.com/Astra_FC" }
];

export const mapEmbedSrc =
  "https://www.google.com/maps?q=Darebin%20International%20Sports%20Centre%2C%20281%20Darebin%20Road%2C%20Thornbury%20VIC%203071&output=embed";

export const navItems: NavItem[] = [
  {
    label: "About The Club",
    href: "/the-club",
    children: [
      { label: "Leadership team", href: "/the-club" },
      { label: "Programs", href: "/teams" },
      { label: "News and media", href: "/news-media" }
    ]
  },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
  { label: "Shop", href: "/shop" }
];

export const homeHighlights: Highlight[] = [
  {
    title: "Qualified coaching",
    copy: "Football Australia-aligned coaching for academy, youth, and senior pathways.",
    icon: BadgeCheck
  },
  {
    title: "Safe development",
    copy: "A structured and inclusive environment where players can grow at their own pace.",
    icon: ShieldCheck
  },
  {
    title: "Clear pathway",
    copy: "From Mini-Kickers through youth development and into competitive senior football.",
    icon: Trophy
  },
  {
    title: "Community first",
    copy: "A multicultural club built around families, volunteers, partners, and local football.",
    icon: HeartHandshake
  }
];

export const academyPathway = [
  {
    age: "U6-U8",
    title: "Mini-Kickers",
    copy: "Fun-based football foundations, confidence on the ball, and first friendships in the game."
  },
  {
    age: "U9-U12",
    title: "Junior Academy",
    copy: "Small-sided training, technical repetition, and age-appropriate tactical awareness."
  },
  {
    age: "U13-U18",
    title: "Youth Development",
    copy: "A stronger bridge to 11-a-side football, game intelligence, and senior progression."
  }
];

export const newsPreview = [
  {
    kicker: "Match reports",
    title: "Senior Team Secure Crucial Three Points",
    copy: "Weekly summaries of how our senior and academy teams perform across the competition."
  },
  {
    kicker: "Events",
    title: "Presentation Night & Holiday Camps",
    copy: "Awards nights, school-holiday football camps, fundraisers, and community gala days."
  },
  {
    kicker: "Media",
    title: "Astra in Action",
    copy: "Match-day highlights, academy days, and celebrations from across the Astra family."
  }
];

export const upcomingMoments = [
  {
    title: "2026 registrations",
    meta: "Open now",
    copy: "Registration and trials are open for the 2026 season - secure your place at Astra."
  },
  {
    title: "Winter school-holiday camps",
    meta: "June-July",
    copy: "Professional coaching across the school holidays, with limited spots each intake."
  },
  {
    title: "Season awards night",
    meta: "October",
    copy: "Celebrating the season's milestones with players, coaches, and families."
  }
];

export const quickFacts = [
  { label: "Home ground", value: "Darebin International Sports Centre" },
  { label: "Location", value: "281 Darebin Road, Thornbury VIC 3071" },
  { label: "Season", value: "March to September, with pre-season in February" },
  { label: "Pathway", value: "Academy, youth, U23, women's, and senior football" }
];

export const pages: MarketingPage[] = [
  {
    slug: "the-club",
    navLabel: "The Club",
    eyebrow: "Our Story",
    title: "Football for all, played the Astra way.",
    intro:
      "Astra United FC is a community-focused football club in Melbourne's north, known for technical excellence, sportsmanship, and the Astra Way: football for all, played the right way.",
    hero: {
      src: "/images/community/astra-community-squad-portrait-1920.webp",
      alt: "Astra United FC youth team and coaching staff together on the grass at Darebin International Sports Centre",
      blurDataURL:
        "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAsABABoJZgAAuXOXCXDyAAA/tc/3Z/dDhnMvQ0+6YsPJeM0qInnDy/v+MSoBiaFpczmNLw+iIPkoreRBW0fZLffCwo/VV78AA=="
    },
    blocks: [
      {
        type: "prose",
        title: "Our story & mission",
        copy:
          "Founded with a vision to elevate local football, Astra grew from a small group of passionate players and coaches into a structured, multi-team club. Our mission is a safe, inclusive, professional environment where players of all ages develop their skills, build friendships, and embrace the competitive spirit of the game - we don't just coach players, we mentor the next generation of community leaders.",
        bullets: [
          "Professional standards at grassroots level",
          "A mission to develop players and community leaders",
          "Proudly serving families across Melbourne's north"
        ]
      },
      {
        type: "prose",
        title: "The trophy cabinet",
        copy:
          "Astra's honours and club awards will be celebrated here as the club's competitive record grows.",
        bullets: [
          "League and cup honours - to be confirmed",
          "Runners-up and finals appearances - to be confirmed",
          "Club of the Year recognition - to be confirmed"
        ]
      },
      {
        type: "cards",
        title: "Committee & staff",
        intro:
          "Astra is powered by dedicated volunteers and qualified professionals. All lead coaches hold recognised Football Australia coaching qualifications and current Working With Children Checks.",
        items: [
          { title: "Club Chairperson", copy: "Club leadership and direction - name to be confirmed." },
          { title: "Club Secretary", copy: "Administration and governance - name to be confirmed." },
          { title: "Treasurer", copy: "Club finances and membership - name to be confirmed." },
          { title: "Head of Academy", copy: "Youth development and coaching - name to be confirmed." },
          { title: "Senior First Team Manager", copy: "Senior program - name to be confirmed." },
          { title: "Welfare Officer", copy: "Your first point of contact for player wellbeing - name to be confirmed." }
        ]
      },
      {
        type: "prose",
        title: "Governance & safeguarding",
        copy:
          "Astra operates with transparency and accountability, aligned with Football Australia and local council regulations. The safety of our youth players is our absolute priority.",
        bullets: [
          "Club constitution and operating rules",
          "Safeguarding & welfare policy (Football Australia aligned)",
          "AGM minutes and member updates"
        ]
      },
      {
        type: "prose",
        title: "Facilities & match-day",
        copy:
          "We train and play at Darebin International Sports Centre (281 Darebin Road, Thornbury VIC 3071), with well-maintained pitches, on-site parking, and match-day amenities. Please park within designated bays and follow our match-day stewards to respect local residents.",
        bullets: [
          "Darebin International Sports Centre, Thornbury",
          "Ample on-site parking; match-day stewards",
          "Toilets and changing facilities during scheduled windows"
        ]
      }
    ]
  },
  {
    slug: "teams",
    navLabel: "Teams",
    eyebrow: "Pathways",
    title: "From Mini-Kickers to senior football.",
    intro:
      "Astra's pathway supports boys, girls, youth players, U23s, and senior squads - a clear route from first touch to first team.",
    hero: {
      src: "/images/academy/astra-academy-youth-training-1920.webp",
      alt: "Astra United juniors playing a small-sided training match between mini goals on the Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAQCdASoQAAsABABoJagAAubJvYSYAP6Rv3r8r1oqJkbuqTQQUc8+QzWTqElaiZDoOOSvLLtlu4BZ8VzR3vVc7r98ALmAQAA="
    },
    blocks: [
      {
        type: "cards",
        title: "Senior teams",
        intro:
          "Our senior program shows the club's philosophy at a competitive level - and many senior players have progressed through our own Youth Academy.",
        items: [
          { title: "Men's First Team", copy: "Competing in the Victorian league system - a blend of experienced heads and emerging talent." },
          { title: "Women's First Team", copy: "A core part of our identity - growing, competitive, and inspiring the next generation." },
          { title: "Under-23s", copy: "The bridge between youth and senior football, refining technical and tactical discipline." }
        ]
      },
      {
        type: "cards",
        title: "Youth Academy",
        intro:
          "Based at Darebin, the Academy gives boys and girls from U6 to U18 a safe, structured environment built on development over results - technical excellence, game intelligence, and social growth.",
        items: [
          { title: "Mini-Kickers (U6-U8)", copy: "Fun-based introduction to the basics of football." },
          { title: "Junior Academy (U9-U12)", copy: "Small-sided games focused on technical foundation." },
          { title: "Youth Development (U13-U18)", copy: "Transition to 11-a-side football and tactical awareness." }
        ]
      },
      {
        type: "prose",
        title: "Fixtures & results",
        copy:
          "Upcoming fixtures, latest results, and league standings will live here - check match locations and kit colours before kick-off. Locations can change with the weather, so check the home-page pitch status on match mornings.",
        bullets: [
          "Upcoming fixtures and kick-off details - to be confirmed",
          "Latest results and match summaries - to be confirmed",
          "League table and venue links - to be confirmed"
        ]
      }
    ]
  },
  {
    slug: "join-us",
    navLabel: "Join Us",
    eyebrow: "Registration",
    title: "Join the Astra family.",
    intro:
      "Joining Astra is straightforward, whether you're returning or playing with us for the first time. The 2026 season runs March to September, with pre-season from February.",
    hero: {
      src: "/images/academy/astra-academy-training-wide-1920.webp",
      alt: "Astra United youth academy players in training bibs during a drill session at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAsAA4BaJbAAAxZbZ/GZAAD+1z/ZYKqmtnVc6okA+qCnDfoYAtrg2zI4XIaE2KYUl2ZAO/KqM+alyLiJIxqwefcpOOsovAA="
    },
    blocks: [
      {
        type: "table",
        title: "Membership fees (2026 season)",
        intro:
          "We strive to keep football affordable while maintaining high standards of coaching and facilities. Fees cover league affiliations, insurance, pitch hire, Football Australia-aligned coaching, and kit maintenance.",
        columns: ["Membership", "Ages", "Season fee"],
        rows: [
          ["Academy members", "U6-U12", "To be confirmed"],
          ["Youth members", "U13-U18", "To be confirmed"],
          ["Senior members", "Open age", "To be confirmed"]
        ]
      },
      {
        type: "steps",
        title: "How to register",
        items: [
          { title: "Complete the online form", copy: "Fill in our secure digital registration form for the 2026 season." },
          { title: "Upload documentation", copy: "New players upload a proof-of-age document (birth certificate or passport) for league registration." },
          { title: "Make payment", copy: "Pay in full or via monthly direct-debit instalments." }
        ]
      },
      {
        type: "pillars",
        title: "What we look for at trials",
        items: [
          { label: "Technical", copy: "Ball control and passing range." },
          { label: "Tactical", copy: "Understanding of the game and positioning." },
          { label: "Physical", copy: "Speed, agility, and balance." },
          { label: "Character", copy: "Work rate, respect, and a team-first attitude." }
        ]
      },
      {
        type: "cards",
        title: "Volunteers - our off-pitch heroes",
        intro:
          "Astra is community-run. All volunteers working with children must meet Working With Children requirements.",
        items: [
          { title: "Team managers & coaches", copy: "Lead a squad and develop young talent (qualifications supported by the club)." },
          { title: "Match-day marshals", copy: "Help with parking and pitch-side setup for a safe environment." },
          { title: "The BBQ crew", copy: "Keep players and fans fed during home tournaments and gala days." },
          { title: "Referees", copy: "Qualified officials (or those wishing to train) for our junior fixtures." },
          { title: "Media volunteers", copy: "Capture photos and videos for our social channels." }
        ]
      },
      {
        type: "form",
        title: "Register your interest",
        intro: "Send us your details and our registrar will be in touch about registration and trials.",
        subjects: ["Player registration", "Open trials", "Volunteering"],
        submitLabel: "Send registration enquiry",
        mailto: "info@astraunitedfootballclub.com"
      }
    ]
  },
  {
    slug: "news-media",
    navLabel: "News",
    eyebrow: "News & Media",
    title: "From the training ground to the touchline.",
    intro:
      "Match reports, club announcements, player spotlights, photos, and events from across the Astra community.",
    hero: {
      src: "/images/community/astra-community-team-photo-1920.webp",
      alt: "Astra United FC youth squad and coaching staff posing for a team photo at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJaAC7AEO51NfsyAA/uhR8gOKYM+H/sHOAha6twOxn++SjZ011xmUaPcrFeIDsIUFYFIA3e9Pz9z6rxA4narSxexzNwWSAAA="
    },
    blocks: [
      {
        type: "cards",
        title: "Latest news",
        intro: "Your official source for club updates, match reports, and community news.",
        items: [
          { title: "Match reports", copy: "Weekly breakdowns of our senior and academy performances." },
          { title: "Club announcements", copy: "Kit launches, holiday-camp dates, and registration deadlines." },
          { title: "Player spotlights", copy: "Celebrating individual achievements and milestones in the Astra family." }
        ]
      },
      {
        type: "cards",
        title: "Photo & video gallery",
        intro: "Explore our teams in action throughout the season. A full gallery is coming soon.",
        items: [
          { title: "Match-day highlights", copy: "High-energy shots from our recent league fixtures." },
          { title: "Academy days", copy: "The fun and focus of our youth development sessions." },
          { title: "Celebrations", copy: "Trophies, team huddles, and post-match smiles." }
        ]
      },
      {
        type: "cards",
        title: "Events calendar",
        intro: "Our club is active all year round.",
        items: [
          { title: "Annual presentation night", copy: "Celebrating the season's successes with players and families." },
          { title: "Summer football gala", copy: "Our flagship community tournament for all age groups." },
          { title: "Charity fundraisers", copy: "Quiz nights, sponsored walks, and community support events." },
          { title: "School-holiday camps", copy: "Professional coaching to keep kids active during school breaks." }
        ]
      }
    ]
  },
  {
    slug: "sponsors",
    navLabel: "Sponsors",
    eyebrow: "Partners",
    title: "Support grassroots football in Melbourne's north.",
    intro:
      "Astra welcomes businesses who want visibility while investing in youth development, coaching, facilities, and community football in Melbourne's north.",
    hero: {
      src: "/images/kit/astra-kit-ball-1920.webp",
      alt: "Astra United Academy jersey beside the official match ball at the Darebin ground",
      blurDataURL:
        "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqk2ppaQiMAgBMB2JYgCdOUAAhXd8KMmZvxcAANc0QbnWA1e8eb71ZbYLPRtgKeFJOG3r962snakr3n7F2TwlfVFXyug2uWIbf+6UsjPW0qj8Ves/Qn88QAA="
    },
    blocks: [
      {
        type: "prose",
        title: "More than a logo on a shirt",
        copy:
          "At Astra, football is the heartbeat of the community. Maintaining high-quality pitches, providing Football Australia-aligned coaching, and keeping membership affordable is only possible through our partners. When you support Astra you invest in the health, development, and future of young people across Melbourne's north."
      },
      {
        type: "cards",
        title: "Partnership tiers",
        items: [
          { title: "Principal Club Partner", copy: "Our lead sponsor, supporting the club across all senior and academy levels." },
          { title: "Gold Partners", copy: "Key supporters of our match-day kits and facility maintenance." },
          { title: "Community Supporters", copy: "Local businesses helping us grow our grassroots programmes." }
        ]
      },
      {
        type: "table",
        title: "Sponsorship packages",
        intro: "Tiered packages to suit any business, with bespoke options available. All placements are subject to venue and council guidelines.",
        columns: ["Package", "What's included"],
        rows: [
          ["Main Kit Sponsor", "Front-of-shirt branding on match-day kits, featured website placement, social spotlight."],
          ["Training Wear Sponsor", "Logo on all player training gear and tracksuits."],
          ["Pitch-side Partner", "High-visibility perimeter signage at home fixtures (subject to approval)."],
          ["Player Pathway Sponsor", "Directly fund coaching certifications and equipment for the Youth Academy."],
          ["Match Ball Sponsor", "Recognition on our Match Day graphics for every home game."]
        ]
      },
      {
        type: "form",
        title: "Enquire about sponsorship",
        intro: "Tell us about your business and we'll send the 2026 sponsorship prospectus and tailored options.",
        subjects: ["Sponsorship enquiry"],
        submitLabel: "Enquire about sponsorship",
        mailto: "info@astraunitedfootballclub.com"
      }
    ]
  },
  {
    slug: "contact",
    navLabel: "Contact",
    eyebrow: "Contact",
    title: "Get in touch with Astra United FC.",
    intro:
      "Questions about joining, sponsorship, volunteering, media, or safeguarding? We'd love to hear from you and aim to respond within 48 business hours.",
    hero: {
      src: "/images/academy/astra-academy-coaching-huddle-1920.webp",
      alt: "Astra United coach gathered with young academy players for a huddle on the Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoQAAsABABoJZAAAuTwLVg8MAD+2+r5XKqoDqH7LCRtylnH9Qt9/v/Is3f8I/MoV315TuwN/+kHc+SiN5W9akQA"
    },
    blocks: [
      {
        type: "form",
        title: "Send us a message",
        intro: "We aim to respond to all enquiries within 48 business hours.",
        subjects: ["General enquiry", "Player registration & trials", "Sponsorship opportunities", "Media & press", "Volunteering"],
        submitLabel: "Send message",
        mailto: "info@astraunitedfootballclub.com"
      },
      {
        type: "contact",
        email: "info@astraunitedfootballclub.com",
        phone: "To be confirmed",
        welfare: "Welfare Officer contact - to be confirmed",
        socials: socialLinks,
        address: "Darebin International Sports Centre, 281 Darebin Road, Thornbury VIC 3071",
        mapEmbed: mapEmbedSrc
      },
      {
        type: "prose",
        title: "Before you get in touch",
        copy: "Your answer might be a click away.",
        bullets: [
          "Where do we train? Darebin International Sports Centre, Thornbury",
          "How much are membership fees? See the Join Us page",
          "Are the pitches open today? Check the pitch status on our home page"
        ]
      }
    ]
  }
];

export const adminEventsStub = [
  {
    title: "2026 Registrations Open",
    date: "January",
    location: "Online",
    published: true
  },
  {
    title: "Winter School Holiday Camps",
    date: "June-July",
    location: "Darebin International Sports Centre",
    published: false
  },
  {
    title: "Season Awards Night",
    date: "October",
    location: "To be confirmed",
    published: false
  }
];

export const contactMethods = [
  {
    icon: MapPin,
    label: "Home ground",
    value: "Darebin International Sports Centre, Thornbury"
  },
  {
    icon: CalendarDays,
    label: "Response time",
    value: "Most enquiries answered within 48 business hours"
  },
  {
    icon: Users,
    label: "Programs",
    value: "Academy, youth, U23, women's, senior, volunteers"
  }
];

export function getPageBySlug(slug: string) {
  return pages.find((page) => page.slug === slug);
}
