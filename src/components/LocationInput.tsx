import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { destinations } from "@/lib/booking";
import { isPlacesConfigured, PlaceSuggestion, resolvePlace, suggestPlaces } from "@/lib/places";

export type LocationValue = {
  // What the customer picked, and what the booking and both emails will say.
  name: string;
  lat: number;
  lng: number;
  // Set when they chose an airport or port by name rather than searching. Skips the
  // zone matching, because the zone is already known exactly.
  zone?: string;
};

// Airports and ports, offered up front. Almost every transfer has one at one end,
// and making people type "Heraklion Airport" to find it would be a poor trade for
// the hotel search everywhere else.
const hubs = destinations.filter((destination) => destination.hub);

type Props = {
  label: string;
  value: LocationValue | null;
  onChange: (value: LocationValue) => void;
  placeholder?: string;
};

export default function LocationInput({ label, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [failed, setFailed] = useState(false);

  const placesAvailable = useMemo(() => isPlacesConfigured(), []);

  const matchingHubs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return hubs;
    return hubs.filter((hub) => hub.name.toLowerCase().includes(needle));
  }, [query]);

  // Google is asked once the customer pauses, not on every keystroke: it bills per
  // session, and a request per character would also arrive out of order.
  const requestId = useRef(0);
  useEffect(() => {
    if (!placesAvailable || query.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const results = await suggestPlaces(query);
        if (id !== requestId.current) return;
        setSuggestions(results);
        setFailed(false);
      } catch {
        if (id !== requestId.current) return;
        setSuggestions([]);
        setFailed(true);
      } finally {
        if (id === requestId.current) setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, placesAvailable]);

  const chooseHub = (name: string, lat: number, lng: number) => {
    onChange({ name, lat, lng, zone: name });
    setQuery("");
    setOpen(false);
  };

  const choosePlace = async (suggestion: PlaceSuggestion) => {
    const place = await resolvePlace(suggestion.id);
    if (!place) return;

    onChange({ name: place.name, lat: place.lat, lng: place.lng });
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value?.name ?? placeholder ?? "Search for your hotel or pick an airport"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          {/* Filtering is ours: the hub list is filtered above, and Google has already
              decided which places match. */}
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Hotel, address or airport..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {matchingHubs.length > 0 && (
                <CommandGroup heading="Airports and ports">
                  {matchingHubs.map((hub) => (
                    <CommandItem
                      key={hub.name}
                      value={hub.name}
                      onSelect={() => chooseHub(hub.name, hub.lat, hub.lng)}
                    >
                      <Plane className="mr-2 h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{hub.name}</span>
                      {value?.name === hub.name && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {suggestions.length > 0 && (
                <CommandGroup heading="Hotels and addresses">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      value={suggestion.id}
                      onSelect={() => choosePlace(suggestion)}
                    >
                      <MapPin className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="min-w-0">
                        <span className="block truncate">{suggestion.label}</span>
                        {suggestion.detail && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {suggestion.detail}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {isSearching && (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              )}

              {!isSearching && query.trim().length >= 3 && suggestions.length === 0 && (
                <CommandEmpty>
                  {failed
                    ? "Search is unavailable right now. Pick the nearest airport and tell us the hotel in the notes."
                    : "Nothing found in Crete for that. Try the hotel name on its own."}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
