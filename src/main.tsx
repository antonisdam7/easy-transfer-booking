import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Nothing to set up here any more.
//
// The favicon used to be swapped at runtime to the full-size logo, which pulled 1.4 MB
// on every page view to paint a 32px square; index.html now points at a scaled icon.
// The title used to be forced to the bare site name, which overwrote whatever the page
// had already put there. Both are the head's job, and the head is written once.

const container = document.getElementById("root")!;

// The content pages arrive with their markup already in the file, written at build time by
// entry-server.tsx. Hydrating attaches React to what is there; mounting would clear it
// first, so the reader would watch a finished page blank itself and come back. The
// homepage, the booking flow and the admin screens arrive empty and are mounted normally.
if (container.firstChild) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
