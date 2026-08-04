import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { FaqList } from "@/components/FaqList";
import { RouteLinks } from "@/components/RouteLinks";
import { transferRouteByPath, transferRoutes } from "@/lib/transferRoutes";

// One component for all ten route pages. What differs between them is the destination and
// three numbers, all of which come from the route record, so there is no version of this
// where nine pages get a fix and the tenth does not.

export default function TransferRoute({ path }: { path: string }) {
  const route = transferRouteByPath.get(path);
  useSeo(path);

  // Only reachable if App.tsx ever routed a path the list does not know about, which the
  // shared list makes impossible. Kept so the component has no way to render half a page.
  if (!route) return null;

  // Three of the nearest fares, so every page hands the reader somewhere else to go and
  // the ten pages link to each other rather than sitting as ten dead ends.
  const nearby = transferRoutes
    .filter((other) => other.path !== route.path)
    .sort((a, b) => Math.abs(a.oneWay - route.oneWay) - Math.abs(b.oneWay - route.oneWay))
    .slice(0, 3);

  return (
    <section className="container max-w-4xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">
          Heraklion Airport to {route.label} Transfer
        </h1>
        <p className="text-muted-foreground">
          A private car from the terminal to your door in {route.label}, booked in advance at a
          price that does not move.
        </p>
      </header>

      {/* The three facts the page exists to state, before any prose. Someone who came from
          a search for this route can read the answer and leave, which is the correct
          outcome for them and, in the long run, for the page. */}
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">One way from</dt>
          <dd className="text-2xl font-display font-bold text-primary tabular-nums">
            €{route.oneWay}
          </dd>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Distance</dt>
          <dd className="text-2xl font-display font-bold text-primary tabular-nums">
            {route.km} km
          </dd>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Driving time</dt>
          <dd className="text-2xl font-display font-bold text-primary tabular-nums">
            {route.duration}
          </dd>
        </div>
      </dl>

      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>{route.about}</p>
        <p>{route.drive}</p>
        <p>
          The fare covers the whole vehicle rather than each seat, so four people travelling
          together pay the €{route.oneWay} above, not four times it. VAT, tolls and the driver's
          waiting time are in the price, and a delayed flight moves the pickup rather than the
          fare. Booked as a return, the second leg is charged at 20% off.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Book this transfer
        </Link>
        <Link
          to="/heraklion-airport-transfer"
          className="px-4 py-2 rounded-md border text-sm font-medium"
        >
          All Heraklion Airport fares
        </Link>
      </div>

      <FaqList route={path} heading={`Heraklion Airport to ${route.label}`} />

      <div className="space-y-3">
        <h2 className="text-xl font-display font-semibold text-primary">Other routes we drive</h2>
        <RouteLinks routes={nearby} />
      </div>
    </section>
  );
}
