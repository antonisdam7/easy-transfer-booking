import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import balos from "@/assets/balos-beach.webp";
import { Phone, MapPin, Receipt } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import LocationInput from "@/components/LocationInput";
import { Reviews } from "@/components/Reviews";
import { DateInput, TimeInput } from "@/components/DateTimeInput";
import { HERAKLION_AIRPORT, locationFromName, locationToParams, LocationValue } from "@/lib/booking";

const Index = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    roundtrip: false,
    // Most transfers start at Heraklion, so the harder half of the trip is filled in
    // already. The drop-off is left empty on purpose: it is the hotel, and nobody's
    // hotel is a sensible default.
    pickup: locationFromName(HERAKLION_AIRPORT) as LocationValue | null,
    dropoff: null as LocationValue | null,
    date: "",
    time: "12:00",
    returnDate: "",
    returnTime: "12:00",
    people: "2",
  });

  useSeo("/");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchData.pickup || !searchData.dropoff) {
      toast.error("Please choose where we are picking you up and where you are going.");
      return;
    }
    // Caught here rather than at the end of the booking. The calendar is a popover and
    // a tap that lands just off it leaves the field reading "Pick a date" while every
    // other field looks finished -- and the next page has no date field to put it
    // right, so the customer met a refusal with nothing on screen to act on.
    if (!searchData.date) {
      toast.error("Please pick the date of your transfer.");
      return;
    }
    if (searchData.roundtrip && !searchData.returnDate) {
      toast.error("Please pick your return date.");
      return;
    }

    const params = new URLSearchParams({
      roundtrip: String(searchData.roundtrip),
      ...locationToParams("pickup", searchData.pickup),
      ...locationToParams("dropoff", searchData.dropoff),
      date: searchData.date,
      time: searchData.time,
      returnDate: searchData.returnDate,
      returnTime: searchData.returnTime,
      people: searchData.people,
    });
    navigate(`/booking-results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero over Balos */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12 px-4">
        {/* The largest thing painted on the page, and so the one Core Web Vitals
            measures. Left to itself the browser discovers it partway down the
            stylesheet and queues it behind the scripts; the hint moves it to the
            front, which is the whole of the LCP on this page. */}
        <img
          src={balos}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Just enough veil to keep the labels legible over the dark headland,
            without washing the sea out. */}
        <div className="absolute inset-0 bg-white/10" aria-hidden="true" />

        {/* Quick search card. The tint and blur are as light as the labels will
            tolerate: the beach is meant to read through the form, not behind it. */}
        <div className="relative z-10 w-full max-w-4xl bg-white/25 backdrop-blur-[3px] rounded-lg shadow-xl p-6 md:p-10 border border-white/50 animate-fade-in-up">
          <h1 className="text-2xl font-display font-bold text-primary mb-1 drop-shadow-sm">
            Book Your Transfer
          </h1>
          <p className="text-primary/80 text-sm mb-6">Search available options in seconds.</p>
          <form onSubmit={onSearch} className="space-y-4">
            <div className="flex items-center justify-end gap-3">
              <Label htmlFor="roundtrip" className="text-sm font-medium">
                Roundtrip
              </Label>
              <Switch
                id="roundtrip"
                checked={searchData.roundtrip}
                onCheckedChange={(checked) => setSearchData((prev) => ({ ...prev, roundtrip: checked === true }))}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocationInput
                label="Pickup Location"
                value={searchData.pickup}
                onChange={(value) => setSearchData((prev) => ({ ...prev, pickup: value }))}
              />
              <LocationInput
                label="Drop off Location"
                value={searchData.dropoff}
                onChange={(value) => setSearchData((prev) => ({ ...prev, dropoff: value }))}
                placeholder="Search for your hotel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateInput
                label="Pickup Date"
                value={searchData.date}
                onChange={(date) => setSearchData((prev) => ({ ...prev, date }))}
              />
              <TimeInput
                label="Pickup Time"
                value={searchData.time}
                onChange={(time) => setSearchData((prev) => ({ ...prev, time }))}
              />
              <div className="space-y-2">
                <Label>People</Label>
                <Select value={searchData.people} onValueChange={(v) => setSearchData((prev) => ({ ...prev, people: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select people" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {searchData.roundtrip && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateInput
                  label="Return Date"
                  value={searchData.returnDate}
                  onChange={(returnDate) => setSearchData((prev) => ({ ...prev, returnDate }))}
                  min={searchData.date}
                />
                <TimeInput
                  label="Return Time"
                  value={searchData.returnTime}
                  onChange={(returnTime) => setSearchData((prev) => ({ ...prev, returnTime }))}
                />
              </div>
            )}

            <p className="text-xs text-primary/70">Free cancellation up to 24 hours before pickup.</p>
            <Button type="submit" className="w-full md:w-auto font-display">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Trust strip */}
      <div className="bg-secondary py-10">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            // Was "5-Star Service -- rated excellent by hundreds of travelers". There are
            // five recommendations, on a platform that stopped collecting stars in 2018.
            // The real recommendations are printed further down the page; a claim that
            // large sitting above them would only make them look small.
            { icon: Receipt, title: "Fixed Fares", desc: "Quoted per vehicle before you book, VAT and tolls in" },
            { icon: MapPin, title: "All of Crete", desc: "Airports, ports, hotels — anywhere" },
            { icon: Phone, title: "24/7 Available", desc: "Always here when you need us" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 bg-card rounded-lg p-5 shadow-card">
              <div className="rounded-full bg-secondary p-3 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-primary">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        <Reviews />
      </div>

      {/* The four transfer pages, in the body rather than only in the footer. A link
          from here is what tells a search engine these are the pages the site is
          actually about, and it is the only way a visitor reaches them without
          scrolling past everything else. */}
      <section className="container max-w-4xl py-12">
        <h2 className="font-display font-bold text-2xl text-primary">Where we drive</h2>
        <p className="text-muted-foreground mt-1">
          Fixed fares, measured routes, and a local driver on every journey.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              to: "/heraklion-airport-transfer",
              title: "Heraklion Airport Transfer",
              desc: "Private pickups from HER to hotels and resorts across the island.",
            },
            {
              to: "/chania-airport-transfer",
              title: "Chania Airport Transfer",
              desc: "CHQ to Chania town, Platanias, Kissamos, and the west.",
            },
            {
              to: "/crete-transfers",
              title: "Crete Transfers",
              desc: "Airports, ports, and hotels anywhere on Crete.",
            },
            {
              to: "/private-taxi-crete",
              title: "Private Taxi Crete",
              desc: "Port pickups, day trips, and routes of your own choosing.",
            },
          ].map(({ to, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="block bg-card rounded-lg p-5 shadow-card hover:shadow-md transition-shadow"
            >
              <h3 className="font-display font-semibold text-primary">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
