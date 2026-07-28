// Triggered by a database webhook on INSERT into public.transfers.
// Sends two emails through Resend: the booking details to the operator,
// and a confirmation to the customer.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "";
const MAIL_TO = Deno.env.get("MAIL_TO") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

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
  // deno-lint-ignore no-control-regex
  if (!/[^\x00-\x7F]/.test(subject)) return subject;

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
    `Passengers: ${t.passengers}`,
    `Vehicle: ${t.vehicle_type || "-"}`,
    `Price quoted: ${formatPrice(t.price)}`,
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
    `Passengers: ${t.passengers}`,
    `Vehicle: ${t.vehicle_type || "-"}`,
    t.flight_number ? `Flight Number: ${t.flight_number}` : null,
    t.luggage ? `Luggage: ${t.luggage}` : null,
    t.child_seat || t.child_seats || t.booster_seats ? `Child Seats: ${formatSeats(t)}` : null,
    "",
    `Price: ${formatPrice(t.price)}`,
    "Payable to the driver, in cash or by card. Nothing is charged online.",
    "",
    `Reference: ${t.id}`,
    "",
    "If any of the details above are wrong, or you need to cancel,",
    "just reply to this email and we will sort it out.",
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
