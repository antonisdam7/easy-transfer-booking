import { Luggage, Users } from "lucide-react";
import { VehicleType } from "@/lib/booking";
import { cn } from "@/lib/utils";

// A car as a wide row rather than a card in a grid. Three cards side by side made the
// prices hard to compare and left no room for what each one actually carries, which
// is the only question a customer is really answering here.

export type Vehicle = {
  type: VehicleType;
  name: string;
  image: string;
  passengers: number;
  suitcases: number;
  // The cars an operator this size actually runs, so nobody arrives expecting a
  // particular model.
  examples: string;
  // Only ever a fact about the fleet or the price list -- never a nudge we made up.
  badge?: string;
};

type Props = {
  vehicle: Vehicle;
  price: number | null;
  roundtrip: boolean;
  selected: boolean;
  onSelect: () => void;
};

export default function VehicleRow({ vehicle, price, roundtrip, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors sm:gap-6",
        selected ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
      )}
    >
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="h-16 w-28 shrink-0 object-contain sm:h-20 sm:w-40"
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display font-semibold text-primary">{vehicle.name}</h3>
          {vehicle.badge && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-700">
              {vehicle.badge}
            </span>
          )}
        </div>

        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" /> Up to {vehicle.passengers}
          </span>
          <span className="inline-flex items-center gap-1">
            <Luggage className="h-4 w-4" /> {vehicle.suitcases}
          </span>
        </p>

        <p className="truncate text-xs text-muted-foreground">{vehicle.examples}</p>
      </div>

      <div className="shrink-0 text-right">
        {price === null ? (
          <p className="text-sm font-medium text-muted-foreground">Price on request</p>
        ) : (
          <>
            <p className="text-2xl font-extrabold tracking-tight text-emerald-600">€{price}</p>
            <p className="text-[0.6875rem] text-muted-foreground">
              Total price {roundtrip ? "(round trip)" : "(one way)"}
            </p>
          </>
        )}
      </div>
    </button>
  );
}
