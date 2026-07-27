// Fares and route information for every destination we serve, keyed by the airport
// the transfer starts from or returns to.
//
// The two airports were priced separately and the operator's Chania list is the
// richer of the two: it carries real driving time and distance, where the Heraklion
// list is prices only. Both shapes live in the same table and the gaps are filled at
// lookup time, so a destination only ever appears once here.

export const HERAKLION_AIRPORT = "Heraklion Airport (HER)";
export const CHANIA_AIRPORT = "Chania Airport (CHQ)";

export const airportValues = [HERAKLION_AIRPORT, CHANIA_AIRPORT];

type Fare = {
  oneWay: number;
  minutes?: number;
  km?: number;
};

// A return trip is charged as one full leg plus a second leg at 20% off.
//
// The Chania list arrived with its own roundtrip column, priced at roughly 1.95x the
// one-way fare. Those figures are deliberately not kept: the operator asked for a
// single discount across both airports, so deriving every roundtrip from one number
// is what keeps the two halves of the island consistent.
const ROUNDTRIP_MULTIPLIER = 1.8;

type Destination = {
  name: string;
  her?: Fare;
  chq?: Fare;
};

// Grouped roughly west to east so the dropdown reads like the island looks.
const destinations: Destination[] = [
  // Airports and ports.
  { name: HERAKLION_AIRPORT, chq: { oneWay: 153, minutes: 120, km: 148 } },
  // No fares of its own: an airport-to-airport trip is priced once, on the Heraklion
  // entry above, and getFare finds it from either direction. This is here so the
  // airport still appears in the dropdown.
  { name: CHANIA_AIRPORT },
  { name: "Heraklion Port", her: { oneWay: 15 }, chq: { oneWay: 162, minutes: 120, km: 148 } },
  { name: "Chania Port (Souda)", her: { oneWay: 157 }, chq: { oneWay: 31, minutes: 15, km: 15 } },
  { name: "Rethymno Port", chq: { oneWay: 76, minutes: 61, km: 67 } },
  { name: "Agios Nikolaos Port", chq: { oneWay: 210, minutes: 165, km: 208 } },
  { name: "Ierapetra Port", chq: { oneWay: 244, minutes: 191, km: 240 } },
  { name: "Sitia Port", chq: { oneWay: 421, minutes: 229, km: 274 } },
  { name: "Sitia Airport (JSH)", chq: { oneWay: 270, minutes: 232, km: 275 } },

  // Chania region.
  { name: "Chania City / Hotel", her: { oneWay: 157 }, chq: { oneWay: 33, minutes: 15, km: 16 } },
  { name: "Daratso / Agioi Apostoloi", chq: { oneWay: 48, minutes: 20, km: 18 } },
  { name: "Stalos", chq: { oneWay: 48, minutes: 23, km: 21 } },
  { name: "Agia Marina (Chania)", her: { oneWay: 162 }, chq: { oneWay: 53, minutes: 26, km: 24 } },
  { name: "Platanias (Chania)", her: { oneWay: 162 }, chq: { oneWay: 58, minutes: 27, km: 26 } },
  { name: "Gerani (Chania)", chq: { oneWay: 58, minutes: 28, km: 28 } },
  { name: "Maleme", her: { oneWay: 164 }, chq: { oneWay: 63, minutes: 31, km: 32 } },
  { name: "Kolymbari", her: { oneWay: 169 }, chq: { oneWay: 70, minutes: 38, km: 43 } },
  { name: "Kastelli (Kissamos)", her: { oneWay: 181 }, chq: { oneWay: 88, minutes: 46, km: 52 } },
  { name: "Falasarna", chq: { oneWay: 105, minutes: 63, km: 67 } },
  { name: "Elafonisi", chq: { oneWay: 125, minutes: 98, km: 89 } },
  { name: "Paleochora", her: { oneWay: 234 }, chq: { oneWay: 128, minutes: 91, km: 86 } },
  { name: "Samonas", chq: { oneWay: 62, minutes: 40, km: 39 } },
  { name: "Kalyves / Almirida", her: { oneWay: 122 }, chq: { oneWay: 58, minutes: 33, km: 31 } },
  { name: "Georgioupolis", her: { oneWay: 110 }, chq: { oneWay: 70, minutes: 42, km: 46 } },
  { name: "Chora Sfakion / Sfakia", her: { oneWay: 148 }, chq: { oneWay: 143, minutes: 87, km: 76 } },
  { name: "Frangokastello", her: { oneWay: 134 }, chq: { oneWay: 144, minutes: 99, km: 87 } },

  // Rethymno region.
  { name: "Rethymno City / Hotel", her: { oneWay: 87 }, chq: { oneWay: 92, minutes: 59, km: 68 } },
  { name: "Platanias (Rethymno)", chq: { oneWay: 99, minutes: 67, km: 76 } },
  { name: "Adelianos Kampos / Adele", her: { oneWay: 84 }, chq: { oneWay: 97, minutes: 64, km: 73 } },
  { name: "Scaleta", her: { oneWay: 75 }, chq: { oneWay: 95, minutes: 69, km: 80 } },
  { name: "Panormo", her: { oneWay: 69 }, chq: { oneWay: 116, minutes: 76, km: 88 } },
  { name: "Bali", her: { oneWay: 65 }, chq: { oneWay: 131, minutes: 86, km: 98 } },
  { name: "Plakias", her: { oneWay: 122 }, chq: { oneWay: 143, minutes: 89, km: 98 } },
  { name: "Agia Galini", her: { oneWay: 87 }, chq: { oneWay: 165, minutes: 101, km: 115 } },
  { name: "Agios Pavlos", chq: { oneWay: 134, minutes: 109, km: 113 } },

  // Heraklion region.
  { name: "Agia Pelagia", her: { oneWay: 38 }, chq: { oneWay: 142, minutes: 107, km: 127 } },
  { name: "Ligaria", her: { oneWay: 30 }, chq: { oneWay: 142, minutes: 109, km: 128 } },
  { name: "Fodele", her: { oneWay: 38 }, chq: { oneWay: 132, minutes: 103, km: 122 } },
  { name: "Ammoudara (Heraklion)", her: { oneWay: 24 }, chq: { oneWay: 159, minutes: 116, km: 138 } },
  { name: "Arolithos - Cretan Village", her: { oneWay: 28 }, chq: { oneWay: 155, minutes: 118, km: 140 } },
  { name: "Heraklion City / Hotel", her: { oneWay: 15 }, chq: { oneWay: 162, minutes: 120, km: 148 } },
  { name: "P.A.G.N.I", her: { oneWay: 23 } },
  { name: "Archanes", her: { oneWay: 28 } },
  { name: "Amnissos / Karteros", her: { oneWay: 17 }, chq: { oneWay: 155, minutes: 124, km: 152 } },
  { name: "Kokkini Hani", her: { oneWay: 24 }, chq: { oneWay: 165, minutes: 127, km: 157 } },
  { name: "Creta Aquarium - Gournes", her: { oneWay: 24 }, chq: { oneWay: 167, minutes: 131, km: 160 } },
  { name: "Anopolis - Water City", chq: { oneWay: 172, minutes: 132, km: 159 } },
  { name: "Gouves", her: { oneWay: 28 }, chq: { oneWay: 167, minutes: 133, km: 164 } },
  { name: "Analipsi", her: { oneWay: 33 }, chq: { oneWay: 175, minutes: 134, km: 166 } },
  { name: "Anissaras", her: { oneWay: 33 }, chq: { oneWay: 176, minutes: 138, km: 169 } },
  { name: "Chersonissos", her: { oneWay: 37 }, chq: { oneWay: 176, minutes: 137, km: 170 } },
  { name: "Koutouloufari", her: { oneWay: 37 }, chq: { oneWay: 176, minutes: 137, km: 171 } },
  { name: "Piskopiano", her: { oneWay: 37 }, chq: { oneWay: 176, minutes: 137, km: 170 } },
  { name: "Stalis / Stalida", her: { oneWay: 39 }, chq: { oneWay: 201, minutes: 172, km: 190 } },
  { name: "Malia", her: { oneWay: 42 }, chq: { oneWay: 184, minutes: 142, km: 179 } },

  // Heraklion south coast.
  { name: "Kalamaki", chq: { oneWay: 146, minutes: 126, km: 135 } },
  { name: "Kamilari", chq: { oneWay: 142, minutes: 122, km: 133 } },
  { name: "Matala", her: { oneWay: 73 }, chq: { oneWay: 199, minutes: 133, km: 145 } },
  { name: "Kokinos Pyrgos", chq: { oneWay: 138, minutes: 111, km: 124 } },
  { name: "Lentas", chq: { oneWay: 173, minutes: 163, km: 170 } },
  { name: "Tsoutsouros", chq: { oneWay: 198, minutes: 257, km: 297 } },

  // Lasithi.
  { name: "Sissi", her: { oneWay: 50 }, chq: { oneWay: 194, minutes: 228, km: 274 } },
  { name: "Milatos", her: { oneWay: 60 }, chq: { oneWay: 201, minutes: 155, km: 192 } },
  { name: "Agios Nikolaos City / Hotel", her: { oneWay: 73 }, chq: { oneWay: 210, minutes: 165, km: 208 } },
  { name: "Ammoudara (Agios Nikolaos)", her: { oneWay: 73 }, chq: { oneWay: 218, minutes: 168, km: 211 } },
  { name: "Elounda", her: { oneWay: 78 }, chq: { oneWay: 223, minutes: 172, km: 214 } },
  { name: "Plaka Eloundas", her: { oneWay: 84 }, chq: { oneWay: 229, minutes: 180, km: 218 } },
  { name: "Istron / Kalo Horio", her: { oneWay: 84 }, chq: { oneWay: 227, minutes: 170, km: 218 } },
  { name: "Mochlos", chq: { oneWay: 244, minutes: 205, km: 242 } },
  { name: "Ierapetra City / Hotel", her: { oneWay: 106 }, chq: { oneWay: 244, minutes: 191, km: 240 } },
  { name: "Koutsounari / Ferma", her: { oneWay: 113 }, chq: { oneWay: 248, minutes: 200, km: 245 } },
  { name: "Makri Gialos", her: { oneWay: 125 }, chq: { oneWay: 252, minutes: 199, km: 251 } },
  { name: "Sitia City / Hotel", her: { oneWay: 167 }, chq: { oneWay: 270, minutes: 229, km: 274 } },
  { name: "Palekastro", her: { oneWay: 174 }, chq: { oneWay: 445, minutes: 248, km: 290 } },
  { name: "Vai", chq: { oneWay: 460, minutes: 265, km: 300 } },
  { name: "Kato Zakros", chq: { oneWay: 484, minutes: 282, km: 316 } },
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

  const base = roundtrip ? fare.oneWay * ROUNDTRIP_MULTIPLIER : fare.oneWay;

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
