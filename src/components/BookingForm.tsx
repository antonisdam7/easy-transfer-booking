import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Car, MessageSquare, Plane, Luggage, Baby, Euro } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { airportValues, getPrice, popularLocations } from "@/lib/booking";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAirportTransfer = airportValues.includes(formData.pickup) || airportValues.includes(formData.dropoff);

  const price = useMemo(() => {
    if (formData.pickup && formData.dropoff) {
      return getPrice(formData.pickup, formData.dropoff);
    }
    return null;
  }, [formData.pickup, formData.dropoff]);

  const pickupOptions = useMemo(
    () => popularLocations.filter((loc) => loc !== formData.dropoff),
    [formData.dropoff],
  );
  const dropoffOptions = useMemo(
    () => popularLocations.filter((loc) => loc !== formData.pickup),
    [formData.pickup],
  );

  useEffect(() => {
    if (formData.pickup && formData.dropoff && formData.pickup === formData.dropoff) {
      setFormData((prev) => ({ ...prev, dropoff: "" }));
    }
  }, [formData.pickup, formData.dropoff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pickup || !formData.dropoff || !formData.date || !formData.time || !formData.passengers) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest<{ id: string }>("/api/transfers", {
        method: "POST",
        body: formData,
      });
      toast.success("Booking request sent! We'll contact you shortly to confirm.");
      setFormData({
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send booking request.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
            <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
              {pickupOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Drop-off Location *</Label>
          <Select value={formData.dropoff} onValueChange={(v) => setFormData({ ...formData, dropoff: v })}>
            <SelectTrigger><SelectValue placeholder="Select drop-off" /></SelectTrigger>
            <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
              {dropoffOptions.map((loc) => (
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

      <Button type="submit" size="lg" className="w-full text-lg font-display font-semibold tracking-wide" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Request Booking"}
      </Button>
    </form>
  );
};

export default BookingForm;
