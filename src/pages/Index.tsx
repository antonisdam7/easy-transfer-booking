import logo from "@/assets/logo.jpeg";
import BookingForm from "@/components/BookingForm";
import { Phone, Mail, Star, MapPin } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useSeo({
    title: "Crete Transfers & Airport Taxi",
    description:
      "Book private Crete transfers for Heraklion and Chania airports, ports, hotels, and resorts with professional local drivers.",
    canonicalPath: "/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Habibi Come to Crete Transfers",
        url: "https://habibitransferscrete.com/",
        telephone: "+30 697 626 3677",
        email: "habibitransferscrete@gmail.com",
        areaServed: "Crete, Greece",
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Crete Airport Transfer Service",
        provider: {
          "@type": "LocalBusiness",
          name: "Habibi Come to Crete Transfers",
        },
        areaServed: "Crete, Greece",
        serviceType: "Private airport and hotel transfers",
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with logo watermark */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12 px-4">
        {/* Giant logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="w-[90vmin] h-[90vmin] max-w-[700px] max-h-[700px] object-cover rounded-full opacity-[0.08]"
          />
        </div>

        {/* Booking form card - semi-transparent */}
        <div className="relative z-10 w-full max-w-4xl bg-card/80 backdrop-blur-md rounded-lg shadow-card p-6 md:p-10 border border-border/50 animate-fade-in-up">
          <h2 className="text-xl font-display font-bold text-primary mb-1">Book Your Transfer</h2>
          <p className="text-muted-foreground text-sm mb-6">Fill in the details and we'll confirm your ride.</p>
          <BookingForm />
        </div>
      </section>

      {/* Trust strip */}
      <div className="bg-secondary py-10">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            { icon: Star, title: "5-Star Service", desc: "Rated excellent by hundreds of travelers" },
            { icon: MapPin, title: "All of Crete", desc: "Airports, ports, hotels — anywhere" },
            { icon: Phone, title: "24/7 Available", desc: "Always here when you need us" },
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
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10">
        <div className="container max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-display font-bold text-lg">Habibi Come to Crete Transfers</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Professional transfers in Crete, Greece</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <a href="mailto:habibitransferscrete@gmail.com" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" /> habibitransferscrete@gmail.com
            </a>
            <a href="tel:+306976263677" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" /> +30 697 626 3677
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
