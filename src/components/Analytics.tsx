import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  analyticsConfigured,
  readConsent,
  startAnalytics,
  storeConsent,
  trackPageView,
  type Consent,
} from "@/lib/analytics";

// The cookie banner, and the page views it unlocks.
//
// Both live here because they are the same decision seen twice: nothing is measured
// until somebody agrees to be measured, and the moment they do, the page they are
// already on should count.
//
// On the server, and on the browser's very first pass, this renders nothing at all.
// That is not shyness about the banner -- it is the only way it can exist on this
// site. Nineteen pages are rendered into real HTML files at build time and the
// browser hydrates that markup; anything present on one side and missing on the other
// is a mismatch, and React answers a mismatch by throwing the whole prerendered page
// away and rebuilding it. A banner that appeared during the first render would do
// that on every page, to every visitor, to ask a question about cookies.
//
// So: mounted stays false through the server render and through hydration, and only
// turns true in an effect, which runs after React and the markup have agreed.

export default function Analytics() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    setMounted(true);

    const stored = readConsent();
    setConsent(stored);
    if (stored === "granted") startAnalytics();
  }, []);

  // A page view per route, because Google's own only fires on the first URL and this
  // site never reloads after that -- somebody who lands on the homepage and reads
  // four route pages would otherwise be recorded as having read one.
  //
  // Deferred by a tick so the title is the one this page just set. useSeo writes it
  // from the page's own effect, and this component sits above the routes, so its
  // effect runs first: read synchronously, every page view would carry the title of
  // the page before it.
  useEffect(() => {
    if (consent !== "granted") return;

    const timer = window.setTimeout(
      () => trackPageView(location.pathname, document.title),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [consent, location.pathname]);

  const answer = (choice: Consent) => {
    storeConsent(choice);
    setConsent(choice);
    if (choice === "granted") startAnalytics();
  };

  // Nothing to ask when nothing would be loaded, and nothing to ask twice.
  if (!mounted || !analyticsConfigured || consent !== null) return null;

  return (
    // A card in the corner rather than a bar across the foot of the page. The bar
    // covered the booking form's submit button on a phone, which is a poor trade for
    // a question nobody came here to answer.
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-heading"
      className="fixed bottom-0 left-0 z-50 w-full max-w-sm p-3 sm:p-4 motion-safe:animate-fade-in-up"
    >
      <div className="space-y-3 rounded-xl border bg-card/95 p-5 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Cookie className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <h2 id="cookie-heading" className="font-display font-semibold text-primary">
            We use cookies
          </h2>
        </div>

        {/* Deliberately not "by continuing to browse you agree". Carrying on reading
            is not consent under the GDPR -- it has to be a positive act -- and the
            sentence would be false here anyway: nothing is loaded until the button
            below is pressed. */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          We would like to count visits, so we can see which pages people find useful.
          Nothing is loaded until you agree, and declining changes nothing about how
          the site works.
        </p>

        {/* The link matters as much as the buttons. Consent counts for nothing unless
            it is informed, and "informed" means the detail was reachable before the
            choice was made, not filed somewhere afterwards. */}
        <Link
          to="/privacy"
          className="inline-block text-sm text-primary underline underline-offset-2 hover:opacity-80"
        >
          Learn more
        </Link>

        {/* Decline sits first and looks like a button, not a grey afterthought.
            Consent has to be freely given to count for anything, and a refusal made
            harder to find than the agreement is not a refusal anyone chose. */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => answer("denied")}>
            Decline
          </Button>
          <Button className="flex-1" onClick={() => answer("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
