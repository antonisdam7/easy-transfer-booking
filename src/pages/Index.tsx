import logo from "@/assets/logo.jpeg";
import BookingForm from "@/components/BookingForm";
import { Phone, Mail, MapPin, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-secondary py-12 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(200 30% 55% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(210 50% 20% / 0.2) 0%, transparent 40%)" }} />
        </div>
        <div className="container relative z-10 flex flex-col items-center text-center gap-6">
          <img
            src={logo}
            alt="Habibi Come to Crete Transfers"
            className="w-40 h-40 md:w-52 md:h-52 rounded-full shadow-card object-cover animate-fade-in-up"
          />
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary tracking-tight">
              Habibi Come to Crete
            </h1>
            <p className="text-lg md:text-xl text-accent-foreground/80 mt-2 font-medium">
              Premium Transfers Across Crete
            </p>
          </div>
          <p className="max-w-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Reliable, comfortable airport & port transfers with professional drivers. 
            Mercedes fleet · Fixed prices · 24/7 service
          </p>
        </div>
      </header>

      {/* Booking Form */}
      <main className="container -mt-6 relative z-20 pb-16">
        <div className="bg-card rounded-lg shadow-card p-6 md:p-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-primary mb-1">Book Your Transfer</h2>
          <p className="text-muted-foreground mb-6">Fill in the details and we'll get back to you with a confirmed price.</p>
          <BookingForm />
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
          {[
            { icon: Star, title: "5-Star Service", desc: "Rated excellent by hundreds of happy travelers" },
            { icon: MapPin, title: "All of Crete", desc: "Airports, ports, hotels — anywhere on the island" },
            { icon: Phone, title: "24/7 Available", desc: "We're always here when you need us" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 bg-card rounded-lg p-5 shadow-card">
              <div className="rounded-full bg-secondary p-3 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-primary">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10">
        <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-display font-bold text-lg">Habibi Come to Crete Transfers</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Professional transfer services in Crete, Greece</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <a href="mailto:info@habibicrete.com" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" /> info@habibicrete.com
            </a>
            <a href="tel:+306900000000" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" /> +30 690 000 0000
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
