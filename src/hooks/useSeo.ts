import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_URL = "https://habibitransferscrete.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.jpeg`;

export function useSeo({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  structuredData,
}: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | habibitransferscrete`;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;

    document.title = fullTitle;

    const upsertMeta = (key: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property='${key}']` : `meta[name='${key}']`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", key);
        } else {
          el.setAttribute("name", key);
        }
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

    upsertMeta("description", description);
    upsertMeta("og:title", fullTitle, true);
    upsertMeta("og:description", description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:url", canonicalUrl, true);
    upsertMeta("og:image", ogImage, true);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", fullTitle);
    upsertMeta("twitter:description", description);
    upsertMeta("twitter:image", ogImage);
    upsertCanonical(canonicalUrl);

    const scriptId = "seo-structured-data";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, ogImage, structuredData]);
}

