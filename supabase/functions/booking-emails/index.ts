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
  transfer_date: string;
  transfer_time: string;
  passengers: string;
  vehicle_type: string | null;
  flight_number: string | null;
  luggage: string | null;
  child_seat: boolean;
  notes: string | null;
};

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
    `Pickup: ${t.pickup}`,
    `Dropoff: ${t.dropoff}`,
    `Date: ${t.transfer_date}`,
    `Time: ${t.transfer_time}`,
    `Passengers: ${t.passengers}`,
    `Vehicle: ${t.vehicle_type || "-"}`,
    `Flight Number: ${t.flight_number || "-"}`,
    `Luggage: ${t.luggage || "-"}`,
    `Child Seat: ${t.child_seat ? "Yes" : "No"}`,
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
    t.child_seat ? "Child Seat: Yes" : null,
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
    subject: `Your transfer request — ${t.transfer_date} ${t.transfer_time}`,
    text: lines.join("\n"),
  };
}

// One call sends both. A failure for one recipient does not block the other.
async function sendBatch(emails: Email[]) {
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      emails.map((email) => ({
        from: MAIL_FROM,
        to: [email.to],
        subject: email.subject,
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
