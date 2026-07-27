import { Loader } from "@googlemaps/js-api-loader";

// Google Places, used only to turn what a customer types into coordinates. The fare
// still comes from the zone table in booking.ts; nothing here decides a price.
//
// The key is public, as browser Maps keys are meant to be. What protects it is the
// HTTP referrer restriction and the daily quota cap set in the Cloud console, not
// secrecy. See .env.example.
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Crete, with enough margin to cover the offshore islets. Keeps a half-typed village
// name from matching the mainland one.
const CRETE_BOUNDS = {
  south: 34.75,
  west: 23.4,
  north: 35.75,
  east: 26.4,
};

export type PlaceSuggestion = {
  id: string;
  // What the customer sees in the list, e.g. "Aldemar Knossos Royal".
  label: string;
  // The line underneath, e.g. "Hersonissos 700 14, Greece".
  detail: string;
};

export type ResolvedPlace = {
  name: string;
  lat: number;
  lng: number;
};

let placesLibrary: google.maps.PlacesLibrary | null = null;

async function loadPlaces(): Promise<google.maps.PlacesLibrary> {
  if (placesLibrary) return placesLibrary;

  if (!API_KEY) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY is not set");
  }

  const loader = new Loader({ apiKey: API_KEY, version: "weekly" });
  placesLibrary = (await loader.importLibrary("places")) as google.maps.PlacesLibrary;
  return placesLibrary;
}

// Held between keystrokes and spent when a suggestion is chosen. Google bills a
// whole session as one lookup, so reusing it is the difference between one charge
// per booking and one per character typed.
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

// Kept out of the suggestion objects so a stale click cannot resolve a place from an
// earlier query.
const predictions = new Map<string, google.maps.places.PlacePrediction>();

export async function suggestPlaces(input: string): Promise<PlaceSuggestion[]> {
  const query = input.trim();
  if (query.length < 3) return [];

  const { AutocompleteSuggestion, AutocompleteSessionToken } = await loadPlaces();
  sessionToken ??= new AutocompleteSessionToken();

  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: query,
    sessionToken,
    includedRegionCodes: ["gr"],
    locationRestriction: CRETE_BOUNDS,
  });

  predictions.clear();

  return suggestions.flatMap((suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return [];

    const id = prediction.placeId;
    predictions.set(id, prediction);

    return [
      {
        id,
        label: prediction.mainText?.text ?? prediction.text.text,
        detail: prediction.secondaryText?.text ?? "",
      },
    ];
  });
}

// Turns a chosen suggestion into coordinates. Ends the billing session, so the next
// thing the customer types starts a fresh one.
export async function resolvePlace(id: string): Promise<ResolvedPlace | null> {
  const prediction = predictions.get(id);
  if (!prediction) return null;

  const place = prediction.toPlace();
  await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
  sessionToken = null;

  const location = place.location;
  if (!location) return null;

  return {
    name: place.displayName ?? prediction.text.text,
    lat: location.lat(),
    lng: location.lng(),
  };
}

export function isPlacesConfigured(): boolean {
  return Boolean(API_KEY);
}
