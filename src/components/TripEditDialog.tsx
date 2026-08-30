import { useEffect, useState } from "react";
import { Minus, Plus, Repeat, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocationInput from "@/components/LocationInput";
import { DateInput, TimeInput } from "@/components/DateTimeInput";
import { LocationValue } from "@/lib/booking";
import { largestParty } from "@/lib/fleet";

// Changing the trip after prices are on screen. It opens over the results rather than
// sending anyone back a page: the fare beside each car is the thing being changed, and
// it should still be there when the change lands.
//
// Edits are kept in a draft until "See prices" is pressed, so closing the dialog by
// any other route leaves the booking exactly as it was.

export type TripDraft = {
  roundtrip: boolean;
  pickup: LocationValue | null;
  dropoff: LocationValue | null;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  people: string;
};

// The largest party we can carry, read off the fleet like the search form does. The
// dialog used to stop at 8 -- the minivan -- so a group that had booked the minibus
// from the homepage could not keep their headcount when they edited the trip.
const MAX_PEOPLE = largestParty;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: TripDraft;
  onSave: (value: TripDraft) => void;
  // Opened from "Add return": the return leg is already switched on, so the customer
  // lands on the fields they came for. Still only a draft until they press through.
  seedReturn?: boolean;
};

export default function TripEditDialog({
  open,
  onOpenChange,
  value,
  onSave,
  seedReturn,
}: Props) {
  const [draft, setDraft] = useState(value);

  // Reopening starts from what is actually booked, not from a half-finished edit that
  // was abandoned earlier.
  useEffect(() => {
    if (!open) return;

    setDraft(
      seedReturn && !value.roundtrip
        ? { ...value, roundtrip: true, returnDate: value.returnDate || value.date }
        : value,
    );
  }, [open, value, seedReturn]);

  const people = Number(draft.people) || 1;
  const setPeople = (next: number) =>
    setDraft((prev) => ({ ...prev, people: String(Math.min(MAX_PEOPLE, Math.max(1, next))) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Edit your trip</DialogTitle>
          <DialogDescription>
            Change any of it and we will price the journey again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <LocationInput
            label="From"
            value={draft.pickup}
            onChange={(pickup) => setDraft((prev) => ({ ...prev, pickup }))}
          />
          <LocationInput
            label="To"
            value={draft.dropoff}
            onChange={(dropoff) => setDraft((prev) => ({ ...prev, dropoff }))}
            placeholder="Search for your hotel"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateInput
              label="Pickup date"
              value={draft.date}
              onChange={(date) => setDraft((prev) => ({ ...prev, date }))}
            />
            <TimeInput
              label="Pickup time"
              value={draft.time}
              onChange={(time) => setDraft((prev) => ({ ...prev, time }))}
            />
          </div>

          {draft.roundtrip ? (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Return</span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      roundtrip: false,
                      returnDate: "",
                      returnTime: "12:00",
                    }))
                  }
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  Remove return
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateInput
                  label="Return date"
                  value={draft.returnDate}
                  onChange={(returnDate) => setDraft((prev) => ({ ...prev, returnDate }))}
                  min={draft.date}
                />
                <TimeInput
                  label="Return time"
                  value={draft.returnTime}
                  onChange={(returnTime) => setDraft((prev) => ({ ...prev, returnTime }))}
                />
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  roundtrip: true,
                  returnDate: prev.returnDate || prev.date,
                }))
              }
            >
              <Repeat className="mr-2 h-4 w-4" /> Add return
            </Button>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Passengers</p>
              <p className="text-2xl font-semibold tabular-nums text-primary">{people}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="One passenger fewer"
                disabled={people <= 1}
                onClick={() => setPeople(people - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="One passenger more"
                disabled={people >= MAX_PEOPLE}
                onClick={() => setPeople(people + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            <Search className="mr-2 h-4 w-4" /> See prices
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
