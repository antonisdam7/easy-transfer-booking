import { Search, MailCheck, PlaneLanding } from "lucide-react";

// Three steps, because the question a first-time visitor is actually asking is not
// "how much" -- the fares are published two screens down -- but "what happens after I
// press this button, and what if my flight is late".
//
// Every claim here is one the site already makes somewhere else: the confirmation
// window and the flight monitoring come from the FAQ answers, the cancellation window
// from the line under the form, the fixed fare from the note under every fare table.
// Nothing was invented to fill the section out. In particular there is nothing here
// about name boards or meeting points, because the site has never said how the driver
// finds you and a plausible guess is still a guess.

const steps = [
  {
    icon: Search,
    title: "Search and see the price",
    body: "Enter where you are landing and where you are staying. Every car that fits your party comes back with its own fare, per vehicle rather than per seat, before you have entered a single detail about yourself.",
  },
  {
    icon: MailCheck,
    title: "Book and get it confirmed",
    body: "Leave your flight number and where to reach you. We confirm the booking by email or WhatsApp within a few hours, and cancelling is free up to 24 hours before pickup.",
  },
  {
    icon: PlaneLanding,
    title: "Land and go",
    body: "We watch the arrivals board. A delayed flight moves your pickup to the time you actually land, at no extra cost, and the fare you were quoted is the fare you pay — VAT, tolls and the driver's waiting time included.",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-6" aria-labelledby="how-it-works">
      <h2 id="how-it-works" className="text-xl font-display font-semibold text-primary">
        How it works
      </h2>
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display font-semibold text-primary">
                {/* The number is decoration over an ordered list, which already
                    numbers itself for anyone not looking at it. */}
                <span aria-hidden="true" className="text-muted-foreground">{index + 1}. </span>
                {title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
