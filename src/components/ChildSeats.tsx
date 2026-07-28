import { Baby } from "lucide-react";
import { cn } from "@/lib/utils";

// Two kinds of seat, counted rather than ticked. "Child seat needed" as a checkbox
// left a driver guessing whether to bring a rear-facing seat for a baby or a booster
// cushion for an eight-year-old, and whether to bring one or two.
//
// Ages and weights are the European groupings the seats are actually sold under.

export type SeatCounts = {
  childSeats: number;
  boosterSeats: number;
};

// Two is what fits across the back of a car alongside an adult. More than that is a
// conversation with the operator, not a checkbox.
const MAX_SEATS = 2;

const kinds = [
  {
    key: "childSeats" as const,
    name: "Child seat",
    detail: "For children 0–18 kg, roughly up to 4 years.",
  },
  {
    key: "boosterSeats" as const,
    name: "Booster seat",
    detail: "For children 15–36 kg, roughly 4 to 10 years.",
  },
];

type Props = {
  value: SeatCounts;
  onChange: (value: SeatCounts) => void;
};

export default function ChildSeats({ value, onChange }: Props) {
  const total = value.childSeats + value.boosterSeats;

  return (
    <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
      {kinds.map((kind) => {
        const current = value[kind.key];
        // The other kind's seats are already spoken for, so a count that would take
        // the booking past two is offered as unavailable rather than silently ignored.
        const allowance = MAX_SEATS - (total - current);

        return (
          <div key={kind.key} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Baby className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium text-primary">{kind.name}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-700">
                Free
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{kind.detail}</p>

            <div className="flex gap-2">
              {[0, 1, 2].map((count) => {
                const disabled = count > allowance;

                return (
                  <button
                    key={count}
                    type="button"
                    disabled={disabled}
                    aria-pressed={current === count}
                    onClick={() => onChange({ ...value, [kind.key]: count })}
                    className={cn(
                      "h-9 min-w-[3rem] rounded-md border px-3 text-sm transition-colors",
                      current === count
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:border-primary/40",
                      disabled && "cursor-not-allowed opacity-40 hover:border-border",
                    )}
                  >
                    {count === 0 ? "No" : count}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="border-t pt-3 text-xs text-muted-foreground">
        Up to {MAX_SEATS} seats per booking. Need more, or travelling with an infant? Tell us in
        the notes and we will sort it out.
      </p>
    </div>
  );
}
