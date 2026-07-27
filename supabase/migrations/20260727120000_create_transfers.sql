-- Transfers table + row level security.
-- Column names match server/storage.js so the frontend TransferRequest type is unchanged.

create table if not exists public.transfers (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
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
  child_seat     boolean not null default false,
  notes          text,
  -- Bookings are confirmed on submission; no approval step. The admin can later
  -- move a booking to cancelled or completed.
  status         text not null default 'confirmed'
                 check (status in ('confirmed', 'cancelled', 'completed'))
);

-- The admin list is always ordered newest first.
create index if not exists transfers_created_at_idx
  on public.transfers (created_at desc);

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
