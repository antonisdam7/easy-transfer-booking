// Triggered by a database webhook on INSERT into public.transfers.
// Sends two emails through Resend: the booking details to the operator,
// and a confirmation to the customer.

// Deno loads this as a module. TypeScript only treats a file as one once it has an
// import or an export, and with neither, both edge functions look like plain scripts
// sharing a single global scope -- so an editor reports every top-level name here as
// clashing with the same name in the function next door. Nothing is exported; saying
// so is what makes the file a module.
export {};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "";
const MAIL_TO = Deno.env.get("MAIL_TO") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

// What the site publishes as its own contact details -- the same number and address
// as src/lib/seo.ts, which is where they are edited. Repeated rather than imported
// because an edge function runs in Deno and cannot reach into the Vite app; the check
// on them is that they are printed on the Contact page, in the footer and in the
// schema, so a stale copy here is visible against three others.
const CONTACT = {
  phone: "+30 697 626 3677",
  email: "habibitransferscrete@gmail.com",
};

// Where a customer's reply lands.
//
// MAIL_FROM only has to sit on a domain verified in Resend. Verification proves the
// domain may send; it creates no mailbox and adds no MX record, so unless the domain
// is separately set up to receive, a reply to that address bounces -- which is exactly
// the case here, and why this header exists at all.
//
// It falls back to the published address rather than to MAIL_TO. MAIL_TO is wherever
// booking notifications happen to be pointed, which is a different question from
// where a customer should write, and the email below names this address in its own
// text: the two must be the same or the mail contradicts itself.
const MAIL_REPLY_TO = Deno.env.get("MAIL_REPLY_TO") || CONTACT.email;

type Transfer = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  pickup: string;
  dropoff: string;
  // The priced zone each end was charged as. Operator's email only: the customer
  // asked for their hotel and should be told about their hotel.
  pickup_zone: string | null;
  dropoff_zone: string | null;
  pickup_offset_km: string | number | null;
  dropoff_offset_km: string | number | null;
  transfer_date: string;
  transfer_time: string;
  // The return leg. Columns since the 48-hour reminders needed a date something other
  // than a person could read; before that they were text inside notes.
  roundtrip: boolean | null;
  return_date: string | null;
  return_time: string | null;
  return_flight_number: string | null;
  passengers: string;
  vehicle_type: string | null;
  // numeric arrives as a string in the webhook payload.
  price: string | number | null;
  flight_number: string | null;
  luggage: string | null;
  child_seat: boolean | null;
  child_seats: number | null;
  booster_seats: number | null;
  notes: string | null;
};

// Which seats to put in the car. Falls back to the old boolean for bookings taken
// before the two kinds were counted separately.
function formatSeats(t: Transfer): string {
  const parts = [
    t.child_seats ? `${t.child_seats} child seat${t.child_seats > 1 ? "s" : ""} (0-18 kg)` : "",
    t.booster_seats
      ? `${t.booster_seats} booster seat${t.booster_seats > 1 ? "s" : ""} (15-36 kg)`
      : "",
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  return t.child_seat ? "Yes, kind not recorded" : "No";
}

// Routes with no price in the table reach here as null; both emails then say so
// rather than printing an empty amount.
function formatPrice(price: string | number | null): string {
  if (price === null || price === "") return "To be confirmed";
  return `EUR ${Number(price).toFixed(2)}`;
}

// The place as the customer wrote it, followed by the zone it was priced from when
// the two are not the same thing. The kilometres are how far the hotel sits from that
// zone: a small number means the match is safe, a large one is worth checking before
// a driver is sent.
function locationLine(
  label: string,
  place: string,
  zone: string | null,
  offsetKm: string | number | null,
): string {
  if (!zone || zone === place) return `${label}: ${place}`;

  const offset =
    offsetKm === null || offsetKm === "" ? "" : `, ${Number(offsetKm).toFixed(1)} km away`;

  return `${label}: ${place} (priced as ${zone}${offset})`;
}

// A Subject header carrying raw UTF-8 is read back as Latin-1 by a good many mail
// clients: an em dash arrives as three pieces of line noise, a Greek name as gibberish.
// RFC 2047 is the encoding every client understands, so anything outside ASCII goes
// out base64'd. Pure ASCII subjects are left alone, since encoding those only makes
// them unreadable in logs and in any client that skips the decode.
function encodeSubject(subject: string): string {
  // Spelled out rather than matched with /[^\x00-\x7F]/, which needs a control
  // character inside a character class and trips both linters over a rule that is
  // right nearly everywhere else.
  const isAscii = [...subject].every((character) => character.charCodeAt(0) < 128);
  if (isAscii) return subject;

  const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(subject)));
  return `=?UTF-8?B?${base64}?=`;
}

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Transfer;
};

type Email = { to: string; subject: string; text: string };

function operatorEmail(t: Transfer): Email {
  const lines = [
    "New transfer request received",
    "",
    `Name: ${t.name}`,
    `Email: ${t.email}`,
    `Phone: ${t.phone || "-"}`,
    locationLine("Pickup", t.pickup, t.pickup_zone, t.pickup_offset_km),
    locationLine("Dropoff", t.dropoff, t.dropoff_zone, t.dropoff_offset_km),
    `Date: ${t.transfer_date}`,
    `Time: ${t.transfer_time}`,
    `Trip: ${t.roundtrip ? "Return" : "One way"}`,
    ...(t.roundtrip
      ? [
          `Return Date: ${t.return_date || "-"}`,
          `Return Time: ${t.return_time || "-"}`,
          `Return Flight: ${t.return_flight_number || "-"}`,
        ]
      : []),
    `Passengers: ${t.passengers}`,
    `Vehicle: ${t.vehicle_type || "-"}`,
    `Price quoted: ${formatPrice(t.price)}${t.roundtrip ? " (both legs)" : ""}`,
    `Flight Number: ${t.flight_number || "-"}`,
    `Luggage: ${t.luggage || "-"}`,
    `Child Seats: ${formatSeats(t)}`,
    `Notes: ${t.notes || "-"}`,
    "",
    `Request ID: ${t.id}`,
    `Created At: ${t.created_at}`,
  ];

  return {
    to: MAIL_TO,
    subject: `New transfer booking: ${t.name} (${t.transfer_date} ${t.transfer_time})`,
    text: lines.join("\n"),
  };
}

// What the customer will be asked for, and when.
//
// A return is one fare, collected once, at the very start of the holiday. The panel
// on the site arrives at that figure by listing the two legs separately -- outward,
// return at 20% off, total -- which is honest arithmetic and reads to plenty of
// people as two payments due on two different days. Somebody who believes that keeps
// half the fare aside for a fortnight, or worse, comes to the airport on the way home
// expecting to hand over money nobody is going to ask for. So the confirmation says
// it plainly instead of leaving it to be inferred.
function paymentLines(t: Transfer): string[] {
  if (t.price === null || t.price === "") {
    return [
      `Price: ${formatPrice(t.price)}`,
      "We will confirm the fare with you directly, before the day.",
    ];
  }

  if (t.roundtrip) {
    return [
      `Price: ${formatPrice(t.price)} in total, covering both journeys.`,
      "You pay the whole amount to your driver when we collect you on arrival,",
      "in cash or by card. Nothing is charged online, and there is nothing left",
      "to pay on the day you travel home.",
    ];
  }

  return [
    `Price: ${formatPrice(t.price)}`,
    "Payable to the driver, in cash or by card. Nothing is charged online.",
  ];
}

function customerEmail(t: Transfer): Email {
  const lines = [
    `Hi ${t.name},`,
    "",
    "Thank you for booking with Habibi Come to Crete Transfers.",
    "Your transfer is confirmed. Your driver will be waiting for you.",
    "",
    "Your transfer details:",
    "",
    `Pickup: ${t.pickup}`,
    `Dropoff: ${t.dropoff}`,
    `Date: ${t.transfer_date}`,
    `Time: ${t.transfer_time}`,
    // The way back, stated as its own journey rather than as a line saying a return
    // was "requested". The ends are swapped because that is the direction it runs.
    ...(t.roundtrip
      ? [
          "",
          "Your return:",
          `Pickup: ${t.dropoff}`,
          `Dropoff: ${t.pickup}`,
          `Date: ${t.return_date || "-"}`,
          `Time: ${t.return_time || "-"}`,
          ...(t.return_flight_number ? [`Flight Number: ${t.return_flight_number}`] : []),
          "",
        ]
      : []),
    `Passengers: ${t.passengers}`,
    `Vehicle: ${t.vehicle_type || "-"}`,
    t.flight_number ? `Flight Number: ${t.flight_number}` : null,
    t.luggage ? `Luggage: ${t.luggage}` : null,
    t.child_seat || t.child_seats || t.booster_seats ? `Child Seats: ${formatSeats(t)}` : null,
    "",
    ...paymentLines(t),
    "",
    `Reference: ${t.id}`,
    "",
    // This used to say "just reply to this email", which was an instruction the site
    // could not honour: the From line is a sending identity on a verified domain, not
    // a mailbox, and nothing arrives there. The Reply-To header below does route a
    // reply to somewhere real, but it is invisible to the reader and to us -- so the
    // mail no longer asks anyone to trust it, and names the two ways in that can be
    // checked by dialling them.
    "If any of the details above are wrong, or you need to cancel,",
    "get in touch any time:",
    "",
    `  WhatsApp / phone: ${CONTACT.phone}`,
    `  Email: ${CONTACT.email}`,
    "",
    "Habibi Come to Crete Transfers",
    "https://habibitransferscrete.com",
  ].filter((line) => line !== null);

  return {
    to: t.email,
    subject: `Your transfer request ${t.transfer_date} ${t.transfer_time}`,
    text: lines.join("\n"),
  };
}

// One call sends both. A failure for one recipient does not block the other.
async function sendBatch(emails: Email[]) {
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(
      emails.map((email) => ({
        from: MAIL_FROM,
        to: [email.to],
        ...(MAIL_REPLY_TO ? { reply_to: MAIL_REPLY_TO } : {}),
        subject: encodeSubject(email.subject),
        text: email.text,
      })),
    ),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

Deno.serve(async (request) => {
  if (request.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const missing = [
    !RESEND_API_KEY && "RESEND_API_KEY",
    !MAIL_FROM && "MAIL_FROM",
    !MAIL_TO && "MAIL_TO",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error(`Email disabled, missing secrets: ${missing.join(", ")}`);
    return new Response("Email not configured", { status: 500 });
  }

  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const transfer = payload.record;
  if (payload.type !== "INSERT" || !transfer?.id) {
    return new Response("Ignored", { status: 200 });
  }

  const emails = [operatorEmail(transfer)];
  if (transfer.email) {
    emails.push(customerEmail(transfer));
  }

  try {
    await sendBatch(emails);
    console.log(`Sent ${emails.length} emails for booking ${transfer.id}`);
  } catch (error) {
    console.error(`Failed to send emails for booking ${transfer.id}:`, error);
    return new Response("Send failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
