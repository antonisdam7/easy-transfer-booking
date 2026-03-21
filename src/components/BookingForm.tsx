import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Car, MessageSquare } from "lucide-react";

const popularLocations = [
  "Heraklion Airport (HER)",
  "Chania Airport (CHQ)",
  "Heraklion Port",
  "Chania Port (Souda)",
  "Rethymno",
  "Agios Nikolaos",
  "Elounda",
  "Hersonissos",
  "Malia",
  "Plakias",
  "Matala",
  "Sitia",
  "Ierapetra",
  "Bali",
  "Agia Pelagia",
  "Other (specify in notes)",
];

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
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pickup || !formData.dropoff || !formData.date || !formData.time || !formData.passengers) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Booking request sent! We'll contact you shortly to confirm.");
    setFormData({ name: "", email: "", phone: "", pickup: "", dropoff: "", date: "", time: "", passengers: "", vehicleType: "", notes: "" });
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
              <SelectItem value="minivan">Minivan (1-6)</SelectItem>
              <SelectItem value="van">Van (1-8)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent" /> Additional Notes</Label>
        <Textarea placeholder="Flight number, child seats, extra luggage, special requests..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
      </div>

      <Button type="submit" size="lg" className="w-full text-lg font-display font-semibold tracking-wide">
        Request Booking
      </Button>
    </form>
  );
};

export default BookingForm;
