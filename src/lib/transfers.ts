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
  transfer_date: string;
  transfer_time: string;
  passengers: string;
  vehicle_type: string | null;
  // numeric comes back from PostgREST as a string, so that it never loses precision
  // in JSON. Rows from before this column existed are null.
  price: string | number | null;
  flight_number: string | null;
  luggage: string | null;
  // Rows created by the old backend can have this null.
  child_seat: boolean | null;
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
    date: row.transfer_date,
    time: row.transfer_time,
    passengers: row.passengers,
    vehicleType: row.vehicle_type ?? "",
    price: row.price === null ? null : Number(row.price),
    flightNumber: row.flight_number ?? "",
    luggage: row.luggage ?? "",
    childSeat: Boolean(row.child_seat),
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
    transfer_date: transfer.date,
    transfer_time: transfer.time,
    passengers: transfer.passengers,
    vehicle_type: transfer.vehicleType || null,
    price: transfer.price ?? null,
    flight_number: transfer.flightNumber || null,
    luggage: transfer.luggage || null,
    child_seat: Boolean(transfer.childSeat),
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
