ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
CREATE INDEX IF NOT EXISTS orders_stripe_payment_intent_idx ON public.orders (stripe_payment_intent);