import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Nothing to set up here any more.
//
// The favicon used to be swapped at runtime to the full-size logo, which pulled 1.4 MB
// on every page view to paint a 32px square; index.html now points at a scaled icon.
// The title used to be forced to the bare site name, which overwrote whatever the page
// had already put there. Both are the head's job, and the head is written once.

createRoot(document.getElementById("root")!).render(<App />);
