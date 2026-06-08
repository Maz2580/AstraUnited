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
};

export type Highlight = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

export type MarketingPage = {
  slug: string;
  navLabel: string;
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{
    title: string;
    copy: string;
    bullets?: string[];
  }>;
};

export const navItems: NavItem[] = [
  { label: "The Club", href: "/the-club" },
  { label: "Teams", href: "/teams" },
  { label: "Join Us", href: "/join-us" },
  { label: "News", href: "/news-media" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" }
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
    sections: [
      {
        title: "History, mission, and honours",
        copy:
          "Founded with a vision to elevate local football, Astra grew from a small group of passionate players and coaches into a structured, multi-team club. Our mission is a safe, inclusive, professional environment where players of all ages develop their skills, build friendships, and embrace the competitive spirit of the game - we don't just coach players, we mentor the next generation of community leaders.",
        bullets: [
          "Professional standards at grassroots level",
          "A mission to develop players and community leaders",
          "Club honours and trophy cabinet - to be confirmed"
        ]
      },
      {
        title: "Committee and staff",
        copy:
          "Astra is powered by dedicated volunteers and qualified professionals. All lead coaches hold recognised Football Australia coaching qualifications and current Working With Children Checks.",
        bullets: [
          "Committee and leadership - contacts to be confirmed",
          "Football Australia-qualified lead coaches",
          "Dedicated Welfare Officer for player wellbeing"
        ]
      },
      {
        title: "Governance and safeguarding",
        copy:
          "Astra operates with transparency and accountability, aligned with Football Australia and local council regulations. The safety of our youth players is our absolute priority.",
        bullets: [
          "Club constitution and governance",
          "Safeguarding and welfare policy",
          "AGM minutes and member updates"
        ]
      },
      {
        title: "Facilities and fields",
        copy:
          "We train and play at Darebin International Sports Centre, with well-maintained pitches, on-site parking, and match-day amenities.",
        bullets: [
          "Darebin International Sports Centre, Thornbury",
          "On-site parking and match-day stewards",
          "Pitch-status updates on match mornings"
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
    sections: [
      {
        title: "Senior teams",
        copy:
          "Our senior program shows the club's philosophy at a competitive level: a Men's First Team in the Victorian league system, a growing Women's First Team, and an Under-23s squad bridging youth and senior football.",
        bullets: ["Men's First Team", "Women's First Team", "Under-23s development squad"]
      },
      {
        title: "Youth Academy",
        copy:
          "Based at Darebin, our Academy gives boys and girls from Under 6s to Under 18s a safe, structured environment built on development over results - technical excellence, game intelligence, and social growth.",
        bullets: [
          "Development over results",
          "Two structured training sessions per week",
          "Age-appropriate curriculum from U6 to U18"
        ]
      },
      {
        title: "Fixtures and results",
        copy:
          "Upcoming fixtures, results, and league standings live here - check match locations and kit colours before kick-off. Locations can change with the weather, so check the home-page pitch status on match mornings.",
        bullets: [
          "Upcoming fixtures and kick-off details",
          "Latest results and match summaries",
          "League table and venue links"
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
    sections: [
      {
        title: "Registration",
        copy:
          "Complete our secure online registration; new players upload a proof-of-age document for league registration. Pay in full or by monthly direct debit. Fees cover league affiliations, insurance, pitch hire, Football Australia-aligned coaching, and kit maintenance.",
        bullets: [
          "Academy members (U6-U12) - fees on request",
          "Youth members (U13-U18) - fees on request",
          "Senior members - fees on request"
        ]
      },
      {
        title: "Trials and scouting",
        copy:
          "We hold open trials annually and scout throughout the season, assessing four pillars: technical ability, tactical awareness, physical literacy, and character.",
        bullets: [
          "Youth Academy trial pathway",
          "Senior and U23 assessment pathway",
          "Team-first attitude and work rate"
        ]
      },
      {
        title: "Volunteers",
        copy:
          "Astra is community-run. We rely on team managers and coaches (qualifications supported), match-day marshals, the BBQ crew, referees, and media volunteers. All volunteers working with children must meet Working With Children requirements.",
        bullets: [
          "Team managers and coaches",
          "Match-day marshals and referees",
          "Media and community volunteers"
        ]
      }
    ]
  },
  {
    slug: "news-media",
    navLabel: "News",
    eyebrow: "News and Media",
    title: "From the training ground to the touchline.",
    intro:
      "From the training ground to the touchline: match reports, club announcements, player spotlights, photos, and events from across the Astra community.",
    sections: [
      {
        title: "Latest news",
        copy:
          "Weekly match reports for our senior and academy teams, plus announcements on kit launches, camp dates, and registration deadlines.",
        bullets: [
          "Match reports and results summaries",
          "Club announcements",
          "Player and coach spotlights"
        ]
      },
      {
        title: "Photo and video gallery",
        copy:
          "Explore our teams in action - match-day highlights, academy days, and celebrations. All media is published in line with our consent and child-safety policies.",
        bullets: [
          "Match-day action",
          "Academy days",
          "Trophy and celebration galleries"
        ]
      },
      {
        title: "Events calendar",
        copy:
          "Training, socials, and fundraisers run year-round - presentation night, the summer football gala, charity fundraisers, and school-holiday camps.",
        bullets: [
          "Club socials and fundraisers",
          "Holiday football camps",
          "Presentation and awards nights"
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
    sections: [
      {
        title: "Partnership opportunities",
        copy:
          "When you support Astra you invest in the health, development, and future of young people across Melbourne's north - more than a logo on a shirt.",
        bullets: [
          "Principal Club Partner",
          "Gold Partners",
          "Community Supporters"
        ]
      },
      {
        title: "Sponsorship packages",
        copy:
          "Tiered packages to suit any business, with bespoke options available - high visibility across match days and digital platforms.",
        bullets: [
          "Main Kit Sponsor",
          "Training Wear Sponsor",
          "Pitch-side Partner",
          "Player Pathway Sponsor",
          "Match Ball Sponsor"
        ]
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
    sections: [
      {
        title: "General enquiries",
        copy:
          "Reach us for general questions, player registration and trials, sponsorship, media, or volunteering.",
        bullets: [
          "General enquiry",
          "Player registration and trials",
          "Sponsorship opportunities",
          "Media and volunteering"
        ]
      },
      {
        title: "Where to find us",
        copy:
          "Astra trains and plays at Darebin International Sports Centre in Thornbury.",
        bullets: [
          "Darebin International Sports Centre",
          "281 Darebin Road, Thornbury VIC 3071",
          "Melbourne's northern community"
        ]
      },
      {
        title: "Safeguarding and welfare",
        copy:
          "For player-welfare concerns, contact our Welfare Officer directly. All information is handled per our privacy and child-safety policies.",
        bullets: [
          "Dedicated welfare contact",
          "Privacy and child-safety policies",
          "Respectful communication across all channels"
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

export function getPageBySlug(slug: string) {
  return pages.find((page) => page.slug === slug);
}
