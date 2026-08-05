// Kept out of the page so the FAQ schema and the accordion cannot drift apart. A
// question answered on screen but missing from the structured data -- or worse, the
// other way round -- is the kind of mismatch Google penalises.
//
// Imports here stay relative: this module is reached from the Vite config, through
// seo.ts, which resolves before the "@/" alias exists.

import { CHANIA_AIRPORT, HERAKLION_AIRPORT, durationLabel, faresFrom } from "./booking";
import { RouteFacts, transferRoutes } from "./transferRoutes";

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "How do I book a transfer?",
    a: "Simply fill out the booking form on our Home page with your details. We'll confirm your reservation via email or WhatsApp within a few hours.",
  },
  {
    q: "What vehicles do you have?",
    a: "Four: a Mercedes E-Class sedan and an E-Class estate, both seating up to 4 and costing the same, with the estate taking more luggage; a Mercedes V-Class minivan for up to 8; and a Mercedes Sprinter minibus for up to 16.",
  },
  {
    q: "Do you offer child seats?",
    a: "Yes! Just tick the child seat option in the booking form or mention it in your notes, and we'll have one ready.",
  },
  {
    q: "Are your prices fixed?",
    a: "Yes, all prices are agreed upon in advance. There are no hidden charges or surge pricing.",
  },
  {
    q: "How will I find my driver at the airport?",
    a: "Your driver waits in the arrivals hall holding a sign with your name on it. Walk out of baggage reclaim and look for your name — there is no meeting point to find and no rank to queue at.",
  },
  {
    q: "What if my flight is delayed?",
    a: "We monitor all flight arrivals. If your flight is delayed, we'll adjust pickup time automatically at no extra cost.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Free cancellation is available up to 24 hours before your scheduled transfer.",
  },
  {
    q: "Do you cover the whole island?",
    a: "Yes, we cover all of Crete — airports, ports, hotels, villas, and any destination on the island.",
  },
  {
    q: "How do I pay?",
    a: "You can pay in cash to your driver or by card. Payment is made after the transfer is completed.",
  },
];

// The questions each landing page answers for itself.
//
// The eight above are about the service. These are about one journey, which is what
// somebody searching "how much is a taxi from Chania airport" actually wants, and what
// Google can lift straight into the result. Every price and every driving time below is
// read out of the fare table rather than typed, so a page cannot answer with a number the
// booking form would then contradict.

// A destination's published fare, by the name the fare table uses. Throws rather than
// falling back: a sentence quoting a price is only worth publishing if it is the price
// that would be charged, so a renamed zone should stop the build rather than quietly
// leave a hole in an answer.
function fare(airport: string, destination: string) {
  const row = faresFrom(airport).find((candidate) => candidate.name === destination);
  if (!row) throw new Error(`faqs: no published fare from ${airport} to "${destination}"`);
  return row;
}

// faresFrom sorts by price, so the first row is the cheapest journey we sell.
function floorFare(airport: string) {
  return faresFrom(airport)[0];
}

function heraklionFaqs(): Faq[] {
  const floor = floorFare(HERAKLION_AIRPORT);
  const town = fare(HERAKLION_AIRPORT, "Heraklion City / Hotel");
  const malia = fare(HERAKLION_AIRPORT, "Malia");
  const elounda = fare(HERAKLION_AIRPORT, "Elounda");

  return [
    {
      q: "How much is a transfer from Heraklion Airport?",
      a: `Fares start at €${floor.oneWay} and every destination is listed on this page — €${town.oneWay} into Heraklion town, €${malia.oneWay} to Malia, €${elounda.oneWay} to Elounda. The fare is for the whole vehicle rather than per person, and includes VAT, tolls and the driver's waiting time.`,
    },
    {
      q: "How long does the drive from Heraklion Airport take?",
      a: `Heraklion town is about ${durationLabel(town.minutes)} from the terminal, Malia ${durationLabel(malia.minutes)}, and Elounda ${durationLabel(elounda.minutes)}. These are measured driving times, and the ones east of Agios Nikolaos already allow for the roadworks on that stretch.`,
    },
    {
      q: "What happens if my flight into Heraklion is delayed?",
      a: "We monitor arrivals and move the pickup to the time you actually land, at no extra cost. Heraklion is the busiest airport on the island in summer, and late arrivals are routine for us.",
    },
  ];
}

function chaniaFaqs(): Faq[] {
  const floor = floorFare(CHANIA_AIRPORT);
  const town = fare(CHANIA_AIRPORT, "Chania City / Hotel");
  const platanias = fare(CHANIA_AIRPORT, "Platanias (Chania)");
  const kissamos = fare(CHANIA_AIRPORT, "Kastelli (Kissamos)");
  const falasarna = fare(CHANIA_AIRPORT, "Falasarna");

  return [
    {
      q: "How much is a transfer from Chania Airport?",
      a: `Fares start at €${floor.oneWay}, with €${town.oneWay} into Chania town and €${platanias.oneWay} to Platanias. Every destination we drive to from CHQ is priced on this page, per vehicle rather than per person, with VAT and tolls included.`,
    },
    {
      q: "How long is the drive from Chania Airport to Chania town or Platanias?",
      a: `Chania town is ${town.km} km from the airport, about ${durationLabel(town.minutes)}. Platanias is ${platanias.km} km, about ${durationLabel(platanias.minutes)}. Both are measured on the road rather than in a straight line.`,
    },
    {
      q: "Do you drive to west Crete from Chania Airport?",
      a: `Yes. Kastelli in Kissamos is €${kissamos.oneWay} and around ${durationLabel(kissamos.minutes)}, and Falasarna is €${falasarna.oneWay}. The far west is a genuine drive, and the fare reflects it.`,
    },
  ];
}

function creteTransfersFaqs(): Faq[] {
  const heraklionFloor = floorFare(HERAKLION_AIRPORT);
  const chaniaFloor = floorFare(CHANIA_AIRPORT);

  return [
    {
      q: "Which parts of Crete do you cover?",
      a: "All of it. Both airports, the ports at Souda, Heraklion and Agios Nikolaos, and hotels, villas and resorts from Kissamos in the west to Sitia in the east.",
    },
    {
      q: "Is the price per person or per vehicle?",
      a: `Per vehicle. A family of four pays the same as a single traveller on the same route, from €${heraklionFloor.oneWay} out of Heraklion and €${chaniaFloor.oneWay} out of Chania, and the price does not change if the traffic does.`,
    },
    {
      q: "How does a return transfer work?",
      a: "Book both legs together and the return is charged as one full leg plus a second at 20% off. Both times are confirmed with you before the day, and free cancellation runs to 24 hours before pickup.",
    },
  ];
}

function privateTaxiFaqs(): Faq[] {
  return [
    {
      q: "Is this a shared shuttle or a private taxi?",
      a: "Private, always. The vehicle carries your party and nobody else, it goes directly to your address, and it does not wait to fill up before it leaves.",
    },
    {
      q: "How and when do I pay?",
      a: "After the transfer, in cash to your driver or by card. Nothing is taken when you book, and the price you were quoted is the price at the end of the journey.",
    },
    {
      q: "Can I ask for child seats?",
      a: "Yes. Add them in the booking form and we fit them before pickup — they do not change the fare you were quoted. Tell us the children's ages so the right seat is in the car.",
    },
  ];
}

// The two questions a route page exists to answer. Both are answered in the page's first
// paragraph as well; these are the version Google can lift into the result itself.
function routeFaqs(route: RouteFacts): Faq[] {
  return [
    {
      q: `How much is a taxi from Heraklion Airport to ${route.label}?`,
      a: `€${route.oneWay} one way, fixed at the moment you book. That is the fare for the whole vehicle rather than per person, and it includes VAT, tolls and the driver's waiting time. Booked as a return, the second leg is 20% off.`,
    },
    {
      q: `How long does the transfer from Heraklion Airport to ${route.label} take?`,
      a: `${route.label} is ${route.km} km from the terminal, about ${route.duration} in normal traffic. That is a driving time measured on the road, not a straight-line estimate.`,
    },
  ];
}

export const pageFaqs: Record<string, Faq[]> = {
  "/heraklion-airport-transfer": heraklionFaqs(),
  "/chania-airport-transfer": chaniaFaqs(),
  "/crete-transfers": creteTransfersFaqs(),
  "/private-taxi-crete": privateTaxiFaqs(),
  ...Object.fromEntries(transferRoutes.map((route) => [route.path, routeFaqs(route)])),
};
