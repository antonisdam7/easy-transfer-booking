import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { OG_IMAGE, SITE_NAME, SITE_URL, pageSeo, indexablePaths } from "./src/lib/seo";

// The site is one HTML file that React fills in. Google runs JavaScript and copes, but
// Facebook, WhatsApp, LinkedIn and the rest read the HTML as served and stop -- so every
// link anyone shared came back with the homepage title on it, whatever page it pointed
// at. This writes a real file per route with that route's head already in it.
//
// Only the head is baked. The body still arrives from React, which is fine for search
// engines that render, and is what the scrapers never look at anyway.

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headFor(routePath: string) {
  const seo = pageSeo[routePath];
  const fullTitle = `${seo.title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;
  const ogImage = seo.ogImage ?? OG_IMAGE;

  const meta = (attr: "name" | "property", key: string, value: string) =>
    `    <meta ${attr}="${key}" content="${escapeHtml(value)}" />`;

  const tags = [
    `    <title>${escapeHtml(fullTitle)}</title>`,
    meta("name", "description", seo.description),
    `    <link rel="canonical" href="${canonicalUrl}" />`,
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", "en_GB"),
    meta("property", "og:type", "website"),
    meta("property", "og:title", fullTitle),
    meta("property", "og:description", seo.description),
    meta("property", "og:url", canonicalUrl),
    meta("property", "og:image", ogImage),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", fullTitle),
    meta("name", "twitter:description", seo.description),
    meta("name", "twitter:image", ogImage),
  ];

  if (seo.noindex) tags.push(meta("name", "robots", "noindex, nofollow"));

  if (seo.structuredData) {
    // The escape keeps a "</script>" inside any string from ending the block early.
    const json = JSON.stringify(seo.structuredData).replace(/</g, "\\u003c");
    tags.push(
      `    <script type="application/ld+json" id="seo-structured-data">${json}</script>`,
    );
  }

  return tags.join("\n");
}

function sitemap() {
  const urls = indexablePaths
    .map((routePath) => `  <url>\n    <loc>${SITE_URL}${routePath}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function prerender(): Plugin {
  return {
    name: "prerender-routes",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;

      const template = fs.readFileSync(indexPath, "utf8");
      const start = template.indexOf("<!-- seo:start -->");
      const end = template.indexOf("<!-- seo:end -->");
      if (start === -1 || end === -1) {
        throw new Error("prerender: the seo markers are missing from index.html");
      }

      const before = template.slice(0, start);
      const after = template.slice(end + "<!-- seo:end -->".length);

      // Every route, not only the indexable ones. The noindex pages get a file too so
      // the tag is in the HTML as served: robots.txt keeps crawlers off them, but a
      // crawler that ignores robots.txt still has to be told in the page itself.
      for (const routePath of Object.keys(pageSeo)) {
        const html = before + headFor(routePath).trimStart() + after;
        // "/" is the file Vite already wrote; the rest each get a directory so the URL
        // stays clean and Vercel serves the file before it reaches the SPA rewrite.
        const target =
          routePath === "/"
            ? indexPath
            : path.join(outDir, routePath.replace(/^\//, ""), "index.html");

        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      }

      // Generated from the same list, so the sitemap cannot advertise a page that was
      // renamed or a page we decided not to index.
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap());

      console.log(
        `\nprerendered ${Object.keys(pageSeo).length} routes ` +
          `(${indexablePaths.length} in sitemap.xml)`,
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), prerender()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
