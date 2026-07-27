# Easy Transfer Booking

Booking site for Habibi Come to Crete Transfers. Vite + React frontend on Vercel,
Supabase for the database, authentication and the transactional emails. There is
no backend server to run or host.

## Run the app

```bash
npm install
cp .env.example .env   # fill in the two VITE_ values from Supabase
npm run dev
```

Frontend: `http://localhost:8080`

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` come from Supabase →
Project Settings → API. Both are public by design; the anon key ships in the
JavaScript bundle and access is controlled by row level security, not secrecy.

## Supabase setup

### 1. Database

Run `supabase/migrations/20260727120000_create_transfers.sql` in the SQL editor.
It creates the `transfers` table and its policies:

- `anon` may insert a booking and can never read one back
- `authenticated` may read and update every booking

Because visitors have no select policy, an insert must not chain `.select()` —
asking for the inserted row back fails the whole write. See `src/lib/transfers.ts`.

### 2. Admin user

Auth → Users → Add user. That email and password are the admin login at
`/admin/login`. There are no `ADMIN_USERNAME` / `ADMIN_PASSWORD` variables any more.

### 3. Booking emails

`supabase/functions/booking-emails` sends two emails through Resend on every new
booking: the full details to the operator, and a confirmation to the customer.
Bookings are confirmed on submission; there is no approval step.

Deploy it, then set under Edge Functions → Secrets:

| Secret | Value |
| --- | --- |
| `RESEND_API_KEY` | from resend.com |
| `MAIL_FROM` | e.g. `bookings@habibitransferscrete.com`, on a domain verified in Resend |
| `MAIL_TO` | where new booking notifications are sent |
| `WEBHOOK_SECRET` | random string |

Then Database → Webhooks → Create:

- Table `transfers`, event **Insert** only
- Type: Supabase Edge Functions → `booking-emails`
- HTTP header `x-webhook-secret` set to the same value as the secret

The function checks that header itself and `supabase/config.toml` turns off the
built-in JWT check. That check would not help here: the anon key is a valid JWT
and is public, so anyone could otherwise invoke the function and send mail from
the verified domain.

Sending to customers requires a verified domain in Resend. The free
`onboarding@resend.dev` sender only delivers to your own Resend account address.

## Deployment

Vercel, connected to this repository. Build command `npm run build`, output `dist`.
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project settings.

`vercel.json` rewrites every path to `/index.html`. Without it each route other
than `/` returns 404, which breaks the SEO landing pages.
