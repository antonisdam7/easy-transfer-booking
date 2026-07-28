import { importLibrary, LibraryMap, setOptions } from "@googlemaps/js-api-loader";

// One place where the Maps key is configured, because setOptions has to run before
// the first importLibrary anywhere in the app and calling it twice is a mistake
// waiting to happen. Everything that needs Google -- the hotel search, the route map
// -- comes through here.
//
// The key is public, as browser Maps keys are meant to be. What protects it is the
// HTTP referrer restriction and the daily quota cap set in the Cloud console, not
// secrecy. See .env.example.
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let configured = false;

export async function loadMapsLibrary<K extends keyof LibraryMap>(
  name: K,
): Promise<LibraryMap[K]> {
  if (!API_KEY) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY is not set");
  }

  if (!configured) {
    setOptions({ key: API_KEY, v: "weekly" });
    configured = true;
  }

  // Nothing is downloaded until the first call, so a visitor who never opens the
  // booking form never pays the round trip.
  return importLibrary(name);
}

export function isMapsConfigured(): boolean {
  return Boolean(API_KEY);
}
