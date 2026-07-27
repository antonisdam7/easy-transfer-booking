import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import { Phone, Mail, Star, MapPin, Facebook, MessageCircle } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import LocationInput from "@/components/LocationInput";
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

  useSeo({
    title: "Crete Transfers & Airport Taxi",
    description:
      "Book private Crete transfers for Heraklion and Chania airports, ports, hotels, and resorts with professional local drivers.",
    canonicalPath: "/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Habibi Come to Crete Transfers",
        url: "https://habibitransferscrete.com/",
        telephone: "+30 697 626 3677",
        email: "habibitransferscrete@gmail.com",
        areaServed: "Crete, Greece",
        sameAs: ["https://www.facebook.com/profile.php?id=61575578152214"],
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Crete Airport Transfer Service",
        provider: {
          "@type": "LocalBusiness",
          name: "Habibi Come to Crete Transfers",
        },
        areaServed: "Crete, Greece",
        serviceType: "Private airport and hotel transfers",
      },
    ],
  });

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchData.pickup || !searchData.dropoff) {
      toast.error("Please choose where we are picking you up and where you are going.");
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
      {/* Hero with logo watermark */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12 px-4">
        {/* Giant logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="w-[90vmin] h-[90vmin] max-w-[700px] max-h-[700px] object-cover rounded-full opacity-[0.08]"
          />
        </div>

        {/* Quick search card */}
        <div className="relative z-10 w-full max-w-4xl bg-card/80 backdrop-blur-md rounded-lg shadow-card p-6 md:p-10 border border-border/50 animate-fade-in-up">
          <h1 className="text-2xl font-display font-bold text-primary mb-1">Book Your Transfer</h1>
          <p className="text-muted-foreground text-sm mb-6">Search available options in seconds.</p>
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
              <div className="space-y-2">
                <Label>Pickup Date</Label>
                <Input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pickup Time</Label>
                <Input
                  type="time"
                  value={searchData.time}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
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
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => setSearchData((prev) => ({ ...prev, returnDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Time</Label>
                  <Input
                    type="time"
                    value={searchData.returnTime}
                    onChange={(e) => setSearchData((prev) => ({ ...prev, returnTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">Free cancellation up to 24 hours before pickup.</p>
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
            { icon: Star, title: "5-Star Service", desc: "Rated excellent by hundreds of travelers" },
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10">
        <div className="container max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-display font-bold text-lg">Habibi Come to Crete Transfers</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Professional transfers in Crete, Greece</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <a
              href="https://wa.me/306976263677?text=Hi%2C%20I%20want%20to%20book%20a%20transfer%20in%20Crete"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61575578152214"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors font-medium"
            >
              <Facebook className="h-4 w-4" /> Visit us on Facebook
            </a>
            <a href="mailto:habibitransferscrete@gmail.com" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" /> habibitransferscrete@gmail.com
            </a>
            <a href="tel:+306976263677" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" /> +30 697 626 3677
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
