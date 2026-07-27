// Fares and route information for every destination we serve, keyed by the airport
// the transfer starts from or returns to.
//
// Fares are the operator's own. Coordinates, distances and durations were measured
// once against Google Maps and written in here, rather than being fetched while a
// customer waits: the fares are per zone, so the route only has to be measured per
// zone too. See the git history for the script that produced them.
//
// The coordinates are also what places a customer's hotel into a zone, so an entry
// being a few hundred metres off is a mispriced booking, not a cosmetic problem.
//
// Durations east of Agios Nikolaos run roughly half an hour longer than the drive
// normally takes. That is roadworks, not bad data, and the operator expects them to
// last into 2028. Re-measure once the road reopens.

export const HERAKLION_AIRPORT = "Heraklion Airport (HER)";
export const CHANIA_AIRPORT = "Chania Airport (CHQ)";

export const airportValues = [HERAKLION_AIRPORT, CHANIA_AIRPORT];

type Fare = {
  oneWay: number;
  minutes: number;
  km: number;
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
  lat: number;
  lng: number;
  // Ports and airports. Bookable when a customer picks one by name, but never the
  // answer to "which zone is this hotel in" -- see matchZone.
  hub?: true;
  her?: Fare;
  chq?: Fare;
};

// Grouped roughly west to east so the dropdown reads like the island looks.
export const destinations: Destination[] = [
  // Airports and ports.
  { name: "Heraklion Airport (HER)", lat: 35.33955, lng: 25.17606, hub: true, chq: { oneWay: 153, minutes: 137, km: 150 } },
  // No fares of its own: an airport-to-airport trip is priced once, on the Heraklion
  // entry above, and getFare finds it from either direction. This is here so the
  // airport still appears in the dropdown.
  { name: "Chania Airport (CHQ)", lat: 35.53981, lng: 24.1404, hub: true },
  { name: "Heraklion Port", lat: 35.34344, lng: 25.15095, hub: true, her: { oneWay: 15, minutes: 11, km: 3 }, chq: { oneWay: 162, minutes: 140, km: 150 } },
  { name: "Chania Port (Souda)", lat: 35.489, lng: 24.07559, hub: true, her: { oneWay: 157, minutes: 119, km: 134 }, chq: { oneWay: 31, minutes: 24, km: 16 } },
  { name: "Rethymno Port", lat: 35.37129, lng: 24.47637, hub: true, chq: { oneWay: 76, minutes: 74, km: 68 } },
  { name: "Agios Nikolaos Port", lat: 35.19282, lng: 25.72061, hub: true, chq: { oneWay: 210, minutes: 193, km: 209 } },
  { name: "Ierapetra Port", lat: 35.00396, lng: 25.73589, hub: true, chq: { oneWay: 244, minutes: 223, km: 242 } },
  { name: "Sitia Port", lat: 35.2077, lng: 26.10961, hub: true, chq: { oneWay: 270, minutes: 257, km: 273 } },
  { name: "Sitia Airport (JSH)", lat: 35.21697, lng: 26.09727, hub: true, chq: { oneWay: 270, minutes: 253, km: 273 } },

  // Chania region.
  { name: "Chania City / Hotel", lat: 35.51378, lng: 24.02031, her: { oneWay: 157, minutes: 126, km: 142 }, chq: { oneWay: 33, minutes: 24, km: 15 } },
  { name: "Daratso / Agioi Apostoloi", lat: 35.5011, lng: 23.97438, chq: { oneWay: 48, minutes: 34, km: 25 } },
  { name: "Stalos", lat: 35.50379, lng: 23.93542, chq: { oneWay: 48, minutes: 37, km: 29 } },
  { name: "Agia Marina (Chania)", lat: 35.5172, lng: 23.92548, her: { oneWay: 162, minutes: 132, km: 149 }, chq: { oneWay: 53, minutes: 38, km: 29 } },
  { name: "Platanias (Chania)", lat: 35.5167, lng: 23.90892, her: { oneWay: 162, minutes: 133, km: 154 }, chq: { oneWay: 58, minutes: 39, km: 34 } },
  { name: "Gerani (Chania)", lat: 35.51665, lng: 23.87779, chq: { oneWay: 58, minutes: 38, km: 34 } },
  { name: "Maleme", lat: 35.52211, lng: 23.84743, her: { oneWay: 164, minutes: 138, km: 156 }, chq: { oneWay: 63, minutes: 44, km: 37 } },
  { name: "Kolymbari", lat: 35.53747, lng: 23.78139, her: { oneWay: 169, minutes: 137, km: 162 }, chq: { oneWay: 70, minutes: 43, km: 43 } },
  { name: "Kastelli (Kissamos)", lat: 35.49627, lng: 23.65402, her: { oneWay: 181, minutes: 151, km: 176 }, chq: { oneWay: 88, minutes: 57, km: 56 } },
  { name: "Falasarna", lat: 35.50196, lng: 23.5799, chq: { oneWay: 105, minutes: 76, km: 70 } },
  { name: "Elafonisi", lat: 35.27118, lng: 23.5413, her: { oneWay: 218, minutes: 205, km: 211 }, chq: { oneWay: 125, minutes: 111, km: 91 } },
  { name: "Paleochora", lat: 35.23054, lng: 23.68222, her: { oneWay: 234, minutes: 194, km: 209 }, chq: { oneWay: 128, minutes: 100, km: 89 } },
  { name: "Samonas", lat: 35.41899, lng: 24.10947, chq: { oneWay: 62, minutes: 49, km: 33 } },
  { name: "Kalyves / Almirida", lat: 35.45112, lng: 24.16972, her: { oneWay: 122, minutes: 107, km: 123 }, chq: { oneWay: 58, minutes: 36, km: 29 } },
  { name: "Georgioupolis", lat: 35.36082, lng: 24.26217, her: { oneWay: 110, minutes: 90, km: 103 }, chq: { oneWay: 70, minutes: 52, km: 48 } },
  { name: "Chora Sfakion / Sfakia", lat: 35.20152, lng: 24.13803, her: { oneWay: 148, minutes: 143, km: 146 }, chq: { oneWay: 143, minutes: 96, km: 78 } },
  { name: "Frangokastello", lat: 35.18211, lng: 24.23419, her: { oneWay: 134, minutes: 134, km: 134 }, chq: { oneWay: 144, minutes: 107, km: 85 } },

  // Rethymno region.
  { name: "Rethymno City / Hotel", lat: 35.36555, lng: 24.49198, her: { oneWay: 87, minutes: 72, km: 81 }, chq: { oneWay: 92, minutes: 78, km: 74 } },
  { name: "Platanias (Rethymno)", lat: 35.36799, lng: 24.5296, chq: { oneWay: 99, minutes: 74, km: 73 } },
  { name: "Adelianos Kampos / Adele", lat: 35.3721, lng: 24.5414, her: { oneWay: 84, minutes: 66, km: 76 }, chq: { oneWay: 97, minutes: 76, km: 74 } },
  { name: "Scaleta", lat: 35.39145, lng: 24.61312, her: { oneWay: 75, minutes: 60, km: 69 }, chq: { oneWay: 95, minutes: 80, km: 81 } },
  { name: "Panormo", lat: 35.41818, lng: 24.6908, her: { oneWay: 69, minutes: 54, km: 61 }, chq: { oneWay: 116, minutes: 89, km: 90 } },
  { name: "Bali", lat: 35.41494, lng: 24.78313, her: { oneWay: 65, minutes: 50, km: 53 }, chq: { oneWay: 131, minutes: 100, km: 101 } },
  { name: "Plakias", lat: 35.18912, lng: 24.39757, her: { oneWay: 122, minutes: 106, km: 114 }, chq: { oneWay: 143, minutes: 103, km: 97 } },
  { name: "Agia Galini", lat: 35.09627, lng: 24.68837, her: { oneWay: 87, minutes: 76, km: 75 }, chq: { oneWay: 165, minutes: 118, km: 115 } },
  { name: "Agios Pavlos", lat: 35.10289, lng: 24.56355, her: { oneWay: 115, minutes: 105, km: 96 }, chq: { oneWay: 134, minutes: 129, km: 117 } },

  // Heraklion region.
  { name: "Agia Pelagia", lat: 35.4073, lng: 25.0181, her: { oneWay: 38, minutes: 30, km: 26 }, chq: { oneWay: 142, minutes: 127, km: 131 } },
  { name: "Ligaria", lat: 35.3986, lng: 25.02687, her: { oneWay: 30, minutes: 25, km: 23 }, chq: { oneWay: 142, minutes: 123, km: 129 } },
  { name: "Fodele", lat: 35.40204, lng: 24.95244, her: { oneWay: 38, minutes: 28, km: 30 }, chq: { oneWay: 132, minutes: 114, km: 120 } },
  { name: "Ammoudara (Heraklion)", lat: 35.33746, lng: 25.08756, her: { oneWay: 24, minutes: 15, km: 10 }, chq: { oneWay: 159, minutes: 134, km: 140 } },
  { name: "Arolithos - Cretan Village", lat: 35.31541, lng: 25.03557, her: { oneWay: 28, minutes: 17, km: 15 }, chq: { oneWay: 155, minutes: 131, km: 141 } },
  { name: "Heraklion City / Hotel", lat: 35.33867, lng: 25.14213, her: { oneWay: 15, minutes: 13, km: 4 }, chq: { oneWay: 162, minutes: 139, km: 147 } },
  { name: "P.A.G.N.I", lat: 35.30401, lng: 25.08436, her: { oneWay: 23, minutes: 16, km: 12 } },
  { name: "Archanes", lat: 35.23532, lng: 25.15931, her: { oneWay: 28, minutes: 21, km: 15 } },
  { name: "Amnissos / Karteros", lat: 35.33238, lng: 25.20654, her: { oneWay: 17, minutes: 8, km: 6 }, chq: { oneWay: 155, minutes: 139, km: 153 } },
  { name: "Kokkini Hani", lat: 35.33068, lng: 25.25634, her: { oneWay: 24, minutes: 12, km: 10 }, chq: { oneWay: 165, minutes: 142, km: 158 } },
  { name: "Creta Aquarium - Gournes", lat: 35.33236, lng: 25.28246, her: { oneWay: 24, minutes: 17, km: 16 }, chq: { oneWay: 167, minutes: 148, km: 163 } },
  { name: "Anopolis - Water City", lat: 35.31099, lng: 25.2514, chq: { oneWay: 172, minutes: 145, km: 160 } },
  { name: "Gouves", lat: 35.31135, lng: 25.31302, her: { oneWay: 28, minutes: 18, km: 17 }, chq: { oneWay: 167, minutes: 149, km: 165 } },
  { name: "Analipsi", lat: 35.33173, lng: 25.34527, her: { oneWay: 33, minutes: 21, km: 19 }, chq: { oneWay: 175, minutes: 151, km: 167 } },
  { name: "Anissaras", lat: 35.33542, lng: 25.37481, her: { oneWay: 33, minutes: 25, km: 23 }, chq: { oneWay: 176, minutes: 156, km: 170 } },
  { name: "Chersonissos", lat: 35.30732, lng: 25.37016, her: { oneWay: 37, minutes: 20, km: 22 }, chq: { oneWay: 176, minutes: 151, km: 170 } },
  { name: "Koutouloufari", lat: 35.30588, lng: 25.39264, her: { oneWay: 37, minutes: 26, km: 24 }, chq: { oneWay: 176, minutes: 157, km: 172 } },
  { name: "Piskopiano", lat: 35.30834, lng: 25.38528, her: { oneWay: 37, minutes: 23, km: 23 }, chq: { oneWay: 176, minutes: 153, km: 171 } },
  { name: "Stalis / Stalida", lat: 35.29265, lng: 25.43304, her: { oneWay: 39, minutes: 27, km: 29 }, chq: { oneWay: 201, minutes: 158, km: 177 } },
  { name: "Malia", lat: 35.28324, lng: 25.46088, her: { oneWay: 42, minutes: 29, km: 31 }, chq: { oneWay: 184, minutes: 160, km: 179 } },

  // Heraklion south coast.
  { name: "Kalamaki", lat: 35.02909, lng: 24.75997, chq: { oneWay: 146, minutes: 144, km: 135 } },
  { name: "Kamilari", lat: 35.03373, lng: 24.79005, chq: { oneWay: 142, minutes: 142, km: 133 } },
  { name: "Matala", lat: 34.99311, lng: 24.74964, her: { oneWay: 73, minutes: 66, km: 66 }, chq: { oneWay: 199, minutes: 152, km: 140 } },
  { name: "Kokinos Pyrgos", lat: 35.08146, lng: 24.74137, chq: { oneWay: 138, minutes: 130, km: 124 } },
  { name: "Lentas", lat: 34.93089, lng: 24.92432, her: { oneWay: 89, minutes: 80, km: 71 }, chq: { oneWay: 173, minutes: 182, km: 162 } },
  { name: "Tsoutsouros", lat: 34.98427, lng: 25.28253, her: { oneWay: 78, minutes: 65, km: 61 }, chq: { oneWay: 198, minutes: 193, km: 206 } },

  // Lasithi.
  { name: "Sissi", lat: 35.30855, lng: 25.52072, her: { oneWay: 50, minutes: 38, km: 41 }, chq: { oneWay: 194, minutes: 168, km: 188 } },
  { name: "Milatos", lat: 35.3082, lng: 25.56644, her: { oneWay: 60, minutes: 45, km: 45 }, chq: { oneWay: 201, minutes: 176, km: 192 } },
  { name: "Agios Nikolaos City / Hotel", lat: 35.18913, lng: 25.71711, her: { oneWay: 73, minutes: 58, km: 60 }, chq: { oneWay: 210, minutes: 189, km: 208 } },
  { name: "Ammoudara (Agios Nikolaos)", lat: 35.16679, lng: 25.71046, her: { oneWay: 73, minutes: 59, km: 63 }, chq: { oneWay: 218, minutes: 190, km: 210 } },
  { name: "Elounda", lat: 35.26135, lng: 25.72342, her: { oneWay: 78, minutes: 67, km: 68 }, chq: { oneWay: 223, minutes: 198, km: 215 } },
  { name: "Plaka Eloundas", lat: 35.30222, lng: 25.72679, her: { oneWay: 84, minutes: 69, km: 63 }, chq: { oneWay: 229, minutes: 199, km: 211 } },
  { name: "Istron / Kalo Horio", lat: 35.1252, lng: 25.75324, her: { oneWay: 84, minutes: 77, km: 80 }, chq: { oneWay: 227, minutes: 208, km: 228 } },
  { name: "Mochlos", lat: 35.18405, lng: 25.90499, chq: { oneWay: 244, minutes: 224, km: 243 } },
  { name: "Ierapetra City / Hotel", lat: 35.01033, lng: 25.74041, her: { oneWay: 106, minutes: 89, km: 93 }, chq: { oneWay: 244, minutes: 220, km: 241 } },
  { name: "Koutsounari / Ferma", lat: 35.01601, lng: 25.82942, her: { oneWay: 113, minutes: 97, km: 102 }, chq: { oneWay: 248, minutes: 228, km: 250 } },
  { name: "Makri Gialos", lat: 35.03651, lng: 25.97058, her: { oneWay: 125, minutes: 115, km: 118 }, chq: { oneWay: 252, minutes: 246, km: 266 } },
  { name: "Sitia City / Hotel", lat: 35.20865, lng: 26.10523, her: { oneWay: 167, minutes: 125, km: 125 }, chq: { oneWay: 270, minutes: 256, km: 273 } },
  { name: "Palekastro", lat: 35.20054, lng: 26.25003, her: { oneWay: 174, minutes: 144, km: 142 }, chq: { oneWay: 445, minutes: 275, km: 290 } },
  { name: "Vai", lat: 35.25441, lng: 26.26493, her: { oneWay: 198, minutes: 153, km: 148 }, chq: { oneWay: 460, minutes: 284, km: 296 } },
  { name: "Kato Zakros", lat: 35.09718, lng: 26.26333, her: { oneWay: 218, minutes: 182, km: 168 }, chq: { oneWay: 484, minutes: 313, km: 316 } },
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

// Straight-line kilometres. Only ever used to rank candidates against each other,
// never shown as a travel distance.
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export type ZoneMatch = {
  zone: string;
  // How far the hotel sits from the zone it was priced as. Small numbers mean the
  // match is safe; a large one is the operator's cue to check before dispatching.
  offsetKm: number;
};

// Picks the priced zone nearest to a set of coordinates.
//
// Only zones priced from this particular airport are eligible. Matching purely on
// distance would happily land a Heraklion pickup on Elafonisi, which has a Chania
// fare and no Heraklion one, and the booking would come through with no price.
//
// Hubs are skipped as well. A hotel by Rethymno harbour is nearer the port entry
// than the town one and would be quoted the port fare, which is a different journey
// that happens to start in the same place.
//
// Nothing is rejected for being far away. A remote villa still deserves a quote, and
// the offset travels with the booking so the operator can see when one is unusual.
export function matchZone(lat: number, lng: number, airport: string): ZoneMatch | null {
  let best: ZoneMatch | null = null;

  for (const destination of destinations) {
    if (destination.hub) continue;

    const fare = airport === HERAKLION_AIRPORT ? destination.her : destination.chq;
    if (!fare) continue;

    const offsetKm = haversineKm(lat, lng, destination.lat, destination.lng);
    if (!best || offsetKm < best.offsetKm) {
      best = { zone: destination.name, offsetKm: Math.round(offsetKm * 10) / 10 };
    }
  }

  return best;
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

// Null rather than a placeholder: a route we have no fare for is a route we never
// measured, and inventing a distance for it is how the old estimate ended up showing
// customers arithmetic on a price and calling it kilometres.
export function getRouteStats(pickup: string, dropoff: string) {
  const fare = getFare(pickup, dropoff);
  if (!fare) return null;

  return { km: fare.km, minutes: fare.minutes };
}
