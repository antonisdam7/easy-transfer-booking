import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/api";
import { airportValues, getPrice, getRouteStats, popularLocations } from "@/lib/booking";

const CAR_IMAGE = "/vehicle-sedan.png";
const ESTATE_IMAGE = "/vehicle-estate.png";
const VAN_IMAGE = "/vehicle-van.png";

function getInitialState(search: string) {
  const query = new URLSearchParams(search);
  return {
    roundtrip: query.get("roundtrip") === "true",
    pickup: query.get("pickup") || "Heraklion Airport (HER)",
    dropoff: query.get("dropoff") || "Hersonissos / Koutouloufari",
    date: query.get("date") || "",
    time: query.get("time") || "12:00",
    returnDate: query.get("returnDate") || "",
    returnTime: query.get("returnTime") || "12:00",
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
  const [step, setStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getInitialState(location.search));
  const progressPercent = ((step - 1) / (steps.length - 1)) * 100;

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
  const routeStats = useMemo(
    () => getRouteStats(formData.pickup, formData.dropoff),
    [formData.pickup, formData.dropoff],
  );

  const formatDateWithWeekday = (date: string, time: string) => {
    if (!date) return `No date selected @ ${time}`;
    const dt = new Date(`${date}T${time || "00:00"}`);
    return dt.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
    if (formData.roundtrip && (!formData.returnDate || !formData.returnTime)) {
      toast.error("Please add return date and return time for roundtrip booking.");
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
          notes: `${formData.notes}${
            formData.roundtrip
              ? `\nRoundtrip requested: Yes\nReturn Date: ${formData.returnDate}\nReturn Time: ${formData.returnTime}`
              : ""
          }`.trim(),
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
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const activeOrDone = step >= stepNumber;
            return (
              <span key={label} className={activeOrDone ? "text-primary font-medium" : ""}>
                {stepNumber}. {label}
              </span>
            );
          })}
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h1 className="text-2xl font-display font-bold text-primary">Select Dates</h1>
          <div className="flex items-center justify-end gap-3">
            <Label htmlFor="roundtrip-step" className="text-sm font-medium">
              Roundtrip
            </Label>
            <Switch
              id="roundtrip-step"
              checked={formData.roundtrip}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  roundtrip: checked === true,
                  returnDate: checked ? prev.returnDate : "",
                  returnTime: checked ? prev.returnTime : "12:00",
                }))
              }
              className="data-[state=checked]:bg-green-600"
            />
          </div>
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
          {formData.roundtrip && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Return Time</Label>
                <Input
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, returnTime: e.target.value }))}
                />
              </div>
            </div>
          )}
          <Button onClick={() => setStep(2)}>Continue to Select Car</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Select Car</h2>
          <div className="rounded-lg border bg-secondary/40 p-4 text-sm space-y-2">
            <p className="font-medium">
              {`📅 ${formatDateWithWeekday(formData.date, formData.time)}   👥 x${formData.people}   📍 ${routeStats.km} km   ⏱️ ${routeStats.minutes} mins`}
            </p>
            <p className="text-muted-foreground">
              {`✈️ ${formData.pickup}  ➜  ${formData.dropoff}`}
            </p>
            {formData.roundtrip && (
              <p className="text-muted-foreground">
                {`🔁 ${formatDateWithWeekday(formData.returnDate, formData.returnTime)}  | Return route included`}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="rounded-lg border bg-card overflow-hidden">
              <img src={CAR_IMAGE} alt="Sedan car" className="h-52 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-lg">Mercedes E Class Sedan</h3>
                <p className="text-muted-foreground text-sm">
                  {carPrice ? `€${carPrice}` : "Price on request"}
                </p>
                <p className="text-sm text-muted-foreground">× 4 suitcases</p>
                <p className="text-sm text-muted-foreground">× 4 persons</p>
                <p className="text-sm text-muted-foreground">{routeStats.km} km</p>
                <p className="text-sm text-muted-foreground">{routeStats.minutes} mins (duration)</p>
                <Button onClick={() => setVehicleAndContinue("sedan")}>Select Car</Button>
              </div>
            </article>
            <article className="rounded-lg border bg-card overflow-hidden">
              <img src={ESTATE_IMAGE} alt="Mercedes E Class Estate" className="h-52 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-lg">Mercedes-Benz E-Class Estate</h3>
                <p className="text-muted-foreground text-sm">
                  {carPrice ? `€${carPrice}` : "Price on request"}
                </p>
                <p className="text-sm text-muted-foreground">× 7 suitcases</p>
                <p className="text-sm text-muted-foreground">× 4 persons</p>
                <p className="text-sm text-muted-foreground">{routeStats.km} km</p>
                <p className="text-sm text-muted-foreground">{routeStats.minutes} mins (duration)</p>
                <Button onClick={() => setVehicleAndContinue("sedan")}>Select Estate</Button>
              </div>
            </article>
            <article className="rounded-lg border bg-card overflow-hidden">
              <img src={VAN_IMAGE} alt="Passenger van" className="h-52 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-lg">Minivan Mercedes V Class</h3>
                <p className="text-muted-foreground text-sm">
                  {vanPrice ? `€${vanPrice}` : "Price on request"}
                </p>
                <p className="text-sm text-muted-foreground">× 8 suitcases</p>
                <p className="text-sm text-muted-foreground">× 8 persons</p>
                <p className="text-sm text-muted-foreground">{routeStats.km} km</p>
                <p className="text-sm text-muted-foreground">{routeStats.minutes} mins (duration)</p>
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

