import { CHANIA_AIRPORT, HERAKLION_AIRPORT, durationLabel, faresFrom } from "@/lib/booking";

// Published fares, straight from the table the booking form prices with. Nothing here
// is typed by hand, so a fare the operator changes changes here too, and the page can
// never quote a price the booking would then contradict.
//
// The reason to publish them at all: a price is the first thing a traveller looks for,
// and the only place this site had one was behind a search, on a page marked noindex.
// Every competitor publishes a route list. This is the same list, and it is real.

// The rows are not links. They could deep-link into the results page, but that page is
// noindex and blocked in robots.txt, so eighty of them per landing page would be eighty
// links a crawler is told to ignore. The price is what the reader came for; the booking
// form is one button away at the top of the page.

export function FareTable({ airport }: { airport: string }) {
  const rows = faresFrom(airport);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <caption className="sr-only">
            One-way transfer fares from {airport}, with distance and driving time.
          </caption>
          <thead className="bg-secondary">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-semibold">Destination</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Distance</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Driving time</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">One way from</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t">
                <th scope="row" className="px-4 py-2 text-left font-normal">{row.name}</th>
                {/* One string per cell, not a number sitting next to a unit. Rendered at
                    build time, "€{row.oneWay}" becomes two text nodes with a <!-- --> put
                    between them to tell them apart during hydration, so the cell reads
                    "€<!-- -->78". Every browser and every real parser drops the comment and
                    reads €78 -- but the point of writing these tables into the file was to
                    be read by things that are not browsers, and the crudest of those pull
                    a cell out with a regex and would come away holding a bare euro sign. */}
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {`${row.km} km`}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {durationLabel(row.minutes)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold text-primary">
                  {`€${row.oneWay}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FareNote />
    </div>
  );
}

// Both airports side by side, for the pages that are about the island rather than one
// terminal. A blank cell is a route we have never measured from that airport, and is
// left blank rather than filled with a guess.
export function IslandFareTable() {
  const her = new Map(faresFrom(HERAKLION_AIRPORT).map((row) => [row.name, row]));
  const chq = new Map(faresFrom(CHANIA_AIRPORT).map((row) => [row.name, row]));

  const names = [...new Set([...her.keys(), ...chq.keys()])]
    .filter((name) => name !== HERAKLION_AIRPORT && name !== CHANIA_AIRPORT)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <caption className="sr-only">
            One-way transfer fares across Crete from Heraklion and Chania airports.
          </caption>
          <thead className="bg-secondary">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-semibold">Destination</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">From Heraklion (HER)</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">From Chania (CHQ)</th>
            </tr>
          </thead>
          <tbody>
            {names.map((name) => (
              <tr key={name} className="border-t">
                <th scope="row" className="px-4 py-2 text-left font-normal">{name}</th>
                <td className="px-4 py-2 text-right tabular-nums font-semibold text-primary">
                  {her.has(name) ? `€${her.get(name).oneWay}` : "—"}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold text-primary">
                  {chq.has(name) ? `€${chq.get(name).oneWay}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FareNote />
    </div>
  );
}

// The same conditions the results page states, kept here so the published fare and
// the quoted one are qualified identically.
function FareNote() {
  return (
    <p className="text-xs text-muted-foreground">
      Fares are per vehicle, not per person, and include VAT, tolls and the driver's waiting time.
      Shown for the Mercedes E-Class sedan and estate, each seating up to four; the Mercedes
      V-Class minivan takes up to eight and the Mercedes Sprinter minibus up to sixteen,
      and both cost more.
      A return trip is charged as one full leg plus a second at 20% off.
    </p>
  );
}
