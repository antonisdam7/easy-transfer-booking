export const popularLocations = [
  "Heraklion Airport (HER)",
  "Chania Airport (CHQ)",
  "Heraklion Port",
  "Chania Port (Souda)",
  "Heraklio",
  "Amnissos / Karteros",
  "Kokkini Hani / Gournes",
  "Gouves",
  "Analipsi / Anissaras",
  "Hersonissos / Koutouloufari",
  "Stalida",
  "Malia",
  "Sissi",
  "Milatos",
  "Agios Nikolaos",
  "Amoudara Ag. Nikolaos",
  "Elounda",
  "Plaka Eloundas",
  "Istron / Kalo Horio",
  "Ierapetra",
  "Ferma / Koutsounari",
  "Makri Gialos",
  "Sitia",
  "Palekastro",
  "Amoudara / Linoperamata",
  "Arolitos",
  "Lygaria",
  "Agia Pelagia / Fodele",
  "Bali",
  "Panormo",
  "Scaleta",
  "Adele",
  "Rethymno",
  "Georgioupoli",
  "Kalibes / Almyrida",
  "Chania",
  "Chania A/R",
  "Agia Marina Chania",
  "Platanias Chania",
  "Maleme",
  "Kolimbari",
  "Kasteli Kissamou",
  "Paleochora",
  "Plakias",
  "Fragkokastelo",
  "Hora Sfakion",
  "Matala",
  "Agia Galini",
  "Archanes",
  "P.A.G.N.I",
  "Other (specify in notes)",
];

export const airportValues = ["Heraklion Airport (HER)", "Chania Airport (CHQ)"];

const herAirportPrices: Record<string, number> = {
  Heraklio: 15,
  "Amnissos / Karteros": 17,
  "Kokkini Hani / Gournes": 24,
  Gouves: 28,
  "Analipsi / Anissaras": 33,
  "Hersonissos / Koutouloufari": 37,
  Stalida: 39,
  Malia: 42,
  Sissi: 50,
  Milatos: 60,
  "Agios Nikolaos": 73,
  "Amoudara Ag. Nikolaos": 73,
  Elounda: 78,
  "Plaka Eloundas": 84,
  "Istron / Kalo Horio": 84,
  Ierapetra: 106,
  "Ferma / Koutsounari": 113,
  "Makri Gialos": 125,
  Sitia: 167,
  Palekastro: 174,
  "Amoudara / Linoperamata": 24,
  Arolitos: 28,
  Lygaria: 30,
  "Agia Pelagia / Fodele": 38,
  Bali: 65,
  Panormo: 69,
  Scaleta: 75,
  Adele: 84,
  Rethymno: 87,
  Georgioupoli: 110,
  "Kalibes / Almyrida": 122,
  Chania: 157,
  "Chania A/R": 162,
  "Agia Marina Chania": 162,
  "Platanias Chania": 162,
  Maleme: 164,
  Kolimbari: 169,
  "Kasteli Kissamou": 181,
  Paleochora: 234,
  Plakias: 122,
  Fragkokastelo: 134,
  "Hora Sfakion": 148,
  Matala: 73,
  "Agia Galini": 87,
  Archanes: 28,
  "P.A.G.N.I": 23,
  "Heraklion Port": 15,
  "Chania Port (Souda)": 157,
};

export function getPrice(pickup: string, dropoff: string): number | null {
  if (pickup === "Heraklion Airport (HER)" && herAirportPrices[dropoff]) {
    return herAirportPrices[dropoff];
  }
  if (dropoff === "Heraklion Airport (HER)" && herAirportPrices[pickup]) {
    return herAirportPrices[pickup];
  }
  return null;
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

// Rounds each leg before doubling, so the roundtrip figure is always exactly twice
// the one-way figure the customer saw a moment earlier.
export function getVehiclePrice(
  pickup: string,
  dropoff: string,
  vehicle: VehicleType,
  roundtrip: boolean,
): number | null {
  const base = getPrice(pickup, dropoff);
  if (base === null) return null;

  const oneWay = Math.round(base * vehicleMultipliers[vehicle]);
  return roundtrip ? oneWay * 2 : oneWay;
}

export function getRouteStats(pickup: string, dropoff: string) {
  const basePrice = getPrice(pickup, dropoff);
  const km = basePrice ? Math.max(8, Math.round(basePrice * 0.65)) : 30;
  const minutes = Math.max(8, km - 5);
  return { km, minutes };
}

