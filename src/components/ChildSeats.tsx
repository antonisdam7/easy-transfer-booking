import { AlertTriangle, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Two kinds of seat, counted rather than ticked. "Child seat needed" as a checkbox
// left a driver guessing whether to bring a rear-facing seat for a baby or a booster
// cushion for an eight-year-old, and whether to bring one or two.
//
// Ages and weights are the European groupings the seats are actually sold under. The
// drawings are here because the words alone do not separate the two for a parent who
// has never had to name the thing they strap their child into.

export type SeatCounts = {
  childSeats: number;
  boosterSeats: number;
};

// Two is what fits across the back of a car alongside an adult. More than that is a
// conversation with the operator, not a dropdown.
const MAX_SEATS = 2;

// Kept light. At this size a shape filled in the site's navy reads as a black blob,
// so the shell carries the drawing and the padding is only an accent inside it.
const SHELL = "#e2e8f0";
const EDGE = "#94a3b8";
const PAD = "#2f4d73";

// A rear-facing infant carrier, seen head on: carry handle over a deep shell, harness
// and buckle inside it.
function ChildSeatArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
      <path
        d="M16 30a16 16 0 0 1 32 0"
        fill="none"
        stroke={EDGE}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 24h24a6 6 0 0 1 6 6v16a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V30a6 6 0 0 1 6-6Z"
        fill={SHELL}
        stroke={EDGE}
        strokeWidth="2"
      />
      <path
        d="M24 30h16a2 2 0 0 1 2 2v13a7 7 0 0 1-7 7h-6a7 7 0 0 1-7-7V32a2 2 0 0 1 2-2Z"
        fill={PAD}
      />
      <path d="M28 33v8M36 33v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="29" y="41" width="6" height="6" rx="1.5" fill="#fff" />
    </svg>
  );
}

// A booster: low cushion under a short backrest, with the belt guide across it.
function BoosterSeatArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
      <path
        d="M20 18h24a5 5 0 0 1 5 5v16H15V23a5 5 0 0 1 5-5Z"
        fill={SHELL}
        stroke={EDGE}
        strokeWidth="2"
      />
      <rect x="23" y="23" width="18" height="16" rx="2" fill={PAD} />
      <path
        d="M13 39h38a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5v-3a5 5 0 0 1 5-5Z"
        fill={SHELL}
        stroke={EDGE}
        strokeWidth="2"
      />
      <path d="M16 46h32" stroke={PAD} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const kinds = [
  {
    key: "childSeats" as const,
    name: "Child seat",
    detail: "Suitable for children 0–18 kg (approx. 0–4 years).",
    art: <ChildSeatArt />,
  },
  {
    key: "boosterSeats" as const,
    name: "Booster seat",
    detail: "Suitable for children 15–36 kg (approx. 4–10 years).",
    art: <BoosterSeatArt />,
  },
];

type Props = {
  value: SeatCounts;
  onChange: (value: SeatCounts) => void;
};

export default function ChildSeats({ value, onChange }: Props) {
  const total = value.childSeats + value.boosterSeats;

  return (
    <div className="overflow-hidden rounded-lg border">
      {kinds.map((kind) => {
        const current = value[kind.key];
        // The other kind's seats are already spoken for, so a count that would take
        // the booking past two is offered as unavailable rather than silently ignored.
        const allowance = MAX_SEATS - (total - current);

        return (
          <div
            key={kind.key}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            {kind.art}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-primary">{kind.name}</span>
                <span className="rounded border border-emerald-600/40 px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-700">
                  Free
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{kind.detail}</p>
            </div>

            <Select
              value={String(current)}
              onValueChange={(count) => onChange({ ...value, [kind.key]: Number(count) })}
            >
              <SelectTrigger className="w-20 shrink-0" aria-label={`${kind.name} quantity`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2].map((count) => (
                  <SelectItem key={count} value={String(count)} disabled={count > allowance}>
                    {count === 0 ? "No" : count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}

      <div className="space-y-3 p-4">
        <p className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          You can select a maximum of {MAX_SEATS} child or booster seats per booking. If you need
          more, tell us in the notes and we will sort it out.
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Please give the child's age and weight in the notes, so the driver brings the right seat.
        </p>
      </div>
    </div>
  );
}
