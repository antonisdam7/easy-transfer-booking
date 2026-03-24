import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import logo from "@/assets/logo.jpeg";

const faviconLink =
  document.querySelector<HTMLLinkElement>("link[rel='icon']") ??
  document.head.appendChild(document.createElement("link"));
faviconLink.rel = "icon";
faviconLink.type = "image/jpeg";
faviconLink.href = logo;

document.title = "habibitransferscrete";

createRoot(document.getElementById("root")!).render(<App />);
