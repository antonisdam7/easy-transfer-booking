import { useSeo } from "@/hooks/useSeo";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  useSeo("/contact");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <h1 className="text-3xl font-display font-bold text-primary mb-2">Contact Us</h1>
        <p className="text-muted-foreground text-lg mb-10">
          Have a question or want to book directly? Reach out anytime — we're available 24/7.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-card border border-border/30 text-center">
            <div className="rounded-full bg-secondary p-4 inline-flex mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-primary mb-1">Phone / WhatsApp</h3>
            <a href="tel:+306976263677" className="text-muted-foreground hover:text-primary transition-colors">
              +30 697 626 3677
            </a>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-card border border-border/30 text-center">
            <div className="rounded-full bg-secondary p-4 inline-flex mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-primary mb-1">Email</h3>
            <a href="mailto:habibitransferscrete@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              habibitransferscrete@gmail.com
            </a>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-card border border-border/30 text-center">
            <div className="rounded-full bg-secondary p-4 inline-flex mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-primary mb-1">Location</h3>
            <p className="text-muted-foreground text-sm">Crete, Greece</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
