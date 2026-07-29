import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";

export default function ChaniaAirportTransfer() {
  useSeo("/chania-airport-transfer");

  return (
    <section className="container max-w-5xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">Chania Airport Transfer</h1>
        <p className="text-muted-foreground">
          Book your Chania Airport transfer in advance and travel directly from CHQ to your accommodation with comfort and local
          support.
        </p>
      </header>

      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>
          Our transfer service from Chania Airport is built for visitors who want a fast and reliable arrival experience. We
          arrange one-way and return transfers, monitor inbound flights, and coordinate your pickup to avoid waiting time.
        </p>
        <p>
          Common destinations from Chania Airport include Chania city center, Agia Marina, Platanias, Maleme, Kolymbari, and
          nearby west-Crete locations. We also provide intercity trips when your hotel is outside the immediate Chania area.
        </p>
        <p>
          Every trip is private, so your route is optimized for your booking only. If your group has larger luggage requirements
          or child seat needs, include details in the booking form and we assign the right vehicle.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-xl font-display font-semibold text-primary">Included in every transfer</h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-muted-foreground space-y-1">
          <li>Door-to-door airport pickup and drop-off</li>
          <li>Local drivers with island route knowledge</li>
          <li>Support for early morning and late night arrivals</li>
          <li>Simple online booking and quick confirmation</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Book Chania Transfer
        </Link>
        <Link to="/crete-transfers" className="px-4 py-2 rounded-md border text-sm font-medium">
          Explore Crete Transfers
        </Link>
      </div>
    </section>
  );
}

