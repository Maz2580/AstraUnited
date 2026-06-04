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
    copy: "Weekly match summaries and team updates will give families and supporters a clear view of the season."
  },
  {
    kicker: "Events",
    title: "Presentation Night and Football Camps",
    copy: "The events calendar is prepared for awards nights, holiday camps, fundraisers, and community days."
  },
  {
    kicker: "Media",
    title: "Astra in Action",
    copy: "A future gallery can host match-day highlights, academy days, celebrations, and consent-approved media."
  }
];

export const upcomingMoments = [
  {
    title: "2026 registrations",
    meta: "January campaign",
    copy: "Registration and trials are priority moments in the annual campaign plan."
  },
  {
    title: "Winter camps",
    meta: "June campaign",
    copy: "Holiday camp announcements and family-focused training activity are built into the content rhythm."
  },
  {
    title: "Season awards",
    meta: "October campaign",
    copy: "The site is ready to support awards night announcements and club-wide season storytelling."
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
      "Astra United FC is a community-focused football club in Melbourne's north, built around technical excellence, sportsmanship, and a safe pathway for players of all ages.",
    sections: [
      {
        title: "History, mission, and honours",
        copy:
          "Founded with a vision to elevate local football, Astra has grown from a passionate football project into a structured club environment for families, players, coaches, and supporters.",
        bullets: [
          "Professional standards at grassroots level",
          "A mission to develop players and future community leaders",
          "Honours and club milestones ready for future trophy cabinet content"
        ]
      },
      {
        title: "Committee and staff",
        copy:
          "The club is powered by dedicated volunteers, qualified coaches, and welfare-focused leadership across football operations and match-day delivery.",
        bullets: [
          "Leadership team and committee contacts",
          "Football Australia-qualified lead coaches",
          "Working With Children and welfare responsibilities"
        ]
      },
      {
        title: "Governance and safeguarding",
        copy:
          "Astra operates with transparency, accountability, child safety, and alignment with Football Australia and venue requirements.",
        bullets: [
          "Club constitution and governance documents",
          "Safeguarding and welfare policies",
          "AGM minutes and member updates"
        ]
      },
      {
        title: "Facilities and fields",
        copy:
          "Training and match-day activity is based at Darebin International Sports Centre, with venue information, parking guidance, and field updates prepared for future expansion.",
        bullets: [
          "Darebin International Sports Centre",
          "Parking and match-day amenities",
          "Pitch status and location updates"
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
      "Astra's football structure supports boys, girls, youth players, U23s, and senior squads with a clear pathway from early development into competitive football.",
    sections: [
      {
        title: "Senior teams",
        copy:
          "The senior program represents the final stage of the Astra pathway, combining experienced players with emerging talent.",
        bullets: ["Men's First Team", "Women's First Team", "Under-23s development squad"]
      },
      {
        title: "Youth Academy",
        copy:
          "The Astra Academy is designed around long-term player development, technical confidence, and a healthy team-first culture.",
        bullets: [
          "Development over results",
          "Two structured training sessions per week",
          "Age-appropriate curriculum from U6 to U18"
        ]
      },
      {
        title: "Fixtures and results",
        copy:
          "The site is scaffolded for fixtures, standings, and match locations, with future integrations able to plug into the public experience.",
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
      "Whether a player is returning or joining for the first time, Astra is prepared for a clear registration, trial, and volunteer pathway.",
    sections: [
      {
        title: "Registration",
        copy:
          "The 2026 season runs from March to September, with pre-season activity beginning in February. Registration content is prepared for online forms, document upload, and payment instructions.",
        bullets: [
          "Academy Members U6-U12",
          "Youth Members U13-U18",
          "Senior members and pathway players"
        ]
      },
      {
        title: "Trials and scouting",
        copy:
          "Open trials and scouting assessments focus on technical ability, tactical awareness, physical literacy, and character.",
        bullets: [
          "Youth Academy trial pathway",
          "Senior and U23 assessment pathway",
          "Team-first attitude and work rate"
        ]
      },
      {
        title: "Volunteers",
        copy:
          "The club depends on team managers, coaches, match-day helpers, media volunteers, referees, and family support.",
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
      "Astra's content plan covers match reports, club announcements, player spotlights, photo galleries, events, camps, and community campaigns.",
    sections: [
      {
        title: "Latest news",
        copy:
          "The site is prepared for match reports, club announcements, kit updates, camp dates, registration deadlines, and player spotlights.",
        bullets: [
          "Match reports and results summaries",
          "Club announcements",
          "Player and coach spotlights"
        ]
      },
      {
        title: "Photo and video gallery",
        copy:
          "Media can showcase match-day highlights, academy training, celebrations, and community moments once consent-approved assets are ready.",
        bullets: [
          "Match-day action",
          "Academy days",
          "Trophy and celebration galleries"
        ]
      },
      {
        title: "Events calendar",
        copy:
          "The consultancy calendar highlights registrations, winter camps, finals coverage, awards night, women in football features, and seasonal community campaigns.",
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
      "Astra welcomes businesses and organisations who want visibility while investing in youth development, coaching, facilities, and community football.",
    sections: [
      {
        title: "Partnership opportunities",
        copy:
          "Partner placements can support senior and academy levels, player development programs, match-day facilities, and digital community reach.",
        bullets: [
          "Principal Club Partner",
          "Gold Partners",
          "Community Supporters"
        ]
      },
      {
        title: "Sponsorship packages",
        copy:
          "Astra can support tiered sponsorship across match kits, training wear, pitch-side visibility, player pathways, and match ball recognition.",
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
      "For joining, sponsorship, volunteering, media, safeguarding, or general questions, Astra is prepared for direct contact and a future enquiry form.",
    sections: [
      {
        title: "General enquiries",
        copy:
          "The contact experience is scaffolded for an enquiry form, response-time expectations, and subject routing.",
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
          "Player welfare contact pathways are planned as part of the club's child safety and governance obligations.",
        bullets: [
          "Dedicated welfare contact",
          "Privacy and child safety policies",
          "Respectful communication across channels"
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
