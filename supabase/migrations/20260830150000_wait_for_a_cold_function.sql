-- Gives an edge function time to wake up before pg_net stops listening.
--
-- net.http_post waits five seconds by default. A Supabase edge function that has not
-- run recently takes longer than that to cold start, so the first call after a quiet
-- spell records no status at all: net._http_response gets a row with a null
-- status_code, timed_out true, and "Timeout of 5000 ms reached".
--
-- The mail still goes. The request was already delivered and the function runs to
-- completion on its own; only the listener gave up. But that is precisely the problem
-- worth fixing -- a timed-out call and a genuinely failed one look identical from
-- here, so a 500 from Resend would be invisible, and the trigger below has been
-- running blind like this since the day it was written.
--
-- Thirty seconds is well past a cold start and well under anything that would hold a
-- transaction open in a way anyone would notice: pg_net does the waiting in its own
-- background worker, not in the statement that queued the request.

create or replace function public.notify_booking_emails()
returns trigger
language plpgsql
security definer
set search_path = public, private, net
as $$
declare
  secret text;
begin
  select value into secret from private.app_secrets where name = 'webhook_secret';

  perform net.http_post(
    url := 'https://mygrpequjanndhugbkou.supabase.co/functions/v1/booking-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', coalesce(secret, '')
    ),
    -- Shape matches what the edge function expects from a database webhook.
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'transfers',
      'record', to_jsonb(new)
    ),
    timeout_milliseconds := 30000
  );

  return new;
end;
$$;

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
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function public.run_booking_reminders() from public, anon, authenticated;
