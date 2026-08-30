-- Tells the reminder whether the booking has a return leg.
--
-- The fare is collected once, in full, when the driver picks the customer up on
-- arrival -- there is no second payment on the way home. Both reminders have to say
-- so, and they have to say opposite things: the outward one that this amount covers
-- both journeys, the homeward one that there is nothing left to pay. Neither sentence
-- can be written without knowing a return exists, and the outward leg of a one-way
-- booking looks identical to the outward leg of a return one without this flag.
--
-- Adding a column to the result changes the function's return type, which Postgres
-- will not do through `create or replace`. Hence the drop.

drop function if exists public.transfers_due_for_reminder();

create function public.transfers_due_for_reminder()
returns table (
  leg           text,
  roundtrip     boolean,
  id            text,
  name          text,
  email         text,
  pickup        text,
  dropoff       text,
  leg_date      text,
  leg_time      text,
  passengers    text,
  vehicle_type  text,
  price         numeric,
  flight_number text,
  child_seats   integer,
  booster_seats integer
)
language sql
stable
set search_path = public
as $$
  select 'outward'::text, t.roundtrip, t.id, t.name, t.email,
         t.pickup, t.dropoff, t.transfer_date, t.transfer_time,
         t.passengers, t.vehicle_type, t.price, t.flight_number,
         t.child_seats, t.booster_seats
  from public.transfers t
  where t.status = 'confirmed'
    and coalesce(t.email, '') <> ''
    and t.reminder_sent_at is null
    and t.created_at < now() - interval '1 hour'
    and public.transfer_moment(t.transfer_date, t.transfer_time) > now()
    and public.transfer_moment(t.transfer_date, t.transfer_time) <= now() + interval '48 hours'

  union all

  -- Always true on this side: only a booking with a return leg has one to remind about.
  select 'return'::text, true, t.id, t.name, t.email,
         t.dropoff, t.pickup, t.return_date, t.return_time,
         t.passengers, t.vehicle_type, t.price, t.return_flight_number,
         t.child_seats, t.booster_seats
  from public.transfers t
  where t.status = 'confirmed'
    and t.roundtrip
    and coalesce(t.email, '') <> ''
    and t.return_reminder_sent_at is null
    and t.created_at < now() - interval '1 hour'
    and public.transfer_moment(t.return_date, t.return_time) > now()
    and public.transfer_moment(t.return_date, t.return_time) <= now() + interval '48 hours'
$$;

revoke all on function public.transfers_due_for_reminder() from public, anon, authenticated;
grant execute on function public.transfers_due_for_reminder() to service_role;
