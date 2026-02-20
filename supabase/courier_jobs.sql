-- Create the courier_jobs table
CREATE TABLE public.courier_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_coordinates JSONB, -- Stores { lat: number, lng: number }
    scheduled_time TIMESTAMPTZ, -- Recommend sending ISO string from frontend
    courier_notes TEXT,
    payment_status TEXT DEFAULT 'pending',
    stripe_session_id TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.courier_jobs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone (public/anon + authenticated) to INSERT jobs
CREATE POLICY "Enable insert for everyone" 
ON public.courier_jobs 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

-- Policy 2: Read access is implicitly denied for public/anon/authenticated by default.
-- Only the Service Role (Admin) can SELECT/UPDATE/DELETE unless specified otherwise.
-- If you need a specific Admin user to view from the frontend, uncomment below:
-- CREATE POLICY "Enable select for admin" ON public.courier_jobs FOR SELECT USING (auth.email() = 'your_admin_email@example.com');
