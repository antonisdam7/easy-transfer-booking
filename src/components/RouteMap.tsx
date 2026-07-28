import { useEffect, useRef, useState } from "react";
import { LocationValue } from "@/lib/booking";
import { isMapsConfigured, loadMapsLibrary } from "@/lib/maps";

// The drive, drawn between the two places the customer actually chose -- not between
// the zones they were priced as. A hotel is where the driver goes; the zone is only
// how the fare was worked out, and putting it on a map would be a lie.
//
// This costs a Google call per booking, which the rest of the site avoids by keeping
// distances in the fare table. It buys the one thing the table cannot: a picture of
// where you are going.

type Props = {
  pickup: LocationValue | null;
  dropoff: LocationValue | null;
};

// Our navy, as a flat colour. Google wants a string, not a CSS variable.
const ROUTE_COLOUR = "#1a3352";
const PICKUP_COLOUR = "#1a3352";
const DROPOFF_COLOUR = "#059669";

function pin(colour: string) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 7,
    fillColor: colour,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
  };
}

export default function RouteMap({ pickup, dropoff }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!pickup || !dropoff || !container.current || !isMapsConfigured()) return;

    // Set when the effect is torn down, so a map that finishes loading after the
    // customer has changed their mind is thrown away instead of drawn.
    let cancelled = false;

    (async () => {
      try {
        // Three separate libraries: the map, the pins and the routing each live in
        // their own module and none of them comes with the others.
        const [maps, marker, routes, core] = await Promise.all([
          loadMapsLibrary("maps"),
          loadMapsLibrary("marker"),
          loadMapsLibrary("routes"),
          loadMapsLibrary("core"),
        ]);
        if (cancelled || !container.current) return;

        const from = { lat: pickup.lat, lng: pickup.lng };
        const to = { lat: dropoff.lat, lng: dropoff.lng };

        const map = new maps.Map(container.current, {
          // Cooperative gesture handling: a scroll over the map scrolls the page, and
          // zooming needs ctrl. Without it the map swallows the wheel and traps
          // anyone trying to reach the cars underneath.
          gestureHandling: "cooperative",
          disableDefaultUI: true,
          zoomControl: true,
          center: from,
          zoom: 9,
        });

        new marker.Marker({ map, position: from, icon: pin(PICKUP_COLOUR), zIndex: 2 });
        new marker.Marker({ map, position: to, icon: pin(DROPOFF_COLOUR), zIndex: 2 });

        // The route is a second call and can fail on its own -- the road network, not
        // the map, is what is unavailable then. Either way the map ends up framed
        // once: by the renderer around the road it drew, or by us around the two ends.
        // Framing twice makes the tiles visibly churn.
        try {
          const service = new routes.DirectionsService();
          const result = await service.route({
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.DRIVING,
          });
          if (cancelled) return;

          // preserveViewport left off on purpose: the renderer frames the road it
          // drew, which fits better than anything measured from the two endpoints.
          new routes.DirectionsRenderer({
            map,
            directions: result,
            suppressMarkers: true,
            polylineOptions: { strokeColor: ROUTE_COLOUR, strokeWeight: 5, strokeOpacity: 0.9 },
          });

          // A step back from the renderer's own framing, which sits tight against the
          // road. One level out puts the towns either side of it on screen, and a
          // customer recognising Hersonissos is the point of showing a map at all.
          core.event.addListenerOnce(map, "idle", () => map.setZoom(map.getZoom() - 1));
        } catch {
          if (cancelled) return;

          const ends = new core.LatLngBounds();
          ends.extend(from);
          ends.extend(to);
          // Waiting for the map to settle: called any earlier this measures a box the
          // browser has not laid out yet and lands on a street corner.
          core.event.addListenerOnce(map, "idle", () => map.fitBounds(ends, 48));
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff]);

  // No map is better than an empty grey box. The journey is spelled out in the
  // summary beside it either way.
  if (!pickup || !dropoff || !isMapsConfigured() || failed) return null;

  return (
    <div
      ref={container}
      className="h-64 w-full overflow-hidden rounded-lg border bg-muted md:h-80"
      aria-label={`Map of the route from ${pickup.name} to ${dropoff.name}`}
    />
  );
}
