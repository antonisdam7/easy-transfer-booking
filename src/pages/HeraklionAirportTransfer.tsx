import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { FareTable } from "@/components/FareTable";
import { HERAKLION_AIRPORT } from "@/lib/booking";

export default function HeraklionAirportTransfer() {
  useSeo("/heraklion-airport-transfer");

  return (
    <section className="container max-w-5xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Heraklion Airport Transfer</h1>
        <p className="text-muted-foreground">
          Need a dependable Heraklion Airport transfer? We provide private pickups from HER to hotels, apartments, and resorts
          across Crete with professional local drivers.
        </p>
      </header>

      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>
          Heraklion is the busiest airport on the island, especially in summer. We track your flight and adjust pickup time for
          delays, so you can land without transport stress. Your driver meets you and takes you directly to your destination.
        </p>
        <p>
          Our Heraklion Airport transfer service is suitable for couples, families, and groups. You can choose sedan or van
          depending on passengers and luggage. If you need child seats or extra stop requests, add them in booking notes and we
          confirm availability.
        </p>
        <p>
          Popular routes include Heraklion city, Ammoudara, Hersonissos, Stalida, Malia, Agios Nikolaos, Elounda, and Rethymno.
          We also support one-way and return bookings for easier holiday planning.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-xl font-display font-semibold text-primary">Why travelers choose us</h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-muted-foreground space-y-1">
          <li>Private direct route from airport to hotel</li>
          <li>Flight monitoring for late arrivals</li>
          <li>24/7 availability in high season</li>
          <li>Clear communication before pickup</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-primary">
          Heraklion Airport transfer prices
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Every fare below is fixed and quoted before you book. Distances and driving times are
          measured on the road, not in a straight line, and the summer roadworks east of Agios
          Nikolaos are already counted in.
        </p>
        <FareTable airport={HERAKLION_AIRPORT} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Book Heraklion Transfer
        </Link>
        <Link to="/private-taxi-crete" className="px-4 py-2 rounded-md border text-sm font-medium">
          Private Taxi Crete
        </Link>
      </div>
    </section>
  );
}

