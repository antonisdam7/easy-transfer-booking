import { VehicleType } from "@/lib/booking";

// The three cars, in one place.
//
// This list used to live inside the results page, which is lazily loaded and only ever
// reached with a search behind it. The homepage now shows the same three cars, and two
// copies of a passenger count is how a site ends up promising four seats on one page and
// three on another.
//
// Passenger and luggage figures are the operator's own. The example models say what
// actually turns up, so a booking is not read as a promise of one particular car.

export type Vehicle = {
  type: VehicleType;
  name: string;
  image: string;
  // The file's own pixels, so the browser reserves the right box before it arrives
  // and the three cards do not jump when they load.
  width: number;
  height: number;
  passengers: number;
  suitcases: number;
  examples: string;
  badge?: string;
};

export const fleet: Vehicle[] = [
  {
    type: "sedan",
    name: "Mercedes E-Class Sedan",
    image: "/vehicle-sedan.webp",
    width: 1024,
    height: 558,
    passengers: 4,
    suitcases: 4,
    examples: "Mercedes E-Class or similar",
  },
  {
    type: "estate",
    name: "Mercedes E-Class Estate",
    image: "/vehicle-estate.webp",
    width: 1024,
    height: 558,
    passengers: 4,
    suitcases: 7,
    examples: "Mercedes E-Class Estate or similar",
    badge: "Same price, more boot",
  },
  {
    type: "van",
    name: "Minivan Mercedes V-Class",
    image: "/vehicle-van.webp",
    width: 720,
    height: 392,
    passengers: 8,
    suitcases: 8,
    examples: "Mercedes V-Class or similar",
  },
  {
    type: "minibus",
    name: "Minibus",
    // A drawing, not a photograph. There is no picture of this vehicle yet, and it is
    // better to show something obviously illustrative than to pass off a stock image
    // as the bus that turns up. Swap the file when a real photograph exists.
    image: "/vehicle-minibus.svg",
    width: 1024,
    height: 558,
    passengers: 16,
    suitcases: 16,
    examples: "Mercedes Sprinter or similar",
    badge: "Largest group",
  },
];

// The biggest party we can carry, read off the fleet rather than typed into the booking
// form. The form used to stop at eight because the minivan did; buy a bigger vehicle,
// add it here, and the seats appear in the form the same day.
export const largestParty = Math.max(...fleet.map((vehicle) => vehicle.passengers));
