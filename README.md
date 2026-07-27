# Easy Transfer Booking

## Run the app

```bash
npm install
npm run dev:all
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000`

## Admin login

- URL: `http://localhost:8080/admin/login`
- Default username: `admin`
- Default password: `admin123`

Change credentials using environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Email notifications for new bookings

Set variables on **Render** (backend), not Netlify.

### Recommended: Resend (Render free tier)

Render **blocks SMTP** on ports 587/465. Use Resend instead (HTTPS, not blocked).

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your domain (e.g. `habibitransferscrete.com`), or use `onboarding@resend.dev` only for quick tests to your Resend account email
3. Create an API key
4. On Render → Environment, set:
   - `RESEND_API_KEY=re_...`
   - `MAIL_FROM=bookings@yourdomain.com` (must match a verified sender in Resend)
   - `MAIL_TO=habibitransferscrete@gmail.com`
5. Redeploy and check `https://<your-render-service>/api/health` → `email.provider` should be `"resend"`

### Optional: SMTP (local dev or paid Render)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `MAIL_TO`
- Gmail: use an App Password, not your normal password

`EMAIL_PROVIDER` can be `auto` (default: Resend if API key set, else SMTP), `resend`, or `smtp`.

## Persistent storage (recommended for production)

By default, local development can use JSON file storage. In production, use PostgreSQL so transfers do not disappear after restarts.

Environment variables:

- `DATABASE_URL` (PostgreSQL connection string)
- `DATABASE_SSL` (`true` on cloud providers like Supabase/Render, `false` for local DB)

When `DATABASE_URL` is set, the backend automatically:

- connects to PostgreSQL
- creates the `transfers` table if needed
- stores and reads transfers from DB

If `DATABASE_URL` is not set, backend falls back to `server/data/transfers.json`.

### Supabase quick setup

1. Create a Supabase project
2. Open `Project Settings -> Database` and copy the connection string
3. Set on Render:
   - `DATABASE_URL=<your-supabase-connection-string>`
   - `DATABASE_SSL=true`
4. Redeploy backend service
