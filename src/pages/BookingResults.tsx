import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Car, Plane, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
    // Kept apart from the outward flight: the operator needs to know which plane to
    // get the customer to, not only which one they arrived on.
    returnFlightNumber: "",
    luggage: "",
    childSeat: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  };
}

// A disclosure the customer opens themselves. The cross tells them the section is
// already showing and clicking again puts it away.
function Pill({
  open,
  onClick,
  children,
}: {
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors",
        open
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:border-primary/40 hover:bg-muted",
      )}
    >
      {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export default function BookingResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [formData, setFormData] = useState(() => getInitialState(location.search));

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
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    if (!fullName || !formData.email || !formData.pickup || !formData.dropoff || !formData.date || !formData.time || !formData.people) {
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
        name: fullName,
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
        notes: [
          formData.notes,
          formData.returnFlightNumber && `Return flight: ${formData.returnFlightNumber}`,
          formData.roundtrip &&
            `Roundtrip requested: Yes\nReturn Date: ${formData.returnDate}\nReturn Time: ${formData.returnTime}`,
        ]
          .filter(Boolean)
          .join("\n")
          .trim(),
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
    <section className="container max-w-6xl space-y-8 py-10">
      {step === 1 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h1 className="font-display text-2xl font-bold text-primary">Edit your trip</h1>
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
          <Button onClick={() => setStep(2)}>Continue</Button>
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
              onEdit={() => setStep(1)}
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
        <form onSubmit={submitBooking} className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section className="space-y-5 rounded-lg border bg-card p-6">
              <h2 className="font-display text-xl font-bold text-primary">Booking details</h2>

              {isAirportTransfer && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="flight">Flight number</Label>
                    <p className="text-sm text-muted-foreground">
                      Your driver tracks the flight and adjusts the pickup time, at no extra cost.
                    </p>
                    <div className="relative">
                      <Plane className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="flight"
                        className="pl-9"
                        placeholder="e.g. A3 802"
                        value={formData.flightNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, flightNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formData.roundtrip && (
                    <div className="space-y-1.5">
                      <Label htmlFor="return-flight">Return flight number</Label>
                      <p className="text-sm text-muted-foreground">
                        The flight you are leaving on, so we get you there in time.
                      </p>
                      <div className="relative">
                        <Plane className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="return-flight"
                          className="pl-9"
                          placeholder="e.g. A3 803"
                          value={formData.returnFlightNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, returnFlightNumber: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1.5">
                <Label>Luggage</Label>
                <Select
                  value={formData.luggage}
                  onValueChange={(luggage) => setFormData((prev) => ({ ...prev, luggage }))}
                >
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

              {/* Folded away until asked for. Most bookings need neither, and two empty
                  boxes on the page invite people to wonder what belongs in them. */}
              <div className="flex flex-wrap gap-2 border-t pt-5">
                <Pill
                  open={formData.childSeat}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, childSeat: !prev.childSeat }))
                  }
                >
                  Need a child seat?
                </Pill>
                <Pill open={showNotes} onClick={() => setShowNotes((open) => !open)}>
                  Add notes for the driver
                </Pill>
              </div>

              {formData.childSeat && (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                  <p className="font-medium text-primary">Child seat added — free of charge</p>
                  <p className="mt-1 text-muted-foreground">
                    Put the child's age and weight in the notes below and we will bring the right
                    seat.
                  </p>
                </div>
              )}

              {showNotes && (
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes for the driver</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              )}
            </section>

            <section className="space-y-5 rounded-lg border bg-card p-6">
              <h2 className="font-display text-xl font-bold text-primary">Lead passenger</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name">First name *</Label>
                  <Input
                    id="first-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name">Last name *</Label>
                  <Input
                    id="last-name"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <p className="text-sm text-muted-foreground">Your confirmation goes here.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+30 697 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  How the driver reaches you on the day. WhatsApp works.
                </p>
              </div>
            </section>

            <Button type="button" variant="outline" onClick={() => setStep(2)}>
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
              chosen={chosen}
              onEdit={() => setStep(1)}
            />
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 p-3 backdrop-blur">
            <div className="container flex max-w-6xl items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-bold text-primary">
                  {formData.price === null ? "To be confirmed" : `€${formData.price}`}
                </span>
              </p>
              <Button type="submit" className="shrink-0" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Request Booking"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

