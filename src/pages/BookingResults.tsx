import { useSeo } from "@/hooks/useSeo";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Car, Plane, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitTransfer } from "@/lib/transfers";
import RouteMap from "@/components/RouteMap";
import TripEditDialog, { TripDraft } from "@/components/TripEditDialog";
import ChildSeats from "@/components/ChildSeats";
import BookingSummary from "@/components/BookingSummary";
import VehicleRow from "@/components/VehicleRow";
import { fleet } from "@/lib/fleet";
import {
  airportValues,
  locationFromParams,
  quoteTrip,
  VehicleType,
} from "@/lib/booking";
import {
  trackBooking,
  trackDetailsReached,
  trackResultsViewed,
  trackVehicleChosen,
} from "@/lib/analytics";


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
    // Counted, not ticked: a driver needs to know whether to bring a rear-facing seat
    // for a baby or a booster for an eight-year-old, and how many of each.
    childSeats: 0,
    boosterSeats: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  };
}

// What was chosen and the way forward, floating clear of the page at the foot of the
// screen. Fixed rather than in flow, so it stays in reach however far down someone
// has scrolled -- which is also why the columns above carry bottom padding.
//
// It sits over the left column only on wide screens: the summary panel on the right
// is already the thing it would otherwise be repeating.
function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 sm:p-4">
      <div className="container max-w-7xl">
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur sm:p-4 lg:mr-[25.5rem]">
          {children}
        </div>
      </div>
    </div>
  );
}

// The summary beside the page. It used to be a scroll box of its own, which put a
// second scrollbar down the middle of the page; now it simply follows the page.
//
// It only sticks where there is room for the whole panel to stand still -- pinning it
// on a short window would leave the price details below the fold with no way to reach
// them.
function SummaryColumn({ children }: { children: ReactNode }) {
  return (
    <div className="lg:self-start [@media(min-height:56rem)]:lg:sticky [@media(min-height:56rem)]:lg:top-6">
      {children}
    </div>
  );
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
  useSeo("/booking-results");

  const location = useLocation();
  const navigate = useNavigate();
  // Two steps: choose the car, then say who is travelling. Changing the trip itself is
  // a dialog over whichever of them is open, not a page of its own.
  const [step, setStep] = useState<"vehicle" | "details">("vehicle");
  // Null when closed. "return" is the same dialog reached from Add return.
  const [editing, setEditing] = useState<null | "trip" | "return">(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSeats, setShowSeats] = useState(false);
  const [formData, setFormData] = useState(() => getInitialState(location.search));

  // Only the trip fields go into the dialog. Everything else on the booking is
  // untouched by it. Held steady between renders because the dialog reloads its draft
  // whenever this changes, and a fresh object each render would undo every keystroke.
  const trip = useMemo<TripDraft>(
    () => ({
      roundtrip: formData.roundtrip,
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      date: formData.date,
      time: formData.time,
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
      people: formData.people,
    }),
    [
      formData.roundtrip,
      formData.pickup,
      formData.dropoff,
      formData.date,
      formData.time,
      formData.returnDate,
      formData.returnTime,
      formData.people,
    ],
  );

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

  // A party of five in a sedan is not a booking, it is a driver turning people away at
  // the kerb. Cars that cannot seat everyone are dimmed rather than removed, so the
  // cheaper fare stays visible and it is clear why it is not on offer.
  const people = Number(formData.people) || 1;

  // If the party grows past what the chosen car holds -- which can happen from the edit
  // dialog, after the choice was made -- move to one that fits, so the fare in the
  // panel is a fare we could actually honour.
  useEffect(() => {
    const current = fleet.find((vehicle) => vehicle.type === formData.vehicleType);
    if (!current || current.passengers >= people) return;

    const roomy = fleet.find((vehicle) => vehicle.passengers >= people);
    if (roomy) setFormData((prev) => ({ ...prev, vehicleType: roomy.type }));
  }, [people, formData.vehicleType]);

  // The second step of the funnel: a search that actually produced prices. The gap
  // between this and the search before it is people who never got a quote at all.
  //
  // Keyed on the two place names rather than on the objects, so re-pricing after an
  // edit to the date or the party size does not count as a second arrival.
  const pickupName = formData.pickup?.name;
  const dropoffName = formData.dropoff?.name;
  useEffect(() => {
    if (pickupName && dropoffName) trackResultsViewed(pickupName, dropoffName);
  }, [pickupName, dropoffName]);

  // Both steps are a full page long, so whichever one is being left was almost
  // certainly scrolled down. Landing halfway into the next one hides the heading that
  // says where you now are.
  const goToStep = (next: "vehicle" | "details") => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  // The fare is recorded on the way out of this step rather than on every click, so
  // what gets stored is exactly what was on screen when the customer moved on.
  const continueToEquipment = () => {
    trackDetailsReached(formData.vehicleType, prices[formData.vehicleType]);
    setFormData((prev) => ({ ...prev, price: prices[prev.vehicleType] }));
    goToStep("details");
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    // The trip itself has no fields on this page -- it is edited in the dialog -- so a
    // gap in it has to be named and the dialog opened on it. Saying only that something
    // is missing left the customer looking at a page of filled-in boxes.
    const tripGap = [
      { missing: !formData.pickup, label: "where we are picking you up" },
      { missing: !formData.dropoff, label: "where you are going" },
      { missing: !formData.date, label: "the date of your transfer" },
      { missing: !formData.time, label: "your pickup time" },
      { missing: !formData.people, label: "how many of you are travelling" },
      { missing: formData.roundtrip && !formData.returnDate, label: "your return date" },
      { missing: formData.roundtrip && !formData.returnTime, label: "your return time" },
    ].find((field) => field.missing);

    if (tripGap) {
      toast.error(`Please add ${tripGap.label}.`);
      setEditing("trip");
      return;
    }
    // The browser stops an empty name or email before this runs, so this is only a
    // backstop for a form submitted some other way.
    if (!fullName || !formData.email) {
      toast.error("Please give us the lead passenger's name and email address.");
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
        // The return leg as its own fields rather than a sentence appended to the
        // notes. It used to be the latter, which was legible to the operator and to
        // nobody else -- and the 48-hour reminder has to be scheduled off the return
        // time, which means something other than a person has to be able to read it.
        roundtrip: formData.roundtrip,
        returnDate: formData.roundtrip ? formData.returnDate : null,
        returnTime: formData.roundtrip ? formData.returnTime : null,
        returnFlightNumber: formData.returnFlightNumber || null,
        passengers: formData.people,
        vehicleType: formData.vehicleType,
        price: formData.price,
        flightNumber: formData.flightNumber,
        luggage: formData.luggage,
        childSeats: formData.childSeats,
        boosterSeats: formData.boosterSeats,
        // Kept in step with the counts so bookings made before seats were counted,
        // and anything still reading the old column, stay meaningful.
        childSeat: formData.childSeats + formData.boosterSeats > 0,
        // Only what the customer actually wrote. The return details used to be
        // concatenated on here; they are columns now, and duplicating them would
        // give the operator two sources for one fact.
        notes: formData.notes.trim(),
      });
      // After the insert succeeded, never before it. A booking counted at the moment
      // the button was pressed would put failed submissions in the revenue figures.
      trackBooking(formData.vehicleType, formData.price, formData.roundtrip);

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
    <section className="container max-w-7xl space-y-8 py-10">
      <TripEditDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        value={trip}
        seedReturn={editing === "return"}
        onSave={(next) => setFormData((prev) => ({ ...prev, ...next }))}
      />

      {step === "vehicle" && (
        // The cars on the left, the journey on the right. On a phone the summary drops
        // below the cars: the price beside each one is the question being answered, and
        // a screenful of itinerary before reaching them helps nobody.
        <div className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {/* No heading and no Back button: the map says where, the rows say what is
              being chosen, and Edit in the summary is the one way back. */}
          <div className="space-y-4">
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
                  unavailable={
                    vehicle.passengers < people
                      ? `Seats ${vehicle.passengers}, and you are ${people}`
                      : undefined
                  }
                  onSelect={() => {
                    trackVehicleChosen(vehicle.type, prices[vehicle.type]);
                    setFormData((prev) => ({ ...prev, vehicleType: vehicle.type }));
                  }}
                />
              ))}
            </div>
          </div>

          <SummaryColumn>
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
              onEdit={() => setEditing("trip")}
              onAddReturn={() => setEditing("return")}
            />
          </SummaryColumn>

          <ActionBar>
            <p className="min-w-0 truncate text-sm">
              <Car className="mr-1.5 inline h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">Your choice: </span>
              <span className="font-medium text-primary">{chosen.name}</span>
            </p>
            <Button size="lg" className="shrink-0" onClick={continueToEquipment}>
              Continue
            </Button>
          </ActionBar>
        </div>
      )}

      {step === "details" && (
        <form onSubmit={submitBooking} className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_24rem]">
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
                  open={showSeats}
                  onClick={() => {
                    // Closing it puts the seats back to none, so a panel that is out
                    // of sight cannot leave a seat on the booking.
                    if (showSeats) {
                      setFormData((prev) => ({ ...prev, childSeats: 0, boosterSeats: 0 }));
                    }
                    setShowSeats((open) => !open);
                  }}
                >
                  Need a child or booster seat?
                </Pill>
                <Pill open={showNotes} onClick={() => setShowNotes((open) => !open)}>
                  Add notes for the driver
                </Pill>
              </div>

              {showSeats && (
                <ChildSeats
                  value={{
                    childSeats: formData.childSeats,
                    boosterSeats: formData.boosterSeats,
                  }}
                  onChange={(seats) => setFormData((prev) => ({ ...prev, ...seats }))}
                />
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

            <Button type="button" variant="outline" onClick={() => goToStep("vehicle")}>
              Back
            </Button>
          </div>

          <SummaryColumn>
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
              onEdit={() => setEditing("trip")}
              onAddReturn={() => setEditing("return")}
            />
          </SummaryColumn>

          {/* The same line as the step before it, so the bar does not change its mind
              about what it is for halfway through a booking. The total is not repeated
              here: it is already the largest thing in the panel alongside. */}
          <ActionBar>
            <p className="min-w-0 truncate text-sm">
              <Car className="mr-1.5 inline h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">Your choice: </span>
              <span className="font-medium text-primary">{chosen.name}</span>
            </p>
            <Button type="submit" size="lg" className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Book now"}
            </Button>
          </ActionBar>
        </form>
      )}
    </section>
  );
}

