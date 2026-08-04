import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import AppFooter from "@/components/AppFooter";
import { Home, Info, MapPin, Phone, HelpCircle } from "lucide-react";
// The 1024px original is 1.4 MB. Nothing on the site draws it larger than 64 CSS
// pixels, so every page was paying for an image it then threw away.
import logo from "@/assets/logo-160.jpg";
import { BUSINESS_NAME } from "@/lib/seo";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "About", url: "/about", icon: Info },
  { title: "Crete", url: "/crete", icon: MapPin },
  { title: "Contact", url: "/contact", icon: Phone },
  { title: "FAQs", url: "/faqs", icon: HelpCircle },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={BUSINESS_NAME}
              className="w-10 h-10 rounded-full object-cover"
            />
            {/* The name in full, because this is the one place a visitor reads it and the
                schema, the About page and the Facebook page all say "Transfers" too. The
                break puts the brand on one line and what it does on the next, rather than
                cutting the brand itself in half the way "Habibi Come / to Crete" did. */}
            <span className="font-display font-bold text-primary text-sm leading-tight hidden sm:block">
              Habibi Come to Crete<br />Transfers
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                activeClassName="bg-secondary text-primary font-semibold"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
