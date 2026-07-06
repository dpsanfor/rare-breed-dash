-- Purchases recorded by the ThriveCart webhook.
-- Access is granted by email so a buyer who hasn't created her account yet
-- is activated the moment she signs up with the same email.

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('ten_x_leap', 'rare_breed_club')),
  thrivecart_order_id TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_email_idx ON public.purchases (lower(email));

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- A logged-in user may read only her own purchases (matched on her auth email).
CREATE POLICY "read own purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- Only the service role (the webhook) may insert. No public insert policy.
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
