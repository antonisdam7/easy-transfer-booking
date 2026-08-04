import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppRoutes } from "./App";

// The build's half of the site.
//
// Until now only the head was written into each file; the body arrived from React, so what
// the server actually handed out was a title and an empty <div id="root">. Google runs the
// JavaScript and sees the rest. Nothing else reliably does -- not the assistants people ask
// before they open a search engine, not the scrapers, and not a browser on a bad connection
// for the second or so before the bundle lands.
//
// This renders the page for real at build time. The client then hydrates that markup rather
// than throwing it away and building its own, which is why the pages it covers had to stop
// being lazily imported in App.tsx.
//
// Only the pages that are all content. The homepage carries the booking form and the Google
// Maps loader, the results page is a search, and the admin screens are a session -- none of
// them mean anything without a browser, and prerendering a form into a file that then has to
// be replaced is work with no reader.

export function render(routePath: string): string {
  return renderToString(
    <StaticRouter location={routePath}>
      <AppRoutes />
    </StaticRouter>,
  );
}
