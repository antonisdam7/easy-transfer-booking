import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { IslandFareTable } from "@/components/FareTable";
import { FaqList } from "@/components/FaqList";
import { Reviews } from "@/components/Reviews";

export default function PrivateTaxiCrete() {
  useSeo("/private-taxi-crete");

  return (
    <section className="container max-w-5xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Private Taxi Crete</h1>
        <p className="text-muted-foreground">
          Looking for a private taxi in Crete? We offer tailored transport for airport arrivals, hotel pickups, port transfers,
          and custom routes around the island.
        </p>
      </header>

      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>
          A private taxi is ideal when you need direct travel without shared shuttle delays. Our service is designed for visitors
          who want flexibility, comfort, and local support in one booking. We handle short city trips and longer island routes.
        </p>
        <p>
          You can pre-arrange transfers for families, couples, and small groups, including child seat requests and extra luggage.
          This helps you avoid last-minute transport uncertainty during high-demand travel periods.
        </p>
        <p>
          Popular private taxi routes in Crete include airport-to-hotel transfers, hotel-to-port rides, and intercity travel
          between Heraklion, Rethymno, Chania, and resort areas. If your destination is not listed, we can still quote your trip.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-xl font-display font-semibold text-primary">Best for</h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-muted-foreground space-y-1">
          <li>Travelers with fixed check-in schedules</li>
          <li>Families with kids and luggage</li>
          <li>Late-night or early-morning arrivals</li>
          <li>Direct point-to-point transport without stops</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-primary">
          What a private taxi costs in Crete
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          A private taxi is priced by the journey, not by the meter and not by the head, so four
          people pay what one person pays. These are the fares from either airport.
        </p>
        <IslandFareTable />
      </div>

      <FaqList route="/private-taxi-crete" heading="Private taxi questions" />

      <Reviews limit={2} />

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Request Private Taxi
        </Link>
        <Link to="/heraklion-airport-transfer" className="px-4 py-2 rounded-md border text-sm font-medium">
          Heraklion Airport Transfer
        </Link>
      </div>
    </section>
  );
}

