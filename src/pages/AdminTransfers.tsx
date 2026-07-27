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

export default function AdminTransfers() {
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
                      <TableCell>{`${transfer.pickup} -> ${transfer.dropoff}`}</TableCell>
                      <TableCell>{formatDateTime(transfer.date, transfer.time)}</TableCell>
                      <TableCell>{transfer.passengers}</TableCell>
                      <TableCell>{transfer.vehicleType || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {transfer.price == null ? "-" : `€${transfer.price}`}
                      </TableCell>
                      <TableCell>
                        {transfer.flightNumber ? `Flight: ${transfer.flightNumber}` : ""}
                        {transfer.flightNumber && transfer.luggage ? " | " : ""}
                        {transfer.luggage ? `Luggage: ${transfer.luggage}` : ""}
                        {(transfer.flightNumber || transfer.luggage) && transfer.childSeat ? " | " : ""}
                        {transfer.childSeat ? "Child seat" : ""}
                        {!transfer.flightNumber && !transfer.luggage && !transfer.childSeat ? "-" : ""}
                      </TableCell>
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
