import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Home, Info, MapPin, Phone, HelpCircle } from "lucide-react";
import logo from "@/assets/logo.jpeg";

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
              alt="Habibi Come to Crete"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-display font-bold text-primary text-sm leading-tight hidden sm:block">
              Habibi Come<br />to Crete
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
    </div>
  );
}
