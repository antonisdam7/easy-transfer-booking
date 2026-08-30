// Google Analytics, and the consent it cannot legally run without.
//
// GA4 writes cookies. In the EU that needs the visitor's permission first, given
// freely and before anything is set -- so nothing here loads Google's script until
// somebody has actually said yes. A visitor who declines, or who never answers, is
// never tagged at all: there is no "essential analytics" exemption to lean on, and a
// banner that loads the tracker while it asks the question is worse than no banner,
// because it looks like consent was sought.
//
// The whole module is inert without VITE_GA_MEASUREMENT_ID. No banner, no script, no
// cookies -- which is also the honest state of a site that measures nothing, so the
// build can ship before the property exists and the site simply carries on as it was.

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// There is nothing to ask permission for when there is nothing to load.
export const analyticsConfigured = Boolean(MEASUREMENT_ID);

export type Consent = "granted" | "denied";

// Deliberately localStorage rather than a cookie. Storing the answer in a cookie
// would mean setting a cookie in order to record a refusal to be given cookies,
// which is a joke a regulator has heard before.
const CONSENT_KEY = "analytics-consent";

// Every read is wrapped. This runs during a build that prerenders 19 pages with no
// browser anywhere, and in private windows where touching storage throws rather than
// returning empty.
export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

export function storeConsent(consent: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // A visitor who blocks storage gets asked again next time, which is the right
    // way for this to fail: it under-tracks rather than assuming a yes.
  }
}

type GtagArguments = [string, ...unknown[]];

declare global {
  interface Window {
    dataLayer?: GtagArguments[];
    gtag?: (...args: GtagArguments) => void;
  }
}

let started = false;

// Injects Google's tag. Called only after a yes, and only once.
export function startAnalytics() {
  if (started || !analyticsConfigured || typeof window === "undefined") return;
  started = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: GtagArguments) {
    window.dataLayer!.push(args);
  };

  window.gtag("js", new Date());
  // send_page_view off: this is a single page application, so Google's own idea of a
  // page view fires once, on the first URL, and never again as somebody moves through
  // the site. trackPageView below does it per route instead.
  window.gtag("config", MEASUREMENT_ID!, { send_page_view: false });
}

function send(name: string, params: Record<string, unknown> = {}) {
  if (!started || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

export function trackPageView(path: string, title: string) {
  send("page_view", { page_path: path, page_title: title, page_location: window.location.href });
}

// The funnel, in Google's own vocabulary rather than names of our own.
//
// GA4 recognises these four and builds the purchase funnel and the revenue reports
// out of them without anything being configured in the dashboard. Invented names
// would need a technician to turn each one into a metric, and the point of measuring
// where people give up is that nobody has to.

export function trackSearch(pickup: string, dropoff: string, people: string) {
  send("search", { search_term: `${pickup} to ${dropoff}`, passengers: people });
}

export function trackResultsViewed(pickup: string, dropoff: string) {
  send("view_item_list", { item_list_name: `${pickup} to ${dropoff}` });
}

export function trackVehicleChosen(vehicle: string, price: number | null) {
  send("select_item", {
    currency: "EUR",
    value: price ?? 0,
    items: [{ item_id: vehicle, item_name: vehicle }],
  });
}

export function trackDetailsReached(vehicle: string, price: number | null) {
  send("begin_checkout", {
    currency: "EUR",
    value: price ?? 0,
    items: [{ item_id: vehicle, item_name: vehicle }],
  });
}

// The booking itself, with what it is worth. This is what turns the traffic numbers
// into a question worth asking -- which sources send people who actually book, rather
// than which sends the most people.
export function trackBooking(vehicle: string, price: number | null, roundtrip: boolean) {
  send("purchase", {
    // No order reference is read back from the insert -- visitors have no select
    // policy, deliberately -- so the browser makes one. It only has to be unique
    // enough for GA to refuse a duplicate on a double submit.
    transaction_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    currency: "EUR",
    value: price ?? 0,
    items: [
      {
        item_id: vehicle,
        item_name: vehicle,
        item_category: roundtrip ? "roundtrip" : "one way",
        price: price ?? 0,
        quantity: 1,
      },
    ],
  });
}
