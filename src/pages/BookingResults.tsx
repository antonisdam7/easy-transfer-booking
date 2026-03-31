import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/api";
import { airportValues, getPrice, popularLocations } from "@/lib/booking";

const CAR_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80";
const VAN_IMAGE =
  "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=900&q=80";

function getInitialState(search: string) {
  const query = new URLSearchParams(search);
  return {
    roundtrip: query.get("roundtrip") === "true",
    pickup: query.get("pickup") || "Heraklion Airport (HER)",
    dropoff: query.get("dropoff") || "Hersonissos / Koutouloufari",
    date: query.get("date") || "",
    time: query.get("time") || "12:00",
    people: query.get("people") || "2",
    vehicleType: "",
    flightNumber: "",
    luggage: "",
    childSeat: false,
    name: "",
    email: "",
    phone: "",
    notes: "",
  };
}

const steps = ["Select Dates", "Select Car", "Select Equipment", "Personal Info"] as const;

export default function BookingResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getInitialState(location.search));

  const pickupOptions = useMemo(
    () => popularLocations.filter((loc) => loc !== formData.dropoff),
    [formData.dropoff],
  );
  const dropoffOptions = useMemo(
    () => popularLocations.filter((loc) => loc !== formData.pickup),
    [formData.pickup],
  );
  const isAirportTransfer = airportValues.includes(formData.pickup) || airportValues.includes(formData.dropoff);

  const basePrice = useMemo(() => getPrice(formData.pickup, formData.dropoff), [formData.pickup, formData.dropoff]);
  const carPrice = useMemo(() => {
    if (!basePrice) return null;
    return formData.roundtrip ? basePrice * 2 : basePrice;
  }, [basePrice, formData.roundtrip]);
  const vanPrice = useMemo(() => {
    if (!carPrice) return null;
    return Math.round(carPrice * 1.3);
  }, [carPrice]);

  const setVehicleAndContinue = (vehicleType: "sedan" | "van") => {
    setFormData((prev) => ({ ...prev, vehicleType }));
    setStep(3);
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.pickup || !formData.dropoff || !formData.date || !formData.time || !formData.people) {
      toast.error("Please complete all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest<{ id: string }>("/api/transfers", {
        method: "POST",
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          date: formData.date,
          time: formData.time,
          passengers: formData.people,
          vehicleType: formData.vehicleType,
          flightNumber: formData.flightNumber,
          luggage: formData.luggage,
          childSeat: formData.childSeat,
          notes: `${formData.notes}${formData.roundtrip ? "\nRoundtrip requested: Yes" : ""}`.trim(),
        },
      });
      toast.success("Booking request sent successfully.");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit booking.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container max-w-6xl py-10 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const active = step === stepNumber;
          const completed = step > stepNumber;
          return (
            <div
              key={label}
              className={`rounded-lg border p-3 text-center text-sm ${active ? "border-primary bg-secondary/60" : ""} ${
                completed ? "border-green-600 bg-green-50 text-green-700" : ""
              }`}
            >
              <p className="font-display font-semibold">{stepNumber}</p>
              <p>{label}</p>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h1 className="text-2xl font-display font-bold text-primary">Select Dates</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pickup Location</Label>
              <Select value={formData.pickup} onValueChange={(v) => setFormData((prev) => ({ ...prev, pickup: v, dropoff: prev.dropoff === v ? "" : prev.dropoff }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
                  {pickupOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Drop off Location</Label>
              <Select value={formData.dropoff} onValueChange={(v) => setFormData((prev) => ({ ...prev, dropoff: v, pickup: prev.pickup === v ? "" : prev.pickup }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drop-off" />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
                  {dropoffOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pickup Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Pickup Time</Label>
              <Input type="time" value={formData.time} onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>People</Label>
              <Select value={formData.people} onValueChange={(v) => setFormData((prev) => ({ ...prev, people: v }))}>
                <SelectTrigger>
                  <SelectValue />
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
          <Button onClick={() => setStep(2)}>Continue to Select Car</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Select Car</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="rounded-lg border bg-card overflow-hidden">
              <img src={CAR_IMAGE} alt="Sedan car" className="h-52 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-xl">Car (1-4)</h3>
                <p className="text-muted-foreground text-sm">
                  {carPrice ? `€${carPrice}` : "Price on request"}
                </p>
                <Button onClick={() => setVehicleAndContinue("sedan")}>Select Car</Button>
              </div>
            </article>
            <article className="rounded-lg border bg-card overflow-hidden">
              <img src={VAN_IMAGE} alt="Passenger van" className="h-52 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-xl">Van (1-8)</h3>
                <p className="text-muted-foreground text-sm">
                  {vanPrice ? `€${vanPrice}` : "Price on request"}
                </p>
                <Button onClick={() => setVehicleAndContinue("van")}>Select Van</Button>
              </div>
            </article>
          </div>
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Select Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isAirportTransfer && (
              <div className="space-y-2">
                <Label>Flight Number</Label>
                <Input value={formData.flightNumber} onChange={(e) => setFormData((prev) => ({ ...prev, flightNumber: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Luggage</Label>
              <Select value={formData.luggage} onValueChange={(v) => setFormData((prev) => ({ ...prev, luggage: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select luggage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No luggage</SelectItem>
                  <SelectItem value="1-small">1 small bag</SelectItem>
                  <SelectItem value="1-large">1 large suitcase</SelectItem>
                  <SelectItem value="2-large">2 large suitcases</SelectItem>
                  <SelectItem value="3+">3+ pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-7">
              <Checkbox
                id="child-seat-step"
                checked={formData.childSeat}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, childSeat: checked === true }))}
              />
              <Label htmlFor="child-seat-step">Child seat needed</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={submitBooking} className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Personal Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Phone / WhatsApp</Label>
              <Input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Request Booking"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

