import { Review } from "@/lib/reviews";

// The face beside a recommendation, or the next best thing.
//
// A photograph is what we want here: a review with a person attached reads as something
// someone said, while a bare paragraph reads as something the site wrote about itself.
// Where there is no photograph -- which for now is everywhere, see the note on Review.photo
// -- initials on a coloured disc do the same work honestly, the way Facebook itself does.

// Six tones pulled from the site's own palette rather than a random hue per name, so five
// avatars in a row look like they belong to one page instead of a paint chart.
const TONES = [
  "bg-sky-700",
  "bg-teal-700",
  "bg-amber-700",
  "bg-slate-600",
  "bg-emerald-700",
  "bg-rose-800",
];

// Stable across renders and across builds: the same name always gets the same colour, so
// a reader returning to the page does not find Hannah has changed from teal to amber.
function toneFor(name: string) {
  let sum = 0;
  for (const char of name) sum = (sum + char.codePointAt(0)!) % 4096;
  return TONES[sum % TONES.length];
}

// First letter of the first two words. Greek and Latin both come out right because this
// takes whole code points rather than bytes.
function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("")
    .toLocaleUpperCase("el-GR");
}

export function ReviewAvatar({ review }: { review: Review }) {
  if (review.photo) {
    return (
      <img
        src={review.photo}
        // The name is already written next to this, so repeating it would have a screen
        // reader say it twice. The picture adds nothing a listener needs.
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${toneFor(review.name)}`}
    >
      {initialsFor(review.name)}
    </span>
  );
}
