export type TransferRequest = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  vehicleType?: string;
  // The fare quoted at booking time. Null on routes we have no price for, and on
  // rows created before the price was recorded.
  price?: number | null;
  flightNumber?: string;
  luggage?: string;
  childSeat?: boolean;
  notes?: string;
};
