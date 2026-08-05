import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewAvatar } from "@/components/ReviewAvatar";
import { FACEBOOK_REVIEWS_URL, reviews } from "@/lib/reviews";

// What customers wrote on Facebook, shown as what it is: recommendations, with the name
// and the date, and a link to the page they were left on so anyone doubting can check.
//
// No stars. Facebook did not collect any, so drawing five of them would be decoration
// standing in for evidence -- and the evidence, unusually, is checkable in one click.
//
// A row that scrolls sideways rather than a stack, because five cards down a phone is a
// wall the reader scrolls past to reach the next thing. Built on the browser's own
// scrolling with snap points: swipe works because it is a scroll container, not because
// anything here reimplements a swipe. The buttons only nudge that same scroll along, so
// with JavaScript still loading the row is already draggable, and every card is in the
// HTML from the start -- nothing here hides text from a crawler behind a slide index.
//
// It does not advance on its own. Neither does the carousel this was modelled on: text
// that slides away mid-sentence is read by nobody.

const GAP_PX = 12; // matches gap-3 on the track

export function Reviews({ limit }: { limit?: number }) {
  const shown = limit ? reviews.slice(0, limit) : reviews;
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const furthest = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 1);
    // A hair of slack: fractional widths mean scrollLeft rarely lands exactly on the end.
    setAtEnd(track.scrollLeft >= furthest - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    // Cards are a fraction of the width, so what fits changes with the window.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure, shown.length]);

  const nudge = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + GAP_PX : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  // Everything already fits, so there is nothing to page through and no arrows to draw.
  const scrollable = !atStart || !atEnd;

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

      {/* The padding is the arrows' gutter. Overlaid on the row instead, they cover the
          first and last card by the width of a couple of words -- and the words they
          cover are the ones the reader is in the middle of. */}
      <div className="relative sm:px-10">
        <ul
          ref={trackRef}
          // Focusable because it scrolls: a keyboard reaches the cards with the arrow
          // keys the same way a thumb reaches them with a swipe.
          tabIndex={0}
          role="group"
          aria-label="Customer recommendations"
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {shown.map((review) => (
            <li
              key={review.name}
              className={`flex shrink-0 snap-start basis-[85%] sm:basis-[calc(50%-6px)] ${
                shown.length >= 3 ? "lg:basis-[calc(33.333%-8px)]" : ""
              }`}
            >
              {/* h-full on the card, not the item, so a long recommendation sets the
                  height of the row and the short ones sit in boxes that match. */}
              <div className="flex h-full w-full flex-col gap-3 rounded-lg border bg-card p-5">
                {/* Name and face first, then what they said -- the order Facebook uses,
                    and the order that matters: the reader decides whether to believe the
                    sentence by looking at who wrote it. */}
                <div className="flex items-center gap-3">
                  <ReviewAvatar review={review} />
                  <p className="text-sm leading-tight">
                    <span className="block font-medium text-primary">{review.name}</span>
                    <time dateTime={review.date} className="text-muted-foreground">
                      {review.dateLabel}
                    </time>
                  </p>
                </div>
                {/* Clamped, because one long recommendation sets the height of every
                    card in the row and the short ones become mostly empty box. The cut
                    is CSS, so the whole sentence stays in the HTML for anything reading
                    the page rather than looking at it, and the ellipsis plus the link
                    above say where the rest is. */}
                <p className="text-sm md:text-base leading-relaxed line-clamp-5">{review.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {scrollable && (
          <>
            <CarouselButton side="left" disabled={atStart} onClick={() => nudge(-1)} />
            <CarouselButton side="right" disabled={atEnd} onClick={() => nudge(1)} />
          </>
        )}
      </div>
    </section>
  );
}

// Sits in the gutter beside the row, and only from sm up -- a phone has no width to spare
// for it and swipes instead. Hidden from screen readers: the row itself is reachable and
// scrollable without them, and "previous"/"next" describe a visual position that a
// listener moving card to card does not have.
function CarouselButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
      aria-hidden="true"
      className={`absolute top-1/2 hidden -translate-y-1/2 rounded-full border bg-card/95 p-2 shadow-md transition-opacity sm:block ${
        side === "left" ? "left-0" : "right-0"
      } ${disabled ? "pointer-events-none opacity-0" : "opacity-100 hover:bg-card"}`}
    >
      <Icon className="h-5 w-5 text-primary" />
    </button>
  );
}
