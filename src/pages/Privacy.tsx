import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { CONTACT } from "@/lib/seo";

// What the site actually does with what people give it.
//
// Written against the code rather than from a template. Every claim below is
// checkable: the booking fields are the columns in supabase/migrations, the search
// field is src/lib/places.ts, the emails are supabase/functions, and the analytics
// are src/lib/analytics.ts. If one of those changes, this page is wrong and has to
// change with it -- which is the only reason a privacy policy is worth anything.
//
// Two things here are easy to miss and are stated plainly for that reason: the hotel
// search sends keystrokes to Google before anyone has consented to anything, because
// there is no booking without it; and Resend sees every detail of a booking, because
// it is the thing that writes the email.

const UPDATED = "30 August 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-display font-semibold text-primary">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  useSeo("/privacy");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl space-y-10 px-4 py-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            What we collect when you book a transfer, who else sees it, and what you can
            ask us to do about it. Last updated {UPDATED}.
          </p>
        </header>

        <Section title="Who is responsible">
          <p>
            Habibi Come to Crete Transfers, operating in Crete, Greece, decides what is
            collected on this site and why. We are the data controller under the General
            Data Protection Regulation.
          </p>
          <p>
            Reach us on{" "}
            <a className="underline hover:text-primary" href={`tel:${CONTACT.telephone.replace(/\s/g, "")}`}>
              {CONTACT.telephone}
            </a>{" "}
            or at{" "}
            <a className="underline hover:text-primary" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            . Anything on this page can be asked about at either.
          </p>
        </Section>

        <Section title="What you give us when you book">
          <p>
            The booking form asks for your name, email address and mobile number, where we
            are collecting you and where you are going, the date and time, how many of you
            there are, and which vehicle you chose. If the journey starts or ends at an
            airport it asks for your flight number, and there are optional fields for
            luggage, child seats and anything you want the driver to know.
          </p>
          <p>
            We keep the fare you were quoted alongside it, so there is a record of the
            price if it is ever questioned. We also record which of our priced zones your
            address fell into — that is how the fare is worked out, and it is only ever
            seen by us.
          </p>
          <p>
            We need all of this to drive you: it is processing necessary to perform the
            booking you asked for. Without it there is no transfer, which is why none of
            those fields ask your permission first.
          </p>
        </Section>

        <Section title="Searching for your hotel">
          <p>
            The pickup and drop-off fields search Google Places. From the third character
            you type, what is in the box is sent to Google so it can suggest matching
            hotels and addresses, and when you pick one, Google returns its coordinates.
          </p>
          <p>
            This happens whether or not you accept cookies, because there is no way to
            take a booking to an address we cannot find. Google processes that search
            under its own privacy policy. The route map on the results page loads from
            Google in the same way.
          </p>
        </Section>

        <Section title="Who else sees a booking">
          <p>Four companies handle your booking on our behalf, and none for their own ends:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Supabase</strong> stores the booking. It
              is the database behind this site.
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> sends the two emails —
              your confirmation and our copy — so it sees the details it has to print in
              them.
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> serves the site, and
              like any web host keeps short-lived server logs that include IP addresses.
            </li>
            <li>
              <strong className="text-foreground">Google</strong> handles the address
              search described above, and the analytics below if you allow them.
            </li>
          </ul>
          <p>
            These are US companies that process data in Europe and elsewhere under the
            standard contractual clauses and transfer frameworks the GDPR provides for.
            We do not sell anything to anyone, and nobody outside this list is given your
            details.
          </p>
        </Section>

        <Section title="Cookies and counting visits">
          <p>
            This site sets no cookies at all unless you say yes to the banner. Decline it,
            or ignore it, and Google Analytics is never loaded — not loaded and switched
            off, but never fetched, so there is nothing to set a cookie with.
          </p>
          <p>
            If you accept, Google Analytics records which pages you look at and how far
            through the booking you get, so we can see where the site is confusing. Your
            answer is remembered in your browser's local storage rather than in a cookie,
            because recording a refusal of cookies by setting a cookie would be absurd.
          </p>
          <p>
            To change your mind later, clear this site's data in your browser settings and
            the question will be asked again.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Bookings are kept while the transfer is being arranged and afterwards as
            business records. Greek tax law requires accounting records to be kept for
            several years, and a booking with a fare on it is one, so we keep them for
            that period and then delete them.
          </p>
          <p>
            Analytics data is held by Google for the retention period set on our property.
            It is not linked to your booking, and we cannot look up an individual person
            in it.
          </p>
        </Section>

        <Section title="What you can ask for">
          <p>
            You can ask us for a copy of what we hold about you, to correct it if it is
            wrong, to delete it, to restrict what we do with it, to receive it in a
            portable form, or to object to our processing it. If you accepted analytics
            you can withdraw that at any time, and withdrawing does not affect anything
            done before.
          </p>
          <p>
            Write to{" "}
            <a className="underline hover:text-primary" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>{" "}
            and we will answer within a month. There is one exception we will tell you
            about honestly: we cannot delete a booking whose record we are legally required
            to keep for tax purposes until that period is up.
          </p>
          <p>
            If you think we have handled your data badly, you can complain to the Hellenic
            Data Protection Authority at{" "}
            <a
              className="underline hover:text-primary"
              href="https://www.dpa.gr"
              target="_blank"
              rel="noopener noreferrer"
            >
              dpa.gr
            </a>
            . We would rather you told us first, but it is your right either way.
          </p>
        </Section>

        <Section title="Changes to this page">
          <p>
            If we start collecting something new, or hand data to somebody not listed
            above, this page changes before that happens and the date at the top changes
            with it.
          </p>
        </Section>

        <div className="border-t pt-8">
          <Link
            to="/"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to booking
          </Link>
        </div>
      </div>
    </div>
  );
}
