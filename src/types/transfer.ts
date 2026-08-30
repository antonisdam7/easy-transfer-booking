export type TransferRequest = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  // What the customer chose, in their words: usually a hotel name.
  pickup: string;
  dropoff: string;
  // The priced zone each end was charged as, and how far it sat from that zone.
  // Operator-facing only, and null on bookings made before the hotel search existed.
  pickupZone?: string | null;
  dropoffZone?: string | null;
  pickupOffsetKm?: number | null;
  dropoffOffsetKm?: number | null;
  date: string;
  time: string;
  // The return leg, when there is one. These were a sentence inside `notes` until the
  // reminders needed a date a scheduler could read; on bookings taken before that they
  // are backfilled from the old text.
  roundtrip?: boolean;
  returnDate?: string | null;
  returnTime?: string | null;
  returnFlightNumber?: string | null;
  passengers: string;
  vehicleType?: string;
  // The fare quoted at booking time. Null on routes we have no price for, and on
  // rows created before the price was recorded.
  price?: number | null;
  flightNumber?: string;
  luggage?: string;
  // True when any seat was asked for. Superseded by the two counts below, and kept
  // for bookings taken before they existed.
  childSeat?: boolean;
  childSeats?: number;
  boosterSeats?: number;
  notes?: string;
};
