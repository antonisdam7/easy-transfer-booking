// The recommendations left on the Facebook page, copied across word for word.
//
// Facebook dropped star ratings in 2018. It asks whether someone recommends the business,
// and all five said yes -- so there is no average to publish and no stars to draw, and
// inventing either would misrepresent what these people actually did. The page reads
// "5 recommendations" because that is what there are.
//
// Deliberately not marked up as Review or AggregateRating schema. Google's structured data
// guidelines exclude self-serving reviews -- reviews about a business, published on that
// business's own site -- from review rich results, so the markup would at best be ignored
// and at worst read as an attempt at stars nobody earned here. Stars beside a search
// result come from a Google Business Profile, which this business does not yet have.
//
// These are here for the person reading the page and hesitating over the fare.

export type Review = {
  name: string;
  // ISO for the <time> element, and the label the reader sees. Facebook omits the year on
  // anything from the current one, which is why the April entry is 2026 and the rest 2025.
  date: string;
  dateLabel: string;
  text: string;
};

export const FACEBOOK_REVIEWS_URL =
  "https://www.facebook.com/profile.php?id=61575578152214&sk=reviews";

// Newest first.
export const reviews: Review[] = [
  {
    name: "Παύλος Μπελιπασάκης",
    date: "2026-04-01",
    dateLabel: "1 April 2026",
    text: "Amazing service! Definitely recommend",
  },
  {
    name: "Hannah Lennartsson",
    date: "2025-07-23",
    dateLabel: "23 July 2025",
    text: "Very friendly driver and great service!",
  },
  {
    name: "Tatum Ellis",
    date: "2025-07-13",
    dateLabel: "13 July 2025",
    text: "Super helpful and friendly. Helped us with taxis for the duration of our stay. Would highly recommend",
  },
  {
    name: "Charlie Neate",
    date: "2025-06-21",
    dateLabel: "21 June 2025",
    text: "Picked us up and dropped us off to the airport, very chatty and friendly 🙂 Will be using him again if we come back! Definitely recommend",
  },
  {
    name: "Μάνος Φιλιππάκης",
    date: "2025-05-10",
    dateLabel: "10 May 2025",
    text: "Had a great ride with Antonis! Super friendly, professional, and made the whole trip really comfortable. The car was clean, the ride was smooth, and he even helped with some local tips along the way. Definitely someone I'd call again, thanks Antoni!",
  },
];
