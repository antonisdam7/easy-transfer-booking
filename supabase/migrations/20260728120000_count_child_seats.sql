-- child_seat was a yes or no, which left a driver guessing whether to bring a
-- rear-facing seat for a baby or a booster cushion for an eight-year-old, and whether
-- to bring one or two. These count each kind.
--
-- The old boolean stays and is still written, so bookings taken before this change
-- keep their meaning and nothing reading it has to change at once.

alter table public.transfers
  add column if not exists child_seats integer not null default 0,
  add column if not exists booster_seats integer not null default 0;

comment on column public.transfers.child_seats is
  'Rear-facing / group 0-1 seats requested, for children up to about 18 kg.';
comment on column public.transfers.booster_seats is
  'Booster seats requested, for children roughly 15-36 kg.';
comment on column public.transfers.child_seat is
  'True when any seat was requested. Superseded by child_seats and booster_seats; kept for rows booked before they existed.';
