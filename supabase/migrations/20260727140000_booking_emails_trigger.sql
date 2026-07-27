-- Calls the booking-emails edge function whenever a booking is inserted.
--
-- This replaces what the dashboard used to offer as a "Database Webhook". That UI
-- is gone (webhooks were folded into Database Triggers, which only accept plpgsql
-- functions) and supabase_functions.http_request is not installed on this project,
-- so the trigger is written directly against pg_net.

-- No `with schema` clause: pg_net is not relocatable and creates its own `net` schema.
create extension if not exists pg_net;

-- The shared secret lives in a table rather than in this file, so it stays out of git.
-- A session setting (alter database ... set) was the obvious alternative but only
-- applies to new connections, and PostgREST holds a pool — the secret would appear
-- to work only after connections happened to recycle.
--
-- The `private` schema is not exposed through PostgREST, and RLS is on with no
-- policies, so nothing can read this table except the security definer function below.
create schema if not exists private;

create table if not exists private.app_secrets (
  name  text primary key,
  value text not null
);

alter table private.app_secrets enable row level security;

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
    )
  );

  return new;
end;
$$;

drop trigger if exists on_transfer_created on public.transfers;
create trigger on_transfer_created
  after insert on public.transfers
  for each row
  execute function public.notify_booking_emails();
