// Fares and route information for every destination we serve, keyed by the airport
// the transfer starts from or returns to.
//
// The two airports were priced separately and the operator's Chania list is the
// richer of the two: it carries an explicit roundtrip fare plus real driving time
// and distance, where the Heraklion list is one-way prices only. Both shapes live
// in the same table and the gaps are filled at lookup time, so a destination only
// ever appears once here.

export const HERAKLION_AIRPORT = "Heraklion Airport (HER)";
export const CHANIA_AIRPORT = "Chania Airport (CHQ)";

export const airportValues = [HERAKLION_AIRPORT, CHANIA_AIRPORT];

type Fare = {
  oneWay: number;
  // The operator's own roundtrip price, which is a little under twice the one-way
  // fare. Absent on the Heraklion list, where we fall back to doubling.
  roundTrip?: number;
  minutes?: number;
  km?: number;
};

type Destination = {
  name: string;
  her?: Fare;
  chq?: Fare;
};

// Grouped roughly west to east so the dropdown reads like the island looks.
const destinations: Destination[] = [
  // Airports and ports.
  { name: HERAKLION_AIRPORT, chq: { oneWay: 153, roundTrip: 299, minutes: 120, km: 148 } },
  // No fares of its own: an airport-to-airport trip is priced once, on the Heraklion
  // entry above, and getFare finds it from either direction. This is here so the
  // airport still appears in the dropdown.
  { name: CHANIA_AIRPORT },
  { name: "Heraklion Port", her: { oneWay: 15 }, chq: { oneWay: 162, roundTrip: 316, minutes: 120, km: 148 } },
  { name: "Chania Port (Souda)", her: { oneWay: 157 }, chq: { oneWay: 31, roundTrip: 61, minutes: 15, km: 15 } },
  { name: "Rethymno Port", chq: { oneWay: 76, roundTrip: 149, minutes: 61, km: 67 } },
  { name: "Agios Nikolaos Port", chq: { oneWay: 210, roundTrip: 410, minutes: 165, km: 208 } },
  { name: "Ierapetra Port", chq: { oneWay: 244, roundTrip: 476, minutes: 191, km: 240 } },
  { name: "Sitia Port", chq: { oneWay: 421, roundTrip: 821, minutes: 229, km: 274 } },
  { name: "Sitia Airport (JSH)", chq: { oneWay: 270, roundTrip: 527, minutes: 232, km: 275 } },

  // Chania region.
  { name: "Chania City / Hotel", her: { oneWay: 157 }, chq: { oneWay: 33, roundTrip: 65, minutes: 15, km: 16 } },
  { name: "Daratso / Agioi Apostoloi", chq: { oneWay: 48, roundTrip: 94, minutes: 20, km: 18 } },
  { name: "Stalos", chq: { oneWay: 48, roundTrip: 94, minutes: 23, km: 21 } },
  { name: "Agia Marina (Chania)", her: { oneWay: 162 }, chq: { oneWay: 53, roundTrip: 104, minutes: 26, km: 24 } },
  { name: "Platanias (Chania)", her: { oneWay: 162 }, chq: { oneWay: 58, roundTrip: 114, minutes: 27, km: 26 } },
  { name: "Gerani (Chania)", chq: { oneWay: 58, roundTrip: 114, minutes: 28, km: 28 } },
  { name: "Maleme", her: { oneWay: 164 }, chq: { oneWay: 63, roundTrip: 123, minutes: 31, km: 32 } },
  { name: "Kolymbari", her: { oneWay: 169 }, chq: { oneWay: 70, roundTrip: 137, minutes: 38, km: 43 } },
  { name: "Kastelli (Kissamos)", her: { oneWay: 181 }, chq: { oneWay: 88, roundTrip: 172, minutes: 46, km: 52 } },
  { name: "Falasarna", chq: { oneWay: 105, roundTrip: 205, minutes: 63, km: 67 } },
  { name: "Elafonisi", chq: { oneWay: 125, roundTrip: 244, minutes: 98, km: 89 } },
  { name: "Paleochora", her: { oneWay: 234 }, chq: { oneWay: 128, roundTrip: 250, minutes: 91, km: 86 } },
  { name: "Samonas", chq: { oneWay: 62, roundTrip: 121, minutes: 40, km: 39 } },
  { name: "Kalyves / Almirida", her: { oneWay: 122 }, chq: { oneWay: 58, roundTrip: 114, minutes: 33, km: 31 } },
  { name: "Georgioupolis", her: { oneWay: 110 }, chq: { oneWay: 70, roundTrip: 137, minutes: 42, km: 46 } },
  { name: "Chora Sfakion / Sfakia", her: { oneWay: 148 }, chq: { oneWay: 143, roundTrip: 279, minutes: 87, km: 76 } },
  { name: "Frangokastello", her: { oneWay: 134 }, chq: { oneWay: 144, roundTrip: 281, minutes: 99, km: 87 } },

  // Rethymno region.
  { name: "Rethymno City / Hotel", her: { oneWay: 87 }, chq: { oneWay: 92, roundTrip: 180, minutes: 59, km: 68 } },
  { name: "Platanias (Rethymno)", chq: { oneWay: 99, roundTrip: 194, minutes: 67, km: 76 } },
  { name: "Adelianos Kampos / Adele", her: { oneWay: 84 }, chq: { oneWay: 97, roundTrip: 190, minutes: 64, km: 73 } },
  { name: "Scaleta", her: { oneWay: 75 }, chq: { oneWay: 95, roundTrip: 186, minutes: 69, km: 80 } },
  { name: "Panormo", her: { oneWay: 69 }, chq: { oneWay: 116, roundTrip: 227, minutes: 76, km: 88 } },
  { name: "Bali", her: { oneWay: 65 }, chq: { oneWay: 131, roundTrip: 256, minutes: 86, km: 98 } },
  { name: "Plakias", her: { oneWay: 122 }, chq: { oneWay: 143, roundTrip: 279, minutes: 89, km: 98 } },
  { name: "Agia Galini", her: { oneWay: 87 }, chq: { oneWay: 165, roundTrip: 322, minutes: 101, km: 115 } },
  { name: "Agios Pavlos", chq: { oneWay: 134, roundTrip: 262, minutes: 109, km: 113 } },

  // Heraklion region.
  { name: "Agia Pelagia", her: { oneWay: 38 }, chq: { oneWay: 142, roundTrip: 277, minutes: 107, km: 127 } },
  { name: "Ligaria", her: { oneWay: 30 }, chq: { oneWay: 142, roundTrip: 277, minutes: 109, km: 128 } },
  { name: "Fodele", her: { oneWay: 38 }, chq: { oneWay: 132, roundTrip: 258, minutes: 103, km: 122 } },
  { name: "Ammoudara (Heraklion)", her: { oneWay: 24 }, chq: { oneWay: 159, roundTrip: 311, minutes: 116, km: 138 } },
  { name: "Arolithos - Cretan Village", her: { oneWay: 28 }, chq: { oneWay: 155, roundTrip: 303, minutes: 118, km: 140 } },
  { name: "Heraklion City / Hotel", her: { oneWay: 15 }, chq: { oneWay: 162, roundTrip: 316, minutes: 120, km: 148 } },
  { name: "P.A.G.N.I", her: { oneWay: 23 } },
  { name: "Archanes", her: { oneWay: 28 } },
  { name: "Amnissos / Karteros", her: { oneWay: 17 }, chq: { oneWay: 155, roundTrip: 303, minutes: 124, km: 152 } },
  { name: "Kokkini Hani", her: { oneWay: 24 }, chq: { oneWay: 165, roundTrip: 322, minutes: 127, km: 157 } },
  { name: "Creta Aquarium - Gournes", her: { oneWay: 24 }, chq: { oneWay: 167, roundTrip: 326, minutes: 131, km: 160 } },
  { name: "Anopolis - Water City", chq: { oneWay: 172, roundTrip: 336, minutes: 132, km: 159 } },
  { name: "Gouves", her: { oneWay: 28 }, chq: { oneWay: 167, roundTrip: 326, minutes: 133, km: 164 } },
  { name: "Analipsi", her: { oneWay: 33 }, chq: { oneWay: 175, roundTrip: 342, minutes: 134, km: 166 } },
  { name: "Anissaras", her: { oneWay: 33 }, chq: { oneWay: 176, roundTrip: 344, minutes: 138, km: 169 } },
  { name: "Chersonissos", her: { oneWay: 37 }, chq: { oneWay: 176, roundTrip: 344, minutes: 137, km: 170 } },
  { name: "Koutouloufari", her: { oneWay: 37 }, chq: { oneWay: 176, roundTrip: 344, minutes: 137, km: 171 } },
  { name: "Piskopiano", her: { oneWay: 37 }, chq: { oneWay: 176, roundTrip: 344, minutes: 137, km: 170 } },
  { name: "Stalis / Stalida", her: { oneWay: 39 }, chq: { oneWay: 201, roundTrip: 392, minutes: 172, km: 190 } },
  { name: "Malia", her: { oneWay: 42 }, chq: { oneWay: 184, roundTrip: 359, minutes: 142, km: 179 } },

  // Heraklion south coast.
  { name: "Kalamaki", chq: { oneWay: 146, roundTrip: 285, minutes: 126, km: 135 } },
  { name: "Kamilari", chq: { oneWay: 142, roundTrip: 277, minutes: 122, km: 133 } },
  { name: "Matala", her: { oneWay: 73 }, chq: { oneWay: 199, roundTrip: 389, minutes: 133, km: 145 } },
  { name: "Kokinos Pyrgos", chq: { oneWay: 138, roundTrip: 270, minutes: 111, km: 124 } },
  { name: "Lentas", chq: { oneWay: 173, roundTrip: 338, minutes: 163, km: 170 } },
  { name: "Tsoutsouros", chq: { oneWay: 198, roundTrip: 387, minutes: 257, km: 297 } },

  // Lasithi.
  { name: "Sissi", her: { oneWay: 50 }, chq: { oneWay: 194, roundTrip: 379, minutes: 228, km: 274 } },
  { name: "Milatos", her: { oneWay: 60 }, chq: { oneWay: 201, roundTrip: 392, minutes: 155, km: 192 } },
  { name: "Agios Nikolaos City / Hotel", her: { oneWay: 73 }, chq: { oneWay: 210, roundTrip: 410, minutes: 165, km: 208 } },
  { name: "Ammoudara (Agios Nikolaos)", her: { oneWay: 73 }, chq: { oneWay: 218, roundTrip: 426, minutes: 168, km: 211 } },
  { name: "Elounda", her: { oneWay: 78 }, chq: { oneWay: 223, roundTrip: 435, minutes: 172, km: 214 } },
  { name: "Plaka Eloundas", her: { oneWay: 84 }, chq: { oneWay: 229, roundTrip: 447, minutes: 180, km: 218 } },
  { name: "Istron / Kalo Horio", her: { oneWay: 84 }, chq: { oneWay: 227, roundTrip: 443, minutes: 170, km: 218 } },
  { name: "Mochlos", chq: { oneWay: 244, roundTrip: 476, minutes: 205, km: 242 } },
  { name: "Ierapetra City / Hotel", her: { oneWay: 106 }, chq: { oneWay: 244, roundTrip: 476, minutes: 191, km: 240 } },
  { name: "Koutsounari / Ferma", her: { oneWay: 113 }, chq: { oneWay: 248, roundTrip: 484, minutes: 200, km: 245 } },
  { name: "Makri Gialos", her: { oneWay: 125 }, chq: { oneWay: 252, roundTrip: 492, minutes: 199, km: 251 } },
  { name: "Sitia City / Hotel", her: { oneWay: 167 }, chq: { oneWay: 270, roundTrip: 527, minutes: 229, km: 274 } },
  { name: "Palekastro", her: { oneWay: 174 }, chq: { oneWay: 445, roundTrip: 868, minutes: 248, km: 290 } },
  { name: "Vai", chq: { oneWay: 460, roundTrip: 897, minutes: 265, km: 300 } },
  { name: "Kato Zakros", chq: { oneWay: 484, roundTrip: 944, minutes: 282, km: 316 } },
];

const OTHER_LOCATION = "Other (specify in notes)";

export const popularLocations = [...destinations.map((d) => d.name), OTHER_LOCATION];

const destinationsByName = new Map(destinations.map((d) => [d.name, d]));

function fareFrom(airport: string, other: string): Fare | null {
  const destination = destinationsByName.get(other);
  if (!destination) return null;
  return (airport === HERAKLION_AIRPORT ? destination.her : destination.chq) ?? null;
}

// Every fare we have is measured from an airport, so one end of the trip has to be
// one. Both ends being airports is a real booking (HER to CHQ), and only one of the
// two directions is priced, hence the second attempt.
function getFare(pickup: string, dropoff: string): Fare | null {
  const fromPickup = airportValues.includes(pickup) ? fareFrom(pickup, dropoff) : null;
  if (fromPickup) return fromPickup;

  return airportValues.includes(dropoff) ? fareFrom(dropoff, pickup) : null;
}

export type VehicleType = "sedan" | "estate" | "van";

export const vehicleLabels: Record<VehicleType, string> = {
  sedan: "Mercedes E-Class Sedan",
  estate: "Mercedes E-Class Estate",
  van: "Minivan Mercedes V-Class",
};

// The estate carries the same passengers as the sedan and only adds boot space,
// so it costs the same. The van is a bigger car with a bigger driver's fee.
const vehicleMultipliers: Record<VehicleType, number> = {
  sedan: 1,
  estate: 1,
  van: 1.3,
};

export function getVehiclePrice(
  pickup: string,
  dropoff: string,
  vehicle: VehicleType,
  roundtrip: boolean,
): number | null {
  const fare = getFare(pickup, dropoff);
  if (!fare) return null;

  // Doubling is only a fallback. Where the operator priced the return leg it comes
  // in a little under twice the one-way fare, and that discount should survive.
  const base = roundtrip ? fare.roundTrip ?? fare.oneWay * 2 : fare.oneWay;

  return Math.round(base * vehicleMultipliers[vehicle]);
}

// Falls back to an estimate for the Heraklion routes, which were never measured.
// The multipliers come from the Chania list, where roughly 1.2 km and 1 minute of
// driving map onto each euro of fare.
export function getRouteStats(pickup: string, dropoff: string) {
  const fare = getFare(pickup, dropoff);
  if (!fare) return { km: 30, minutes: 25 };

  return {
    km: fare.km ?? Math.max(8, Math.round(fare.oneWay * 1.2)),
    minutes: fare.minutes ?? Math.max(8, Math.round(fare.oneWay)),
  };
}
