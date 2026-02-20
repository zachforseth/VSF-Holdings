ALTER TABLE public.courier_jobs ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending';
