import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="container max-w-3xl rounded-lg border bg-card p-4 shadow-lg sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We would like to count visits, so we can see which pages people find useful.
            It uses Google Analytics cookies. Decline and the site works exactly the same
            — nothing is stored and nothing is sent.
          </p>
          {/* Decline sits first and reads as plainly as Accept. Consent has to be
              freely given to count for anything, and a refusal hidden behind a
              greyed-out link is not a refusal anyone chose. */}
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => answer("denied")}>
              Decline
            </Button>
            <Button size="sm" onClick={() => answer("granted")}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
