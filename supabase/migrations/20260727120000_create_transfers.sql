-- Transfers table + row level security.
--
-- The table already exists in production: the old Express backend created it via
-- server/storage.js and it holds live bookings. So this migration is written to
-- run safely against that table as well as against an empty project. It never
-- drops or rewrites data.
--
-- Column names match what the old backend used, so the frontend TransferRequest
-- type is unchanged.

-- Fresh project only. On production this is a no-op and the ALTERs below do the work.
create table if not exists public.transfers (
  id             text primary key,
  created_at     timestamptz not null,
  name           text not null,
  email          text not null,
  phone          text,
  pickup         text not null,
  dropoff        text not null,
  transfer_date  text not null,
  transfer_time  text not null,
  passengers     text not null,
  vehicle_type   text,
  flight_number  text,
  luggage        text,
  child_seat     boolean default false,
  notes          text
);

-- The old backend generated id and created_at in JavaScript. The browser cannot be
-- trusted to do that, so the database generates them from now on.
alter table public.transfers alter column id         set default gen_random_uuid()::text;
alter table public.transfers alter column created_at set default now();

-- Bookings are confirmed on submission; there is no approval step. The admin can
-- later move a booking to cancelled or completed.
alter table public.transfers
  add column if not exists status text not null default 'confirmed';

do $$
begin
  alter table public.transfers
    add constraint transfers_status_check
    check (status in ('confirmed', 'cancelled', 'completed'));
exception
  when duplicate_object then null;
end
$$;

-- The admin list is always ordered newest first.
create index if not exists transfers_created_at_idx
  on public.transfers (created_at desc);

-- Until now this table was reachable only from the server through DATABASE_URL, so
-- it never needed policies. The new frontend talks to it with the public anon key,
-- which means RLS is the only thing standing between a visitor and every customer
-- name, email and phone number in here.
alter table public.transfers enable row level security;

-- Visitors submit bookings and can never read anything back, not even their own row.
-- status is pinned so a visitor cannot submit a booking already marked cancelled
-- or completed, which would hide it from the admin's working list.
drop policy if exists "anon can submit a booking" on public.transfers;
create policy "anon can submit a booking"
  on public.transfers
  for insert
  to anon
  with check (status = 'confirmed');

-- Only signed-in users see bookings. There is one user (the admin), so `to authenticated`
-- is enough; revisit if customer accounts are ever added.
drop policy if exists "admin reads bookings" on public.transfers;
create policy "admin reads bookings"
  on public.transfers
  for select
  to authenticated
  using (true);

drop policy if exists "admin updates bookings" on public.transfers;
create policy "admin updates bookings"
  on public.transfers
  for update
  to authenticated
  using (true)
  with check (true);
