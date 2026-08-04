import { pageFaqs } from "@/lib/faqs";

// The visible half of a page's FAQ schema. Both halves read pageFaqs through the same
// route key, so a question can never appear in one and not the other -- which is the
// state Google treats as a page describing itself falsely.
//
// Written out rather than folded into an accordion. These are three short answers on a
// page someone is already reading for prices; hiding them behind a click would be work
// for the reader and nothing for anyone else.

export function FaqList({ route, heading }: { route: string; heading: string }) {
  const faqs = pageFaqs[route];
  if (!faqs) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-semibold text-primary">{heading}</h2>
      <dl className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.q} className="rounded-lg border bg-card p-5 space-y-1">
            <dt className="font-display font-semibold text-primary">{faq.q}</dt>
            <dd className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
