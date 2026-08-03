import { Link } from "react-router-dom";
import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";

// The footer used to live inside the homepage, so it appeared on exactly one of the
// eleven pages. Every other page ended at its last paragraph with no way onward and
// no contact details.
//
// It also carries the only links to the four transfer pages. They are in the sitemap
// and Google can reach them, but nothing on the site pointed at them: a visitor could
// not find them at all, and the homepage passed them none of its standing. The anchor
// text is the page's own subject rather than "click here", because that text is most
// of what a link is worth.

const transferLinks = [
  { to: "/crete-transfers", label: "Crete Transfers" },
  { to: "/heraklion-airport-transfer", label: "Heraklion Airport Transfer" },
  { to: "/chania-airport-transfer", label: "Chania Airport Transfer" },
  { to: "/private-taxi-crete", label: "Private Taxi Crete" },
];

const siteLinks = [
  { to: "/about", label: "About Us" },
  { to: "/crete", label: "Discover Crete" },
  { to: "/faqs", label: "Frequently Asked Questions" },
  { to: "/contact", label: "Contact Us" },
];

export default function AppFooter() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container max-w-6xl grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display font-bold text-lg">Habibi Come to Crete Transfers</p>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Professional transfers in Crete, Greece
          </p>
        </div>

        <nav aria-label="Transfer services" className="text-sm">
          <h2 className="font-display font-semibold mb-3">Transfers</h2>
          <ul className="space-y-2">
            {transferLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About this site" className="text-sm">
          <h2 className="font-display font-semibold mb-3">Company</h2>
          <ul className="space-y-2">
            {siteLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col items-start gap-2 text-sm">
          <h2 className="font-display font-semibold mb-1">Get in touch</h2>
          <a
            href="https://wa.me/306976263677?text=Hi%2C%20I%20want%20to%20book%20a%20transfer%20in%20Crete"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61575578152214"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors font-medium"
          >
            <Facebook className="h-4 w-4" /> Visit us on Facebook
          </a>
          <a
            href="mailto:habibitransferscrete@gmail.com"
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Mail className="h-4 w-4" /> habibitransferscrete@gmail.com
          </a>
          <a
            href="tel:+306976263677"
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Phone className="h-4 w-4" /> +30 697 626 3677
          </a>
        </div>
      </div>
    </footer>
  );
}
