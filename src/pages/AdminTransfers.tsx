import { useSeo } from "@/hooks/useSeo";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { signOut } from "@/lib/auth";
import { fetchTransfers } from "@/lib/transfers";
import { TransferRequest } from "@/types/transfer";

function formatDateTime(date: string, time: string) {
  return `${date} ${time}`;
}

// The way back, on its own line under the outward one.
//
// This used to arrive as part of the notes, because that is where the booking form
// put it. It is columns now, so it has to be read from them -- otherwise a return
// booked today would show in this table as a one-way trip.
function ReturnLeg({ transfer }: { transfer: TransferRequest }) {
  if (!transfer.roundtrip) return null;

  const when = transfer.returnDate
    ? formatDateTime(transfer.returnDate, transfer.returnTime ?? "")
    : "date not recorded";

  return <div className="text-xs text-muted-foreground">{`return ${when}`}</div>;
}

// Which priced zone a hotel was charged as, and how far it sat from it. Shown only
// when it differs from what the customer typed, so a booking made straight from an
// airport or a village name stays a single line.
function zoneNote(place: string, zone: string | null, offsetKm: number | null) {
  if (!zone || zone === place) return null;
  return offsetKm === null ? zone : `${zone}, ${offsetKm} km`;
}

// Which seats to load. Bookings taken before the two kinds were counted have the
// boolean only, and say so rather than claiming a count of zero.
function seatSummary(transfer: TransferRequest) {
  const parts = [
    transfer.childSeats ? `${transfer.childSeats} child` : "",
    transfer.boosterSeats ? `${transfer.boosterSeats} booster` : "",
  ].filter(Boolean);

  return parts.length > 0 ? `Seats: ${parts.join(" + ")}` : "Child seat";
}

// Flight, luggage and seats, joined only where there is something on both sides.
//
// This was written inline as a run of conditional separators, one per gap, which was
// already hard to read at three fields and became wrong at four: the return flight
// hung off a separator that tested the outward one. Building the list first and
// joining it once cannot get that wrong however many fields arrive later.
function extrasSummary(transfer: TransferRequest): string {
  const flights = [
    transfer.flightNumber && `Flight: ${transfer.flightNumber}`,
    transfer.returnFlightNumber && `Return flight: ${transfer.returnFlightNumber}`,
  ].filter(Boolean);

  const parts = [
    ...flights,
    transfer.luggage && `Luggage: ${transfer.luggage}`,
    transfer.childSeat && seatSummary(transfer),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "-";
}

function RouteZones({ transfer }: { transfer: TransferRequest }) {
  const notes = [
    zoneNote(transfer.pickup, transfer.pickupZone, transfer.pickupOffsetKm),
    zoneNote(transfer.dropoff, transfer.dropoffZone, transfer.dropoffOffsetKm),
  ].filter(Boolean);

  if (notes.length === 0) return null;

  return <div className="text-xs text-muted-foreground">{`priced as ${notes.join(" / ")}`}</div>;
}

export default function AdminTransfers() {
  useSeo("/admin");

  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      setTransfers(await fetchTransfers());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load transfers.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-card border-border/60">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-display text-primary">Transfer Requests</CardTitle>
              <CardDescription>All bookings submitted from your website form.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={loadTransfers} disabled={isLoading}>
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Extras</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      Loading transfer requests...
                    </TableCell>
                  </TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      No transfers yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{new Date(transfer.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{transfer.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{transfer.email}</div>
                          <div className="text-muted-foreground">{transfer.phone || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{`${transfer.pickup} -> ${transfer.dropoff}`}</div>
                          <RouteZones transfer={transfer} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatDateTime(transfer.date, transfer.time)}</div>
                          <ReturnLeg transfer={transfer} />
                        </div>
                      </TableCell>
                      <TableCell>{transfer.passengers}</TableCell>
                      <TableCell>{transfer.vehicleType || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {transfer.price == null ? "-" : `€${transfer.price}`}
                      </TableCell>
                      <TableCell>{extrasSummary(transfer)}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap">
                        {transfer.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
