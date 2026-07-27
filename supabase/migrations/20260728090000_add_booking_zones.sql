-- Customers now search for their hotel by name instead of picking a zone, so pickup
-- and dropoff hold whatever they typed. These columns record which priced zone the
-- fare actually came from, and how far the hotel sits from that zone's centre.
--
-- Kept apart from pickup and dropoff on purpose: the two are answers to different
-- questions, and squeezing the zone into the location text would make it impossible
-- to tell a customer's own wording from ours.

alter table public.transfers
  add column if not exists pickup_zone text,
  add column if not exists dropoff_zone text,
  add column if not exists pickup_offset_km numeric(6, 1),
  add column if not exists dropoff_offset_km numeric(6, 1);

comment on column public.transfers.pickup_zone is
  'Priced zone the pickup was charged as. Null on rows booked before hotel search existed.';
comment on column public.transfers.dropoff_zone is
  'Priced zone the dropoff was charged as. Null on rows booked before hotel search existed.';
comment on column public.transfers.pickup_offset_km is
  'Straight-line km from the pickup to its zone centre. Null when the customer picked the zone by name.';
comment on column public.transfers.dropoff_offset_km is
  'Straight-line km from the dropoff to its zone centre. Null when the customer picked the zone by name.';
