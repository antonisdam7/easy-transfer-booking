import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How do I book a transfer?", a: "Simply fill out the booking form on our Home page with your details. We'll confirm your reservation via email or WhatsApp within a few hours." },
  { q: "What vehicles do you have?", a: "We operate a modern Mercedes fleet including sedans (up to 4 passengers), minivans (up to 6), and vans (up to 8)." },
  { q: "Do you offer child seats?", a: "Yes! Just tick the child seat option in the booking form or mention it in your notes, and we'll have one ready." },
  { q: "Are your prices fixed?", a: "Yes, all prices are agreed upon in advance. There are no hidden charges or surge pricing." },
  { q: "What if my flight is delayed?", a: "We monitor all flight arrivals. If your flight is delayed, we'll adjust pickup time automatically at no extra cost." },
  { q: "Can I cancel my booking?", a: "Free cancellation is available up to 24 hours before your scheduled transfer." },
  { q: "Do you cover the whole island?", a: "Yes, we cover all of Crete — airports, ports, hotels, villas, and any destination on the island." },
  { q: "How do I pay?", a: "You can pay in cash to your driver or by card. Payment is made after the transfer is completed." },
];

const Faqs = () => (
  <div className="min-h-screen bg-background">
    <div className="container max-w-3xl py-16 px-4">
      <h1 className="text-3xl font-display font-bold text-primary mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground text-lg mb-10">
        Everything you need to know about our transfer service.
      </p>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg shadow-card border border-border/30 px-5">
            <AccordionTrigger className="font-display font-semibold text-primary text-left">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);

export default Faqs;
