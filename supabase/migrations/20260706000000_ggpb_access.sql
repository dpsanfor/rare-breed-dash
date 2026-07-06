-- Allow 'prison_break' as a valid product in the purchases table
-- so that GGPB signups can be granted access the same way ThriveCart
-- purchases are — matched on email, activated on first login.

ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_product_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_product_check
  CHECK (product IN ('ten_x_leap', 'rare_breed_club', 'prison_break'));
