import { FACEBOOK_REVIEWS_URL, reviews } from "@/lib/reviews";

// What customers wrote on Facebook, shown as what it is: recommendations, with the name
// and the date, and a link to the page they were left on so anyone doubting can check.
//
// No stars. Facebook did not collect any, so drawing five of them would be decoration
// standing in for evidence -- and the evidence, unusually, is checkable in one click.

export function Reviews({ limit }: { limit?: number }) {
  const shown = limit ? reviews.slice(0, limit) : reviews;

  return (
    <section className="space-y-4" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl font-display font-semibold text-primary">
          What our customers say
        </h2>
        <a
          href={FACEBOOK_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline hover:text-primary"
        >
          All {reviews.length} recommendations on Facebook
        </a>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((review) => (
          <li key={review.name} className="rounded-lg border bg-card p-5 space-y-2">
            <p className="text-sm md:text-base leading-relaxed">{review.text}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{review.name}</span>
              {" · "}
              <time dateTime={review.date}>{review.dateLabel}</time>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
