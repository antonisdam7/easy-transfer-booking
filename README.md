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

1. Copy `.env.example` to `.env`
2. Fill SMTP values in `.env`
3. Restart backend (`npm run dev:backend`) or all services (`npm run dev:all`)

Required email variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE` (`true` for SSL/465, `false` for TLS/587)
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `MAIL_TO`

For Gmail:

- Use `SMTP_HOST=smtp.gmail.com`
- Use an App Password (not your normal Gmail password)

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
