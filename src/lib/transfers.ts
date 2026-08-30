import { supabase } from "@/lib/supabase";
import { TransferRequest } from "@/types/transfer";

type TransferRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  pickup: string;
  dropoff: string;
  pickup_zone: string | null;
  dropoff_zone: string | null;
  // numeric again, so strings, and null on rows booked before hotel search existed.
  pickup_offset_km: string | number | null;
  dropoff_offset_km: string | number | null;
  transfer_date: string;
  transfer_time: string;
  // Columns since the reminders needed them. Null on rows whose return leg was only
  // ever a line of text in notes and could not be parsed back out.
  roundtrip: boolean | null;
  return_date: string | null;
  return_time: string | null;
  return_flight_number: string | null;
  passengers: string;
  vehicle_type: string | null;
  // numeric comes back from PostgREST as a string, so that it never loses precision
  // in JSON. Rows from before this column existed are null.
  price: string | number | null;
  flight_number: string | null;
  luggage: string | null;
  // Rows created by the old backend can have this null.
  child_seat: boolean | null;
  child_seats: number | null;
  booster_seats: number | null;
  notes: string | null;
};

export type NewTransfer = Omit<TransferRequest, "id" | "createdAt">;

function toTransferRequest(row: TransferRow): TransferRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    pickup: row.pickup,
    dropoff: row.dropoff,
    pickupZone: row.pickup_zone,
    dropoffZone: row.dropoff_zone,
    pickupOffsetKm: row.pickup_offset_km === null ? null : Number(row.pickup_offset_km),
    dropoffOffsetKm: row.dropoff_offset_km === null ? null : Number(row.dropoff_offset_km),
    date: row.transfer_date,
    time: row.transfer_time,
    roundtrip: Boolean(row.roundtrip),
    returnDate: row.return_date,
    returnTime: row.return_time,
    returnFlightNumber: row.return_flight_number,
    passengers: row.passengers,
    vehicleType: row.vehicle_type ?? "",
    price: row.price === null ? null : Number(row.price),
    flightNumber: row.flight_number ?? "",
    luggage: row.luggage ?? "",
    childSeat: Boolean(row.child_seat),
    childSeats: row.child_seats ?? 0,
    boosterSeats: row.booster_seats ?? 0,
    notes: row.notes ?? "",
  };
}

export async function submitTransfer(transfer: NewTransfer) {
  // Deliberately no .select() chained here. Visitors have an insert policy but no
  // select policy, so asking for the inserted row back would fail the whole write.
  const { error } = await supabase.from("transfers").insert({
    name: transfer.name,
    email: transfer.email,
    phone: transfer.phone || null,
    pickup: transfer.pickup,
    dropoff: transfer.dropoff,
    pickup_zone: transfer.pickupZone ?? null,
    dropoff_zone: transfer.dropoffZone ?? null,
    pickup_offset_km: transfer.pickupOffsetKm ?? null,
    dropoff_offset_km: transfer.dropoffOffsetKm ?? null,
    transfer_date: transfer.date,
    transfer_time: transfer.time,
    roundtrip: Boolean(transfer.roundtrip),
    // Empty string to null: the reminder query treats null as "no return leg", and a
    // blank string would be a leg it then failed to parse a date out of.
    return_date: transfer.returnDate || null,
    return_time: transfer.returnTime || null,
    return_flight_number: transfer.returnFlightNumber || null,
    passengers: transfer.passengers,
    vehicle_type: transfer.vehicleType || null,
    price: transfer.price ?? null,
    flight_number: transfer.flightNumber || null,
    luggage: transfer.luggage || null,
    child_seat: Boolean(transfer.childSeat),
    child_seats: transfer.childSeats ?? 0,
    booster_seats: transfer.boosterSeats ?? 0,
    notes: transfer.notes || null,
  });

  if (error) {
    throw new Error(error.message || "Could not submit booking.");
  }
}

export async function fetchTransfers(): Promise<TransferRequest[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load transfers.");
  }

  return (data ?? []).map(toTransferRequest);
}
