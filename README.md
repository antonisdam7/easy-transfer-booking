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
