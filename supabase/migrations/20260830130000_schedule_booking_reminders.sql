-- Runs the reminder sweep once an hour.
--
-- Hourly rather than daily on purpose. A daily job has to pick an hour, and whichever
-- hour it picks, a transfer leaving just after it gets its "48 hour" reminder at 47
-- hours or at 71. Hourly keeps every reminder inside an hour of the mark, and the
-- sweep costs one indexed scan of a small table when nothing is due.
--
-- pg_cron has to be available on the project. It ships with Supabase but is not on by
-- default; the create extension below turns it on, or Database -> Extensions does the
-- same thing through the dashboard.
create extension if not exists pg_cron;

-- The same shared secret the insert trigger uses, read the same way: out of
-- private.app_secrets through a security definer function, so it is never written
-- into a migration and never reaches git.
--
-- Wrapping the http_post in a function of its own also keeps the cron entry to a
-- single readable call, and means the URL lives in one place rather than inside a
-- string inside a schedule.
create or replace function public.run_booking_reminders()
returns void
language plpgsql
security definer
set search_path = public, private, net
as $$
declare
  secret text;
begin
  select value into secret from private.app_secrets where name = 'webhook_secret';

  perform net.http_post(
    url := 'https://mygrpequjanndhugbkou.supabase.co/functions/v1/booking-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', coalesce(secret, '')
    ),
    body := '{}'::jsonb
  );
end;
$$;

revoke all on function public.run_booking_reminders() from public, anon, authenticated;

-- Unschedule first so re-running this migration replaces the job rather than failing
-- on the duplicate name. cron.unschedule raises if the job is not there, which on a
-- first run is the normal case and not an error.
do $$
begin
  perform cron.unschedule('booking-reminders');
exception
  when others then null;
end
$$;

select cron.schedule(
  'booking-reminders',
  '0 * * * *',
  $$ select public.run_booking_reminders(); $$
);
