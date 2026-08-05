import { Luggage, Users } from "lucide-react";
import { fleet } from "@/lib/fleet";

// The three cars on the homepage, from the same list the booking priced them from.
//
// No prices here. A car costs what the journey costs, and a number beside a photograph
// with no route attached would be a number we would have to qualify into meaninglessness.
// What belongs here is the thing a family of five needs to know before they start:
// which of these will actually take them and their luggage.

export function FleetSummary() {
  return (
    <section className="space-y-6" aria-labelledby="fleet-heading">
      <div className="space-y-2">
        <h2 id="fleet-heading" className="text-xl font-display font-semibold text-primary">
          The cars
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Three vehicles cover everything we drive. The sedan and the estate carry the same
          four people and cost the same; the estate simply swallows more luggage, which is
          the difference between a comfortable airport run and a boot that will not shut.
          The minivan takes larger groups and costs more, because it is a bigger car with a
          bigger fuel bill behind it.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {fleet.map((vehicle) => (
          <li key={vehicle.type} className="rounded-lg border bg-card overflow-hidden">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              // Below the fold on every screen, so it waits until someone scrolls to it
              // rather than competing with the photograph that decides this page's LCP.
              loading="lazy"
              decoding="async"
              width={vehicle.width}
              height={vehicle.height}
              className="w-full bg-secondary/40 object-contain"
            />
            <div className="space-y-2 p-4">
              <h3 className="font-display font-semibold text-primary">{vehicle.name}</h3>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {`Up to ${vehicle.passengers} passengers`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Luggage className="h-4 w-4" aria-hidden="true" />
                  {`${vehicle.suitcases} suitcases`}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{vehicle.examples}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
