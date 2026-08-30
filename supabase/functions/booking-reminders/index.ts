// Reminds customers 48 hours before a leg departs.
//
// Called on a schedule by pg_cron, not by anything a visitor can reach -- see
// supabase/migrations/20260830130000_schedule_booking_reminders.sql. It authenticates
// the same way booking-emails does, with the shared secret in x-webhook-secret, and
// config.toml turns Supabase's own JWT check off for the same reason: the anon key is
// a valid JWT and it is public.
//
// The question of which legs are due is answered in SQL, by
// public.transfers_due_for_reminder(), because only the database can see both legs of
// a booking and the clock at once. This file decides nothing about timing; it sends
// what it is handed and records that it did.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "";
const MAIL_TO = Deno.env.get("MAIL_TO") ?? "";
// Where a customer's reply lands. The From address only has to live on a domain
// verified in Resend -- it is a header, not a mailbox, and nothing receives there.
// Without this, "just reply to this email" is an instruction to write into the void.
const MAIL_REPLY_TO = Deno.env.get("MAIL_REPLY_TO") || MAIL_TO;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

// Injected into every Supabase edge function. The service role bypasses row level
// security, which is what lets this read customer rows that no browser may read.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Resend accepts at most 100 messages per batch call.
const BATCH_LIMIT = 100;

type Leg = "outward" | "return";

type DueReminder = {
  leg: Leg;
  id: string;
  name: string;
  email: string;
  // Already swapped for the return leg: the journey home starts where the journey
  // out finished, and the SQL does that so this file never has to think about it.
  pickup: string;
  dropoff: string;
  leg_date: string;
  leg_time: string;
  passengers: string;
  vehicle_type: string | null;
  price: string | number | null;
  flight_number: string | null;
  child_seats: number | null;
  booster_seats: number | null;
};

type Email = { to: string; subject: string; text: string };

// "Tue, 15 Sep 2026". Falls back to the raw value rather than printing "Invalid
// Date" at a customer, since the column is text and always has been.
function formatDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatSeats(reminder: DueReminder): string {
  const parts = [
    reminder.child_seats ? `${reminder.child_seats} child seat${reminder.child_seats > 1 ? "s" : ""}` : "",
    reminder.booster_seats
      ? `${reminder.booster_seats} booster seat${reminder.booster_seats > 1 ? "s" : ""}`
      : "",
  ].filter(Boolean);

  return parts.join(", ");
}

// See booking-emails: a Subject carrying raw UTF-8 is read back as Latin-1 by a good
// many clients, so anything outside ASCII goes out RFC 2047 encoded.
function encodeSubject(subject: string): string {
  const isAscii = [...subject].every((character) => character.charCodeAt(0) < 128);
  if (isAscii) return subject;

  const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(subject)));
  return `=?UTF-8?B?${base64}?=`;
}

function reminderEmail(r: DueReminder): Email {
  const isReturn = r.leg === "return";
  const seats = formatSeats(r);

  const lines = [
    `Hi ${r.name},`,
    "",
    isReturn
      ? "Your return transfer is the day after tomorrow. Here are the details again."
      : "Your transfer is the day after tomorrow. Here are the details again.",
    "",
    `Pickup: ${r.pickup}`,
    `Dropoff: ${r.dropoff}`,
    `Date: ${formatDay(r.leg_date)}`,
    `Time: ${r.leg_time}`,
    `Passengers: ${r.passengers}`,
    `Vehicle: ${r.vehicle_type || "-"}`,
    r.flight_number ? `Flight: ${r.flight_number}` : null,
    seats ? `Child seats: ${seats}` : null,
    "",
    // Only on the outward leg. `price` is the total for the whole booking, so
    // repeating it beside the return would read as a second charge.
    !isReturn && r.price !== null && r.price !== ""
      ? `Total for your booking: EUR ${Number(r.price).toFixed(2)}, payable to the driver in cash or by card.`
      : null,
    !isReturn && (r.price === null || r.price === "") ? "We will confirm the fare with you directly." : null,
    "",
    r.flight_number
      ? "We track the flight, so a delay moves your pickup rather than costing you it."
      : "If your plans move, reply to this email and we will move the pickup with them.",
    "",
    "Anything wrong above, or need to cancel? Just reply to this email.",
    "",
    "See you soon,",
    "Habibi Come to Crete Transfers",
    "https://habibitransferscrete.com",
  ].filter((line) => line !== null);

  return {
    to: r.email,
    subject: isReturn
      ? `Reminder: your return transfer on ${formatDay(r.leg_date)} at ${r.leg_time}`
      : `Reminder: your transfer on ${formatDay(r.leg_date)} at ${r.leg_time}`,
    text: lines.join("\n"),
  };
}

async function dueReminders(): Promise<DueReminder[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/transfers_due_for_reminder`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) {
    throw new Error(`Could not read due reminders (${response.status}): ${await response.text()}`);
  }

  return await response.json();
}

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

  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${await response.text()}`);
  }
}

// Written only after Resend has accepted the batch. A reminder that failed to send
// stays unmarked and goes out on the next run, which is the right way round: a
// customer reminded twice is a nuisance, a customer never reminded is the bug.
async function markSent(leg: Leg, ids: string[]) {
  if (ids.length === 0) return;

  const column = leg === "return" ? "return_reminder_sent_at" : "reminder_sent_at";
  const list = ids.map((id) => `"${id}"`).join(",");

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/transfers?id=in.(${encodeURIComponent(list)})`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ [column]: new Date().toISOString() }),
    },
  );

  if (!response.ok) {
    throw new Error(`Could not mark ${leg} reminders sent (${response.status}): ${await response.text()}`);
  }
}

Deno.serve(async (request) => {
  if (request.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const missing = [
    !RESEND_API_KEY && "RESEND_API_KEY",
    !MAIL_FROM && "MAIL_FROM",
    !SUPABASE_URL && "SUPABASE_URL",
    !SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error(`Reminders disabled, missing secrets: ${missing.join(", ")}`);
    return new Response("Reminders not configured", { status: 500 });
  }

  let due: DueReminder[];
  try {
    due = await dueReminders();
  } catch (error) {
    console.error("Could not read due reminders:", error);
    return new Response("Query failed", { status: 500 });
  }

  if (due.length === 0) {
    return new Response("Nothing due", { status: 200 });
  }

  let sent = 0;
  try {
    for (let start = 0; start < due.length; start += BATCH_LIMIT) {
      const chunk = due.slice(start, start + BATCH_LIMIT);

      await sendBatch(chunk.map(reminderEmail));

      // Per chunk, so an later chunk failing cannot un-record the ones already sent.
      await markSent("outward", chunk.filter((r) => r.leg === "outward").map((r) => r.id));
      await markSent("return", chunk.filter((r) => r.leg === "return").map((r) => r.id));

      sent += chunk.length;
    }
  } catch (error) {
    console.error(`Reminder run failed after ${sent} of ${due.length}:`, error);
    return new Response("Send failed", { status: 500 });
  }

  console.log(`Sent ${sent} reminders`);
  return new Response(`Sent ${sent}`, { status: 200 });
});
