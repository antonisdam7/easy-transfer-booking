import { useSeo } from "@/hooks/useSeo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/faqs";

const Faqs = () => {
  useSeo("/faqs");

  return (
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
};

export default Faqs;
