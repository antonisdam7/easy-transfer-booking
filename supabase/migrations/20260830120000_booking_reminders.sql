-- The return leg becomes data, so a reminder can be scheduled off it.
--
-- Until now a return was a sentence inside `notes`: "Roundtrip requested: Yes\n
-- Return Date: 2026-09-15\nReturn Time: 14:00". That was enough while the only
-- reader was a person. A reminder has to be sent 48 hours before a leg departs, and
-- nothing that runs on a schedule can read a sentence, so the three return fields
-- become columns of their own.
--
-- The old notes are left exactly as they are. They are what the customer wrote and
-- what the operator was sent, and rewriting history to tidy it is how a record stops
-- being a record. The columns are backfilled from that text instead, so bookings
-- taken before today are remindable too.
--
-- The reminder timestamps are per leg. One booking can be reminded about its outward
-- journey and, a fortnight later, about its return, and neither can go twice.

alter table public.transfers
  add column if not exists roundtrip               boolean not null default false,
  add column if not exists return_date             text,
  add column if not exists return_time             text,
  add column if not exists return_flight_number    text,
  add column if not exists reminder_sent_at        timestamptz,
  add column if not exists return_reminder_sent_at timestamptz;

comment on column public.transfers.roundtrip is
  'True when the customer booked both legs. Backfilled from the notes text on older rows.';
comment on column public.transfers.return_date is
  'Return leg date, yyyy-mm-dd, in the same local wall-clock terms as transfer_date.';
comment on column public.transfers.return_time is
  'Return leg pickup time, HH:MM, local to Crete.';
comment on column public.transfers.return_flight_number is
  'The flight the customer leaves on. Was carried in notes as "Return flight: ...".';
comment on column public.transfers.reminder_sent_at is
  'When the 48-hour reminder for the outward leg was sent. Null means it has not been.';
comment on column public.transfers.return_reminder_sent_at is
  'When the 48-hour reminder for the return leg was sent. Null means it has not been.';

-- Backfill from the text we wrote ourselves, so the patterns are ours to rely on.
-- Guarded on roundtrip still being false so re-running the migration cannot undo a
-- later correction made by hand.
update public.transfers
set roundtrip   = true,
    return_date = coalesce(return_date, substring(notes from 'Return Date: (\d{4}-\d{2}-\d{2})')),
    return_time = coalesce(return_time, substring(notes from 'Return Time: (\d{1,2}:\d{2})'))
where notes like '%Roundtrip requested: Yes%'
  and roundtrip = false;

update public.transfers
set return_flight_number = substring(notes from 'Return flight: ([^\n]+)')
where return_flight_number is null
  and notes like '%Return flight:%';

-- When a leg actually departs.
--
-- transfer_date and transfer_time are text, and have been since the old Express
-- backend wrote them, so the moment has to be assembled rather than read. Crete keeps
-- Europe/Athens, and a booking for "14:00" means two o'clock there whatever the
-- server thinks the time is -- which is the whole reason this is not a naive cast.
--
-- Returns null rather than raising on anything it cannot parse. A single malformed
-- row from the old backend would otherwise take down every reminder in the same
-- query, which is a bad trade for a field no scheduler should have trusted anyway.
--
-- Stable, not immutable: `at time zone` depends on the timezone database, which can
-- change under it. That rules out indexing on this, which is why the partial index
-- below is on the raw date column instead.
create or replace function public.transfer_moment(leg_date text, leg_time text)
returns timestamptz
language plpgsql
stable
set search_path = public
as $$
begin
  if leg_date is null or leg_date = '' or leg_time is null or leg_time = '' then
    return null;
  end if;

  return (leg_date || ' ' || leg_time)::timestamp at time zone 'Europe/Athens';
exception
  when others then return null;
end;
$$;

-- Narrows the hourly scan to rows that could still be owed something.
create index if not exists transfers_pending_reminder_idx
  on public.transfers (transfer_date)
  where reminder_sent_at is null;

create index if not exists transfers_pending_return_reminder_idx
  on public.transfers (return_date)
  where return_reminder_sent_at is null;

-- Every leg departing inside the next 48 hours that has not been reminded yet.
--
-- One row per leg, not per booking, and already flattened into what the email needs:
-- the return leg comes back with its ends swapped, because the journey home starts
-- where the journey out finished. That keeps the leg logic here, in the one place
-- that can see both columns, rather than in the function that sends the mail.
--
-- `created_at < now() - interval '1 hour'` stops a booking made for tomorrow from
-- being "reminded" a moment after its own confirmation email. Below that age the
-- confirmation is the reminder.
--
-- The window is open-ended downwards on purpose -- anything from now to 48 hours out
-- qualifies -- so a missed run catches up on the next pass instead of leaving a hole.
create or replace function public.transfers_due_for_reminder()
returns table (
  leg           text,
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
  select 'outward'::text, t.id, t.name, t.email,
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

  select 'return'::text, t.id, t.name, t.email,
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

-- Customer names, emails and phone numbers, in one call. Only the reminder function
-- may ask, and it presents the service role key to do it.
revoke all on function public.transfers_due_for_reminder() from public, anon, authenticated;
grant execute on function public.transfers_due_for_reminder() to service_role;
