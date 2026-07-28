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
import { Car } from "lucide-react";
import { submitTransfer } from "@/lib/transfers";
import LocationInput from "@/components/LocationInput";
import { DateInput, TimeInput } from "@/components/DateTimeInput";
import RouteMap from "@/components/RouteMap";
import BookingSummary from "@/components/BookingSummary";
import VehicleRow, { Vehicle } from "@/components/VehicleRow";
import {
  airportValues,
  locationFromParams,
  quoteTrip,
  VehicleType,
} from "@/lib/booking";

// Passenger and luggage figures are the operator's own. The example models say what
// actually turns up, so a booking is not read as a promise of one particular car.
const fleet: Vehicle[] = [
  {
    type: "sedan",
    name: "Mercedes E-Class Sedan",
    image: "/vehicle-sedan.png",
    passengers: 4,
    suitcases: 4,
    examples: "Mercedes E-Class or similar",
  },
  {
    type: "estate",
    name: "Mercedes E-Class Estate",
    image: "/vehicle-estate.png",
    passengers: 4,
    suitcases: 7,
    examples: "Mercedes E-Class Estate or similar",
    badge: "Same price, more boot",
  },
  {
    type: "van",
    name: "Minivan Mercedes V-Class",
    image: "/vehicle-van.png",
    passengers: 8,
    suitcases: 8,
    examples: "Mercedes V-Class or similar",
    badge: "Largest group",
  },
];

function getInitialState(search: string) {
  const query = new URLSearchParams(search);
  return {
    roundtrip: query.get("roundtrip") === "true",
    pickup: locationFromParams("pickup", query),
    dropoff: locationFromParams("dropoff", query),
    date: query.get("date") || "",
    time: query.get("time") || "12:00",
    returnDate: query.get("returnDate") || "",
    returnTime: query.get("returnTime") || "12:00",
    people: query.get("people") || "2",
    // Pre-selected rather than blank: the cheapest car suits most bookings, and an
    // empty selection makes the price panel beside it meaningless.
    vehicleType: "sedan" as VehicleType,
    // The fare shown next to the car the customer picked, kept so it can be stored
    // and repeated back in both confirmation emails.
    price: null as number | null,
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

  // The zones inside this are never rendered. They exist so the fare can be found and
  // so the operator's email can say which zone the hotel was charged as.
  const quote = useMemo(
    () => quoteTrip(formData.pickup, formData.dropoff, formData.roundtrip),
    [formData.pickup, formData.dropoff, formData.roundtrip],
  );
  const { prices } = quote;

  const isAirportTransfer =
    airportValues.includes(quote.pickupZone) || airportValues.includes(quote.dropoffZone);

  const chosen = fleet.find((vehicle) => vehicle.type === formData.vehicleType) ?? fleet[0];

  // The fare is recorded on the way out of this step rather than on every click, so
  // what gets stored is exactly what was on screen when the customer moved on.
  const continueToEquipment = () => {
    setFormData((prev) => ({ ...prev, price: prices[prev.vehicleType] }));
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
      await submitTransfer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // The customer's own words for both ends. The zones alongside are what the
        // fare was actually taken from, and only the operator ever sees them.
        pickup: formData.pickup.name,
        dropoff: formData.dropoff.name,
        pickupZone: quote.pickupZone,
        dropoffZone: quote.dropoffZone,
        pickupOffsetKm: quote.pickupOffsetKm,
        dropoffOffsetKm: quote.dropoffOffsetKm,
        date: formData.date,
        time: formData.time,
        passengers: formData.people,
        vehicleType: formData.vehicleType,
        price: formData.price,
        flightNumber: formData.flightNumber,
        luggage: formData.luggage,
        childSeat: formData.childSeat,
        notes: `${formData.notes}${
          formData.roundtrip
            ? `\nRoundtrip requested: Yes\nReturn Date: ${formData.returnDate}\nReturn Time: ${formData.returnTime}`
            : ""
        }`.trim(),
      });
      toast.success("Booking confirmed. Check your email for the details.");
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
            <LocationInput
              label="Pickup Location"
              value={formData.pickup}
              onChange={(value) => setFormData((prev) => ({ ...prev, pickup: value }))}
            />
            <LocationInput
              label="Drop off Location"
              value={formData.dropoff}
              onChange={(value) => setFormData((prev) => ({ ...prev, dropoff: value }))}
              placeholder="Search for your hotel"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput
              label="Pickup Date"
              value={formData.date}
              onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
            />
            <TimeInput
              label="Pickup Time"
              value={formData.time}
              onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
            />
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
          {formData.roundtrip && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Return Date"
                value={formData.returnDate}
                onChange={(returnDate) => setFormData((prev) => ({ ...prev, returnDate }))}
                min={formData.date}
              />
              <TimeInput
                label="Return Time"
                value={formData.returnTime}
                onChange={(returnTime) => setFormData((prev) => ({ ...prev, returnTime }))}
              />
            </div>
          )}
          <Button onClick={() => setStep(2)}>Continue to Select Car</Button>
        </div>
      )}

      {step === 2 && (
        // The cars on the left, the journey on the right. On a phone the summary drops
        // below the cars: the price beside each one is the question being answered, and
        // a screenful of itinerary before reaching them helps nobody.
        <div className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-primary">Select Car</h2>

            <RouteMap pickup={formData.pickup} dropoff={formData.dropoff} />

            <p className="text-xs text-muted-foreground">
              All prices include VAT, tolls and the driver's waiting time.
            </p>

            <div className="space-y-3">
              {fleet.map((vehicle) => (
                <VehicleRow
                  key={vehicle.type}
                  vehicle={vehicle}
                  price={prices[vehicle.type]}
                  roundtrip={formData.roundtrip}
                  selected={formData.vehicleType === vehicle.type}
                  onSelect={() =>
                    setFormData((prev) => ({ ...prev, vehicleType: vehicle.type }))
                  }
                />
              ))}
            </div>

            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <BookingSummary
              pickup={formData.pickup}
              dropoff={formData.dropoff}
              date={formData.date}
              time={formData.time}
              returnDate={formData.returnDate}
              returnTime={formData.returnTime}
              roundtrip={formData.roundtrip}
              people={formData.people}
              quote={quote}
              vehicle={formData.vehicleType}
            />
          </div>

          {/* Pinned to the foot of the screen so the chosen car and the way forward
              stay in reach however far down the list someone has scrolled. Taken out
              of the grid with position: fixed, which is also why the columns above
              carry the bottom padding. */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 p-3 backdrop-blur">
            <div className="container flex max-w-6xl items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm">
                <Car className="mr-1.5 inline h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">Your choice: </span>
                <span className="font-medium text-primary">{chosen.name}</span>
              </p>
              <Button className="shrink-0" onClick={continueToEquipment}>
                Continue
              </Button>
            </div>
          </div>
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

