import { ReactNode } from "react";
import { addMinutes, format, parse } from "date-fns";
import { enGB } from "date-fns/locale";
import { Check, Clock3, Luggage, Pencil, Repeat, Route, Users } from "lucide-react";
import { LocationValue, TripQuote, VehicleType } from "@/lib/booking";
import { Vehicle } from "@/components/VehicleRow";

// Everything the customer has told us so far, kept beside the cars so choosing one
// never means scrolling back to check where they were going.
//
// The zones behind the fare are deliberately absent. They belong in the operator's
// email; here the journey is between the two places the customer named.

type Props = {
  pickup: LocationValue | null;
  dropoff: LocationValue | null;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  roundtrip: boolean;
  people: string;
  quote: TripQuote;
  vehicle: VehicleType;
  // Shown once a car has actually been chosen, so the later steps still say what was
  // picked without making anyone go back to look.
  chosen?: Vehicle;
  // Opens the trip in a dialog over the results. This replaces the numbered step bar
  // that used to sit above the page: one way back, next to what it would change.
  onEdit?: () => void;
  // Same dialog, opened with the return leg already switched on.
  onAddReturn?: () => void;
};

// Claims we already make elsewhere on the site. Nothing here is new to a customer
// who read the About page, and nothing here is invented.
const included = [
  "Free cancellation up to 24h",
  "Door-to-door service",
  "Flight tracking",
  "Licensed drivers",
];

function formatDay(date: string) {
  if (!date) return "Date not set";

  const parsed = parse(date, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? "Date not set" : format(parsed, "EEE, d MMM yyyy", { locale: enGB });
}

// When the driver drops you off, going by the measured duration for the zone. Blank
// rather than wrong on a route we never measured.
function arrivalTime(date: string, time: string, minutes: number | undefined) {
  if (!date || !time || minutes === undefined) return "";

  const start = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return Number.isNaN(start.getTime()) ? "" : format(addMinutes(start, minutes), "HH:mm");
}

function Leg({
  from,
  to,
  date,
  time,
  minutes,
  km,
  label,
  action,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
  minutes?: number;
  km?: number;
  label: string;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="font-semibold text-primary">{label}</span>
          <span className="text-muted-foreground"> · {formatDay(date)}</span>
        </p>
        {action}
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-primary" />
        <span className="font-medium text-primary">{from}</span>
        <span className="tabular-nums text-muted-foreground">{time}</span>

        <span className="my-1 ml-[0.3125rem] w-px justify-self-start bg-border" style={{ height: "100%" }} />
        <span className="col-span-2 flex flex-wrap gap-2 py-2">
          {minutes !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
              <Clock3 className="h-3 w-3" /> ~{minutes} min
            </span>
          )}
          {km !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
              <Route className="h-3 w-3" /> ~{km} km
            </span>
          )}
        </span>

        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
        <span className="font-medium text-primary">{to}</span>
        <span className="tabular-nums text-muted-foreground">
          {arrivalTime(date, time, minutes)}
        </span>
      </div>
    </div>
  );
}

export default function BookingSummary({
  pickup,
  dropoff,
  date,
  time,
  returnDate,
  returnTime,
  roundtrip,
  people,
  quote,
  vehicle,
  chosen,
  onEdit,
  onAddReturn,
}: Props) {
  const from = pickup?.name ?? "Not set";
  const to = dropoff?.name ?? "Not set";
  const total = quote.prices[vehicle];
  const outward = quote.oneWayPrices[vehicle];
  const returnLeg = total !== null && outward !== null ? total - outward : null;

  return (
    <aside className="space-y-4">
      <h2 className="font-display text-xl font-bold text-primary">Your Booking</h2>

      <div className="space-y-6 rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-primary">{roundtrip ? "Round trip" : "One way"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {people} {people === "1" ? "passenger" : "passengers"}
          </span>
        </div>

        <Leg
          label="Outward"
          from={from}
          to={to}
          date={date}
          time={time}
          minutes={quote.stats?.minutes}
          km={quote.stats?.km}
          action={
            onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )
          }
        />

        {roundtrip ? (
          <>
            <hr />
            <Leg
              label="Return"
              from={to}
              to={from}
              date={returnDate}
              time={returnTime}
              minutes={quote.stats?.minutes}
              km={quote.stats?.km}
            />
          </>
        ) : (
          onAddReturn && (
            <button
              type="button"
              onClick={onAddReturn}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Repeat className="h-4 w-4" /> Add return
            </button>
          )
        )}

        {chosen && (
          <>
            <hr />
            <div className="space-y-2">
              <p className="font-semibold text-primary">Your choice</p>
              <div className="flex items-center gap-3">
                <img src={chosen.image} alt="" className="h-10 w-16 shrink-0 object-contain" />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium text-primary">{chosen.name}</p>
                  <p className="flex items-center gap-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Up to {chosen.passengers}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Luggage className="h-3.5 w-3.5" /> {chosen.suitcases}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <hr />

        <div className="space-y-2">
          <p className="font-semibold text-primary">Price details</p>
          {total === null ? (
            <p className="text-sm text-muted-foreground">
              We will confirm the fare for this route by email.
            </p>
          ) : (
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Outward</dt>
                <dd className="tabular-nums">€{outward}</dd>
              </div>
              {roundtrip && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Return (20% off)</dt>
                  <dd className="tabular-nums">€{returnLeg}</dd>
                </div>
              )}
              <div className="flex justify-between border-t pt-1.5 text-base font-bold text-primary">
                <dt>Total</dt>
                <dd className="tabular-nums">€{total}</dd>
              </div>
            </dl>
          )}
          <p className="text-xs text-muted-foreground">
            Payable to the driver, in cash or by card. Nothing is charged online.
          </p>
        </div>

        <hr />

        <ul className="flex flex-wrap gap-2">
          {included.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
