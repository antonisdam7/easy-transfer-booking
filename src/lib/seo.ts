// Every route's head, in one place.
//
// Two things read this file: the useSeo hook, which writes the tags once React is
// running, and the prerender step in vite.config.ts, which bakes the same tags into a
// real HTML file at build time. They have to agree -- a crawler that sees one title in
// the served HTML and another after the page boots is being told two stories -- so
// neither of them owns the text.
//
// Imports here stay relative. This module is pulled into the Vite config, which resolves
// its own imports before the "@/" alias exists.

import { faqs } from "./faqs";

export const SITE_URL = "https://habibitransferscrete.com";
// What every title ends with, and what a search result calls the business. This was
// the bare domain in lowercase, which matched nothing else: the header says "Habibi
// Come to Crete", the schema below says "Habibi Come to Crete Transfers", and a
// result reading "habibitransferscrete" looked like a machine had filled it in.
export const SITE_NAME = "Habibi Come to Crete";
export const BUSINESS_NAME = "Habibi Come to Crete Transfers";

// A share card sized for the platforms that crop it, not the logo. See public/og-image.jpg.
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>[];
  // Pages that exist for the customer mid-booking, not for search results.
  noindex?: boolean;
};

// Only claims the site already makes elsewhere. Nothing here is invented: the hours,
// the payment methods and the area come from the About and Contact pages.
const business = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS_NAME,
  url: `${SITE_URL}/`,
  telephone: "+30 697 626 3677",
  email: "habibitransferscrete@gmail.com",
  image: OG_IMAGE,
  address: {
    "@type": "PostalAddress",
    addressRegion: "Crete",
    addressCountry: "GR",
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Crete, Greece",
  },
  // Two bands, from the published fare table: a short airport run and a crossing of
  // the island. Not a claim, an arithmetic fact about the prices already on the site.
  priceRange: "€22–€484",
  currenciesAccepted: "EUR",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  paymentAccepted: "Cash, Credit Card",
  sameAs: ["https://www.facebook.com/profile.php?id=61575578152214"],
};

// One of these per landing page, naming the journey that page is actually about.
function service(name: string, serviceType: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "AdministrativeArea", name: "Crete, Greece" },
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const pageSeo: Record<string, PageSeo> = {
  "/": {
    title: "Crete Transfers & Airport Taxi",
    description:
      "Private Crete transfers from Heraklion and Chania airports to hotels, resorts and ports across the island. Fixed fares, local drivers, booking in minutes.",
    canonicalPath: "/",
    structuredData: [
      business,
      service("Crete Airport Transfer Service", "Private airport and hotel transfers"),
    ],
  },
  "/crete-transfers": {
    title: "Crete Transfers",
    description:
      "Crete transfers from Heraklion and Chania airports, ports and hotels. See the fixed fare to your destination from both airports before you book anything.",
    canonicalPath: "/crete-transfers",
    structuredData: [business, service("Crete Transfers", "Private transfers across Crete")],
  },
  "/heraklion-airport-transfer": {
    title: "Heraklion Airport Transfer",
    description:
      "Heraklion Airport transfer to hotels, villas and resorts across Crete. Fixed fares listed for every destination, flight monitoring, and local drivers.",
    canonicalPath: "/heraklion-airport-transfer",
    structuredData: [
      business,
      service("Heraklion Airport Transfer", "Private transfers from Heraklion Airport (HER)"),
    ],
  },
  "/chania-airport-transfer": {
    title: "Chania Airport Transfer",
    description:
      "Chania Airport transfer to Chania town, Platanias, Kissamos and west Crete. Every fare from CHQ published in full, with flight tracking and local drivers.",
    canonicalPath: "/chania-airport-transfer",
    structuredData: [
      business,
      service("Chania Airport Transfer", "Private transfers from Chania Airport (CHQ)"),
    ],
  },
  "/private-taxi-crete": {
    title: "Private Taxi Crete",
    description:
      "Private taxi in Crete for airport arrivals, port pickups and routes of your own. Priced per car, not per person, with every fare published before you book.",
    canonicalPath: "/private-taxi-crete",
    structuredData: [business, service("Private Taxi Crete", "Private taxi hire across Crete")],
  },
  "/about": {
    title: "About Us",
    description:
      "A private transfer service across Crete, with a modern Mercedes fleet, licensed English-speaking drivers, fixed prices, and cover twenty-four hours a day.",
    canonicalPath: "/about",
    structuredData: [business],
  },
  "/crete": {
    title: "Discover Crete",
    description:
      "The destinations we drive to across Crete, from Heraklion and Chania to Elounda, Rethymno, Matala and Plakias, and the mountain villages in between.",
    canonicalPath: "/crete",
    structuredData: [business],
  },
  "/contact": {
    title: "Contact Us",
    description:
      "Reach Habibi Come to Crete Transfers by phone, WhatsApp or email at any hour, to ask a question, change a booking, or arrange a transfer directly with us.",
    canonicalPath: "/contact",
    structuredData: [business],
  },
  "/faqs": {
    title: "Frequently Asked Questions",
    description:
      "How booking works, which vehicles we run, what happens when a flight is delayed, how cancellation works, how child seats are arranged, and how to pay.",
    canonicalPath: "/faqs",
    structuredData: [business, faqSchema],
  },
  // Reached only with a search already filled in. There is nothing here for someone
  // arriving cold from a search engine, and the query string would spawn endless
  // near-identical URLs in the index.
  "/booking-results": {
    title: "Your Transfer Options",
    description: "Choose your vehicle and complete your Crete transfer booking.",
    canonicalPath: "/booking-results",
    noindex: true,
  },
  "/admin": {
    title: "Bookings",
    description: "Operator view of incoming transfer bookings.",
    canonicalPath: "/admin",
    noindex: true,
  },
  "/admin/login": {
    title: "Sign in",
    description: "Operator sign in.",
    canonicalPath: "/admin/login",
    noindex: true,
  },
};

// Routes that get their own HTML file at build time, and that belong in the sitemap.
export const indexablePaths = Object.keys(pageSeo).filter((path) => !pageSeo[path].noindex);

// A two-step trail, home then here. Google reads it to draw the path under a result
// instead of the bare URL, and it is the one piece of schema every inner page can
// carry truthfully -- the site really is one level deep.
function breadcrumb(routePath: string) {
  const seo = pageSeo[routePath];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: seo.title,
        item: `${SITE_URL}${seo.canonicalPath}`,
      },
    ],
  };
}

// The whole JSON-LD block for a route. Both the prerender step and the useSeo hook go
// through here, so neither can end up shipping a different set from the other.
export function structuredDataFor(routePath: string): Record<string, unknown>[] {
  const seo = pageSeo[routePath];
  if (!seo?.structuredData) return [];

  // The homepage is the root of the trail, so a trail to it would be a single step
  // pointing at itself.
  if (routePath === "/") return seo.structuredData;

  return [...seo.structuredData, breadcrumb(routePath)];
}
