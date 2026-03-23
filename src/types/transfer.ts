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
  flightNumber?: string;
  luggage?: string;
  childSeat?: boolean;
  notes?: string;
};
