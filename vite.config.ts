import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { pathToFileURL } from "node:url";
import {
  BUSINESS_NAME,
  CONTACT,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  pageSeo,
  indexablePaths,
  prerenderedBodyPaths,
  structuredDataFor,
} from "./src/lib/seo";
import {
  CHANIA_AIRPORT,
  HERAKLION_AIRPORT,
  durationLabel,
  faresFrom,
} from "./src/lib/booking";

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

  const structuredData = structuredDataFor(routePath);

  if (structuredData.length) {
    // The escape keeps a "</script>" inside any string from ending the block early.
    const json = JSON.stringify(structuredData).replace(/</g, "\\u003c");
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

// The site as one plain-text file, at /llms.txt.
//
// The reason it exists is narrow and worth stating. Google runs JavaScript, so it sees the
// fare tables React draws. The assistants people increasingly ask first -- GPTBot,
// ClaudeBot, PerplexityBot -- mostly do not, and what they fetch from this site is a head
// and an empty <div id="root">. Every fare we publish is invisible to them.
//
// This is the cheap half of the answer: one fetch, no JavaScript, every price we charge.
// The expensive half is rendering the body at build time, which is a larger change.
//
// The format follows the llms.txt convention, which is young and honoured by nobody in
// particular. It costs a few hundred lines of text to be wrong about, and the file is
// readable by anything that fetches it whether or not the convention ever takes.
function llmsTxt() {
  const fareSection = (airport: string) => {
    const rows = faresFrom(airport)
      .map(
        (row) =>
          `| ${row.name} | ${row.km} km | ${durationLabel(row.minutes)} | €${row.oneWay} |`,
      )
      .join("\n");

    return (
      `## One-way fares from ${airport}\n\n` +
      `| Destination | Distance | Driving time | One way from |\n` +
      `| --- | --- | --- | --- |\n${rows}\n`
    );
  };

  const pages = indexablePaths
    .map((routePath) => {
      const seo = pageSeo[routePath];
      return `- [${seo.title}](${SITE_URL}${routePath}): ${seo.description}`;
    })
    .join("\n");

  return [
    `# ${BUSINESS_NAME}`,
    "",
    `> Private airport and hotel transfers across Crete, from Heraklion Airport (HER) and`,
    `> Chania Airport (CHQ) to hotels, resorts, villas and ports anywhere on the island.`,
    `> Every fare is fixed and quoted before booking.`,
    "",
    `Phone and WhatsApp: ${CONTACT.telephone}`,
    `Email: ${CONTACT.email}`,
    `Website: ${SITE_URL}/`,
    "Hours: 24 hours a day, every day.",
    "Payment: cash or card, after the transfer.",
    "",
    "Fares are per vehicle, not per person, and include VAT, tolls and the driver's waiting",
    "time. They are quoted for the Mercedes E-Class sedan and estate, each seating up to",
    "four; the Mercedes V-Class minivan carries more and costs more. A return is charged as",
    "one full leg plus a second at 20% off. Flights are monitored and a delayed arrival moves",
    "the pickup at no extra cost. Free cancellation up to 24 hours before pickup.",
    "",
    "Driving times are measured on the road rather than in a straight line. Those east of",
    "Agios Nikolaos allow for roadworks expected to last into 2028.",
    "",
    "## Pages",
    "",
    pages,
    "",
    fareSection(HERAKLION_AIRPORT),
    fareSection(CHANIA_AIRPORT),
  ].join("\n");
}

// The server bundle written by the first of the two builds. Absent on a first run, or if
// somebody runs `vite build` on its own, in which case the heads are still written and the
// bodies simply stay empty -- the site works either way, which is the point of it being a
// separate step rather than a requirement.
async function loadRenderer(): Promise<((routePath: string) => string) | null> {
  const entry = path.resolve(__dirname, "dist-ssr/entry-server.js");
  if (!fs.existsSync(entry)) return null;

  // A file path, not a specifier: on Windows an absolute path is not a valid import URL.
  const mod = await import(pathToFileURL(entry).href);
  return mod.render;
}

function prerender(): Plugin {
  let isSsrBuild = false;

  return {
    name: "prerender-routes",
    apply: "build",
    configResolved(config) {
      // The SSR pass builds entry-server.js and nothing else. Writing HTML files from it
      // would mean writing them before the client build has emitted the CSS and JS they
      // point at, so this pass sits it out.
      isSsrBuild = Boolean(config.build.ssr);
    },
    async closeBundle() {
      if (isSsrBuild) return;

      const renderBody = await loadRenderer();
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
      const bodyPaths = new Set(renderBody ? prerenderedBodyPaths : []);
      let bodiesWritten = 0;

      for (const routePath of Object.keys(pageSeo)) {
        let html = before + headFor(routePath).trimStart() + after;

        // The mount point React looks for, filled in rather than left empty. main.tsx
        // checks whether it has children and hydrates instead of mounting when it does.
        if (bodyPaths.has(routePath)) {
          const body = renderBody(routePath);
          if (!body) throw new Error(`prerender: ${routePath} rendered to nothing`);
          html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
          bodiesWritten += 1;
        }

        // "/" is the file Vite already wrote. "/404" is the name Vercel looks for when a
        // request matches nothing else. The rest each get a directory, so the URL stays
        // clean and Vercel finds a real file at it.
        //
        // Because every route in pageSeo lands on disk here, vercel.json no longer needs a
        // catch-all rewrite -- which is what lets an unknown URL reach 404.html and answer
        // with the status it should. The cost is that a React route with no pageSeo entry
        // would 404 in production, so the two lists have to stay in step.
        const target =
          routePath === "/"
            ? indexPath
            : routePath === "/404"
              ? path.join(outDir, "404.html")
              : path.join(outDir, routePath.replace(/^\//, ""), "index.html");

        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      }

      // Generated from the same list, so the sitemap cannot advertise a page that was
      // renamed or a page we decided not to index.
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap());
      fs.writeFileSync(path.join(outDir, "llms.txt"), llmsTxt());

      console.log(
        `\nprerendered ${Object.keys(pageSeo).length} routes ` +
          `(${indexablePaths.length} in sitemap.xml, llms.txt written)\n` +
          (renderBody
            ? `rendered ${bodiesWritten} page bodies into their files`
            : "no server bundle found -- bodies left to the browser"),
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
