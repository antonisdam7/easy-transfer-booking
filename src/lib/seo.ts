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
export const SITE_NAME = "habibitransferscrete";
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
      "Book private Crete transfers for Heraklion and Chania airports, ports, hotels, and resorts with professional local drivers.",
    canonicalPath: "/",
    structuredData: [
      business,
      service("Crete Airport Transfer Service", "Private airport and hotel transfers"),
    ],
  },
  "/crete-transfers": {
    title: "Crete Transfers",
    description:
      "Reliable Crete transfers from airports, ports, and hotels with fixed pricing, local drivers, and fast booking confirmation.",
    canonicalPath: "/crete-transfers",
    structuredData: [business, service("Crete Transfers", "Private transfers across Crete")],
  },
  "/heraklion-airport-transfer": {
    title: "Heraklion Airport Transfer",
    description:
      "Book Heraklion Airport transfer with local drivers for hotels, villas, ports, and all major destinations in Crete.",
    canonicalPath: "/heraklion-airport-transfer",
    structuredData: [
      business,
      service("Heraklion Airport Transfer", "Private transfers from Heraklion Airport (HER)"),
    ],
  },
  "/chania-airport-transfer": {
    title: "Chania Airport Transfer",
    description:
      "Private Chania Airport transfer service to Chania town, Platanias, resorts, and west Crete with reliable local drivers.",
    canonicalPath: "/chania-airport-transfer",
    structuredData: [
      business,
      service("Chania Airport Transfer", "Private transfers from Chania Airport (CHQ)"),
    ],
  },
  "/private-taxi-crete": {
    title: "Private Taxi Crete",
    description:
      "Private taxi in Crete for airport transfers, port pickups, and custom routes with comfortable vehicles and local drivers.",
    canonicalPath: "/private-taxi-crete",
    structuredData: [business, service("Private Taxi Crete", "Private taxi hire across Crete")],
  },
  "/about": {
    title: "About Us",
    description:
      "A private transfer service across Crete with a modern Mercedes fleet, licensed English-speaking drivers, fixed prices, and cover 24 hours a day.",
    canonicalPath: "/about",
    structuredData: [business],
  },
  "/crete": {
    title: "Discover Crete",
    description:
      "The destinations we drive to across Crete, from Heraklion and Chania to Elounda, Rethymno, Matala, and the villages between them.",
    canonicalPath: "/crete",
    structuredData: [business],
  },
  "/contact": {
    title: "Contact Us",
    description:
      "Reach Habibi Come to Crete Transfers by phone, WhatsApp, or email, any hour of the day, to ask a question or book a transfer directly.",
    canonicalPath: "/contact",
    structuredData: [business],
  },
  "/faqs": {
    title: "Frequently Asked Questions",
    description:
      "How booking works, which vehicles we run, what happens when a flight is delayed, how cancellation works, and how to pay your driver.",
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
