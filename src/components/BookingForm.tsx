import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Car, MessageSquare, Plane, Luggage, Baby, Euro } from "lucide-react";

const popularLocations = [
  "Heraklion Airport (HER)",
  "Chania Airport (CHQ)",
  "Heraklion Port",
  "Chania Port (Souda)",
  "Heraklio",
  "Amnissos / Karteros",
  "Kokkini Hani / Gournes",
  "Gouves",
  "Analipsi / Anissaras",
  "Hersonissos / Koutouloufari",
  "Stalida",
  "Malia",
  "Sissi",
  "Milatos",
  "Agios Nikolaos",
  "Amoudara Ag. Nikolaos",
  "Elounda",
  "Plaka Eloundas",
  "Istron / Kalo Horio",
  "Ierapetra",
  "Ferma / Koutsounari",
  "Makri Gialos",
  "Sitia",
  "Palekastro",
  "Amoudara / Linoperamata",
  "Arolitos",
  "Lygaria",
  "Agia Pelagia / Fodele",
  "Bali",
  "Panormo",
  "Scaleta",
  "Adele",
  "Rethymno",
  "Georgioupoli",
  "Kalibes / Almyrida",
  "Chania",
  "Chania A/R",
  "Agia Marina Chania",
  "Platanias Chania",
  "Maleme",
  "Kolimbari",
  "Kasteli Kissamou",
  "Paleochora",
  "Plakias",
  "Fragkokastelo",
  "Hora Sfakion",
  "Matala",
  "Agia Galini",
  "Archanes",
  "P.A.G.N.I",
  "Other (specify in notes)",
];

const airportValues = ["Heraklion Airport (HER)", "Chania Airport (CHQ)"];

// Prices from Heraklion Airport with 24% markup, rounded to nearest euro
const herAirportPrices: Record<string, number> = {
  "Heraklio": 15,
  "Amnissos / Karteros": 17,
  "Kokkini Hani / Gournes": 24,
  "Gouves": 28,
  "Analipsi / Anissaras": 33,
  "Hersonissos / Koutouloufari": 37,
  "Stalida": 39,
  "Malia": 42,
  "Sissi": 50,
  "Milatos": 60,
  "Agios Nikolaos": 73,
  "Amoudara Ag. Nikolaos": 73,
  "Elounda": 78,
  "Plaka Eloundas": 84,
  "Istron / Kalo Horio": 84,
  "Ierapetra": 106,
  "Ferma / Koutsounari": 113,
  "Makri Gialos": 125,
  "Sitia": 167,
  "Palekastro": 174,
  "Amoudara / Linoperamata": 24,
  "Arolitos": 28,
  "Lygaria": 30,
  "Agia Pelagia / Fodele": 38,
  "Bali": 65,
  "Panormo": 69,
  "Scaleta": 75,
  "Adele": 84,
  "Rethymno": 87,
  "Georgioupoli": 110,
  "Kalibes / Almyrida": 122,
  "Chania": 157,
  "Chania A/R": 162,
  "Agia Marina Chania": 162,
  "Platanias Chania": 162,
  "Maleme": 164,
  "Kolimbari": 169,
  "Kasteli Kissamou": 181,
  "Paleochora": 234,
  "Plakias": 122,
  "Fragkokastelo": 134,
  "Hora Sfakion": 148,
  "Matala": 73,
  "Agia Galini": 87,
  "Archanes": 28,
  "P.A.G.N.I": 23,
  "Heraklion Port": 15,
  "Chania Port (Souda)": 157,
};

function getPrice(pickup: string, dropoff: string): number | null {
  if (pickup === "Heraklion Airport (HER)" && herAirportPrices[dropoff]) {
    return herAirportPrices[dropoff];
  }
  if (dropoff === "Heraklion Airport (HER)" && herAirportPrices[pickup]) {
    return herAirportPrices[pickup];
  }
  return null;
}

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
    passengers: "",
    vehicleType: "",
    flightNumber: "",
    luggage: "",
    childSeat: false,
    notes: "",
  });

  const isAirportTransfer = airportValues.includes(formData.pickup) || airportValues.includes(formData.dropoff);

  const price = useMemo(() => {
    if (formData.pickup && formData.dropoff) {
      return getPrice(formData.pickup, formData.dropoff);
    }
    return null;
  }, [formData.pickup, formData.dropoff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pickup || !formData.dropoff || !formData.date || !formData.time || !formData.passengers) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Booking request sent! We'll contact you shortly to confirm.");
    setFormData({ name: "", email: "", phone: "", pickup: "", dropoff: "", date: "", time: "", passengers: "", vehicleType: "", flightNumber: "", luggage: "", childSeat: false, notes: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input id="phone" placeholder="+30 ..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
      </div>

      {/* Transfer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Pick-up Location *</Label>
          <Select value={formData.pickup} onValueChange={(v) => setFormData({ ...formData, pickup: v })}>
            <SelectTrigger><SelectValue placeholder="Select pick-up" /></SelectTrigger>
            <SelectContent>
              {popularLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Drop-off Location *</Label>
          <Select value={formData.dropoff} onValueChange={(v) => setFormData({ ...formData, dropoff: v })}>
            <SelectTrigger><SelectValue placeholder="Select drop-off" /></SelectTrigger>
            <SelectContent>
              {popularLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price display */}
      {formData.pickup && formData.dropoff && (
        <div className="rounded-lg border border-border bg-secondary/50 p-4 flex items-center gap-3">
          <Euro className="h-5 w-5 text-primary" />
          {price ? (
            <div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-lg font-display font-bold text-primary">€{price}</span>
                  <span className="text-sm text-muted-foreground ml-2">Sedan (1-4)</span>
                </div>
                <div>
                  <span className="text-lg font-display font-bold text-primary">€{Math.round(price * 1.3)}</span>
                  <span className="text-sm text-muted-foreground ml-2">Van (1-8)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Final price confirmed upon booking.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Price on request — we'll send you a quote after booking.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Date *</Label>
          <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Time *</Label>
          <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Passengers *</Label>
          <Select value={formData.passengers} onValueChange={(v) => setFormData({ ...formData, passengers: v })}>
            <SelectTrigger><SelectValue placeholder="How many?" /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "passenger" : "passengers"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Car className="h-4 w-4 text-accent" /> Vehicle</Label>
          <Select value={formData.vehicleType} onValueChange={(v) => setFormData({ ...formData, vehicleType: v })}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan (1-4)</SelectItem>
              <SelectItem value="van">Van (1-8)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Extra fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {isAirportTransfer && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Plane className="h-4 w-4 text-accent" /> Flight Number</Label>
            <Input placeholder="e.g. FR1234" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })} />
          </div>
        )}
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Luggage className="h-4 w-4 text-accent" /> Luggage</Label>
          <Select value={formData.luggage} onValueChange={(v) => setFormData({ ...formData, luggage: v })}>
            <SelectTrigger><SelectValue placeholder="Select luggage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No luggage</SelectItem>
              <SelectItem value="1-small">1 small bag</SelectItem>
              <SelectItem value="1-large">1 large suitcase</SelectItem>
              <SelectItem value="2-large">2 large suitcases</SelectItem>
              <SelectItem value="3+">3+ pieces</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 h-10">
          <Checkbox
            id="childSeat"
            checked={formData.childSeat}
            onCheckedChange={(checked) => setFormData({ ...formData, childSeat: checked === true })}
          />
          <Label htmlFor="childSeat" className="flex items-center gap-2 cursor-pointer">
            <Baby className="h-4 w-4 text-accent" /> Child seat needed
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent" /> Additional Notes</Label>
        <Textarea placeholder="Special requests, extra info..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
      </div>

      <Button type="submit" size="lg" className="w-full text-lg font-display font-semibold tracking-wide">
        Request Booking
      </Button>
    </form>
  );
};

export default BookingForm;
