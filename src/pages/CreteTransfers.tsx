import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { IslandFareTable } from "@/components/FareTable";

export default function CreteTransfers() {
  useSeo("/crete-transfers");

  return (
    <section className="container max-w-5xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Crete Transfers</h1>
        <p className="text-muted-foreground">
          Our private Crete transfers connect Heraklion Airport, Chania Airport, ports, resorts, and villas with safe and
          punctual service. We operate 24/7, monitor arrivals, and help travelers move comfortably across the island.
        </p>
      </header>

      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>
          If you need a smooth transfer in Crete, our drivers provide direct routes without unnecessary delays. You can pre-book
          your ride with full trip details, including pickup point, destination, luggage, flight number, and child seat requests.
          We confirm each transfer quickly and share clear instructions before arrival.
        </p>
        <p>
          We serve all major tourist zones in Crete, including Heraklion, Hersonissos, Malia, Agios Nikolaos, Rethymno, Chania,
          and surrounding villages. Whether you are arriving by plane or ferry, our goal is to make your transfer simple and
          stress-free from the first minute.
        </p>
        <p>
          For travelers comparing options, private transfer offers comfort, predictable timing, and personalized service. You do
          not need to wait for shared shuttles or make extra stops. Your route is planned for your booking only.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-3">
        <h2 className="text-xl font-display font-semibold text-primary">Popular transfer routes</h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-muted-foreground space-y-1">
          <li>Heraklion Airport to city hotels and resorts</li>
          <li>Heraklion Airport to Hersonissos, Malia, and Sissi</li>
          <li>Chania Airport to Chania town, Platanias, and west Crete</li>
          <li>Port transfers to villas, apartments, and holiday accommodation</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-primary">
          Crete transfer prices from both airports
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          The same destination costs very different money depending on which airport you land at,
          so both are listed side by side. If you have a choice of flights, this is the table to
          check before you book one.
        </p>
        <IslandFareTable />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Request Booking
        </Link>
        <Link to="/heraklion-airport-transfer" className="px-4 py-2 rounded-md border text-sm font-medium">
          Heraklion Airport Transfer
        </Link>
        <Link to="/chania-airport-transfer" className="px-4 py-2 rounded-md border text-sm font-medium">
          Chania Airport Transfer
        </Link>
      </div>
    </section>
  );
}

