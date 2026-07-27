-- Records the price the customer was quoted when they booked.
--
-- Until now the price was only ever rendered on screen: the customer saw a figure,
-- booked, and neither email nor the admin table mentioned an amount. If a customer
-- later argued about the fare there was nothing to check against.
--
-- The value is whatever the browser displayed, so it is a record of the quote and
-- not an authoritative amount. That is acceptable here because no money is taken
-- online -- the driver collects -- and the operator's email shows the route next to
-- the figure, so a tampered price is visible at a glance.
alter table public.transfers
  add column if not exists price numeric(10, 2);

-- Older rows predate the column and legitimately have no quote.
comment on column public.transfers.price is
  'Fare in EUR shown to the customer at booking time. Null when the route had no price.';
