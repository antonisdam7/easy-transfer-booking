import { useEffect } from "react";
import { OG_IMAGE, SITE_NAME, SITE_URL, pageSeo, structuredDataFor } from "@/lib/seo";

// Writes the head for whichever page is showing. The same tags are already baked into
// the HTML by the prerender step, so this is what keeps them right as the customer
// moves between routes without the page ever reloading.
//
// Takes a path rather than an object so there is exactly one place a title is written.

export function useSeo(path: string) {
  const seo = pageSeo[path];

  useEffect(() => {
    if (!seo) {
      if (import.meta.env.DEV) {
        console.warn(`useSeo: no entry in pageSeo for "${path}"`);
      }
      return;
    }

    const fullTitle = `${seo.title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;
    const ogImage = seo.ogImage ?? OG_IMAGE;

    document.title = fullTitle;

    const upsertMeta = (key: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property='${key}']` : `meta[name='${key}']`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(isProperty ? "property" : "name", key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const upsertCanonical = (href: string) => {
      let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = href;
    };

    upsertMeta("description", seo.description);
    upsertMeta("og:site_name", SITE_NAME, true);
    upsertMeta("og:locale", "en_GB", true);
    upsertMeta("og:title", fullTitle, true);
    upsertMeta("og:description", seo.description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:url", canonicalUrl, true);
    upsertMeta("og:image", ogImage, true);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", fullTitle);
    upsertMeta("twitter:description", seo.description);
    upsertMeta("twitter:image", ogImage);
    upsertCanonical(canonicalUrl);

    // Removed rather than set to "index" on a public page: a stale noindex left behind
    // after a client-side navigation would quietly drop a page that should rank.
    if (seo.noindex) {
      upsertMeta("robots", "noindex, nofollow");
    } else {
      document.querySelector("meta[name='robots']")?.remove();
    }

    const scriptId = "seo-structured-data";
    document.getElementById(scriptId)?.remove();

    const structuredData = structuredDataFor(path);

    if (structuredData.length) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [seo, path]);
}
