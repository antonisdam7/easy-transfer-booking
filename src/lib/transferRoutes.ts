// One page per journey people actually search for.
//
// "Heraklion airport transfer" is a phrase the big booking sites own outright. "Heraklion
// airport to Elounda taxi" is a phrase somebody types when they have already chosen the
// hotel and only want a price, and almost nobody writes a page for it. These are those
// pages: the ten routes the operator says sell most, each with the fare, the distance and
// the driving time this site would actually charge and drive.
//
// Nothing here is a second copy of the fare data. The numbers come out of booking.ts at
// build time, so a page cannot quote a price the booking form would contradict, and a
// renamed zone stops the build instead of leaving a page quietly wrong.
//
// Imports stay relative: this is reached from the Vite config, through seo.ts, before the
// "@/" alias exists.

import { HERAKLION_AIRPORT, durationLabel, faresFrom } from "./booking";

export type TransferRoute = {
  // The last part of the URL, and what the page is keyed by everywhere else.
  slug: string;
  // The name of the destination zone in booking.ts. The fare is read through this.
  destination: string;
  // How the place is written in a sentence, which is not always how the fare table
  // lists it -- nobody says "Agios Nikolaos City / Hotel" out loud.
  label: string;
  // What the destination is, for a reader who has booked a hotel there and may never
  // have seen the place. Written to be read, not to hold keywords.
  about: string;
  // What the drive itself is like. The one thing this site knows that a directory
  // listing does not.
  drive: string;
};

// Ordered as the operator ranked them: the short eastern resort runs first, then the
// longer crossings. The order is what the index page lists them in.
const routes: TransferRoute[] = [
  {
    slug: "gouves",
    destination: "Gouves",
    label: "Gouves",
    about:
      "Gouves is the first of the resort strips east of the airport, split between the old village on the hillside and the hotels down on the water at Kato Gouves. It is a quieter base than Chersonissos a few minutes further on, which is much of why people choose it.",
    drive:
      "This is the shortest transfer we sell to a resort. The whole run is on the new national road, and you are usually at reception before you have finished telling the driver about the flight.",
  },
  {
    slug: "chersonissos",
    destination: "Chersonissos",
    label: "Chersonissos",
    about:
      "Chersonissos is the busiest resort town on this stretch of coast, with the harbour and the nightlife at the bottom and the older village of Koutouloufari up behind it. Most of the large hotels sit along the main coast road on either side of the centre.",
    drive:
      "A straight run east on the national road. Tell us the hotel name rather than just the town: Chersonissos spreads for several kilometres along the coast, and the drop-off can be at either end of it.",
  },
  {
    slug: "agia-pelagia",
    destination: "Agia Pelagia",
    label: "Agia Pelagia",
    about:
      "Agia Pelagia sits west of Heraklion in a sheltered horseshoe bay, with the hotels stacked up the slopes around the beach. It is the closest proper resort to the airport in that direction, and the calm water in the cove is the reason most families pick it.",
    drive:
      "West on the national road, then a short descent from the main road down into the bay. The last stretch is steep and narrow, which is the part a hire car makes hard work and a driver who knows it does not.",
  },
  {
    slug: "malia",
    destination: "Malia",
    label: "Malia",
    about:
      "Malia has two halves that barely meet: the old town inland, and the beach strip that gave the place its reputation. The Minoan palace site sits just east of both. Where your hotel is decides which Malia you are staying in.",
    drive:
      "The furthest of the short eastern runs, still entirely on the national road. In peak season the exit into the resort itself is the slow part of the journey, not the road out from the airport.",
  },
  {
    slug: "matala",
    destination: "Matala",
    label: "Matala",
    about:
      "Matala is on the south coast, at the far end of the Messara plain, under the sandstone cliff full of carved caves that made it famous in the sixties. It is the shortest way to reach the Libyan Sea from Heraklion.",
    drive:
      "This one crosses the island rather than following the coast, climbing over the hills and down onto the Messara. It costs the same as the run to Agios Nikolaos and takes about as long, which surprises people who look at the map and see a shorter line.",
  },
  {
    slug: "agios-nikolaos",
    destination: "Agios Nikolaos City / Hotel",
    label: "Agios Nikolaos",
    about:
      "Agios Nikolaos is the main town of the east, built around Lake Voulismeni and opening onto the Gulf of Mirabello. It has the restaurants and the harbour of a real town rather than a resort built for the season, and hotels spread along the coast on both sides.",
    drive:
      "East on the national road the whole way. The driving time here already allows for the roadworks on the stretch approaching the town, which have been adding roughly half an hour to this drive and are expected to last into 2028.",
  },
  {
    slug: "elounda",
    destination: "Elounda",
    label: "Elounda",
    about:
      "Elounda is a few kilometres north of Agios Nikolaos on the same gulf, facing the island of Spinalonga across shallow water. It is where most of the island's large luxury resorts are, strung along the coast road north of the village.",
    drive:
      "The same road east as far as Agios Nikolaos, then up and over the headland to the Elounda side. The resorts here are spread out and set well back from the road, so the hotel name matters more than usual for the drop-off.",
  },
  {
    slug: "rethymno",
    destination: "Rethymno City / Hotel",
    label: "Rethymno",
    about:
      "Rethymno sits halfway between the two airports, with a Venetian old town under the fortezza and a long sand beach running east from it. The hotels are split between the old quarter and the strip out along that beach.",
    drive:
      "West on the national road, past Heraklion and along the north coast. It is the longest of these that still feels like a single straight run, and it is worth checking the fare from Chania too if your flights are not yet booked.",
  },
  {
    slug: "ierapetra",
    destination: "Ierapetra City / Hotel",
    label: "Ierapetra",
    about:
      "Ierapetra is on the south coast, at the narrowest part of the island, looking out at the Libyan Sea. It is a working town rather than a resort, with the beaches running east and west from it and a longer, hotter season than the north.",
    drive:
      "East along the national road, then south across the isthmus, which is the quickest crossing of the island there is. The northern half of the drive runs through the roadworks east of Agios Nikolaos, and the time quoted allows for them.",
  },
  {
    slug: "chania",
    destination: "Chania City / Hotel",
    label: "Chania",
    about:
      "Chania is at the far west of the island, built around a Venetian harbour, and it has its own airport much closer to it. People still take this transfer when the flight schedules only work into Heraklion, or when they are moving across the island mid-holiday.",
    drive:
      "The full length of the north coast, and the longest transfer on this list by a wide margin. If your flights are not yet booked, compare this fare with the one from Chania Airport before you choose the flight -- the difference is larger than most people expect.",
  },
];

export type RouteFacts = TransferRoute & {
  path: string;
  title: string;
  km: number;
  minutes: number;
  duration: string;
  oneWay: number;
};

// The fare table read once, so each route is looked up rather than scanned for.
const heraklionFares = new Map(faresFrom(HERAKLION_AIRPORT).map((row) => [row.name, row]));

// Throws rather than skipping. A route the operator named as one of their best sellers
// disappearing quietly from the sitemap is worse than a build that stops and says why.
export const transferRoutes: RouteFacts[] = routes.map((route) => {
  const fare = heraklionFares.get(route.destination);
  if (!fare) {
    throw new Error(
      `transferRoutes: no published fare from ${HERAKLION_AIRPORT} to "${route.destination}"`,
    );
  }

  return {
    ...route,
    path: `/heraklion-airport-to-${route.slug}-transfer`,
    title: `Heraklion Airport to ${route.label} Transfer`,
    km: fare.km,
    minutes: fare.minutes,
    duration: durationLabel(fare.minutes),
    oneWay: fare.oneWay,
  };
});

export const transferRouteByPath = new Map(transferRoutes.map((route) => [route.path, route]));
