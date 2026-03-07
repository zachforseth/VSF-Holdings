import "dotenv/config";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
}

const client = new Client({
    connectionString,
});

const sql = `
-- 1. Add columns for masking and safe grouping
ALTER TABLE tax_profiles
ADD COLUMN IF NOT EXISTS sin_last4 TEXT,
ADD COLUMN IF NOT EXISTS sin_hash TEXT;

-- 2. Create the Audit Log Table
CREATE TABLE IF NOT EXISTS sin_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    profile_id UUID NOT NULL REFERENCES tax_profiles(id),
    action TEXT NOT NULL DEFAULT 'DECRYPT_SIN',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure Row Level Security (RLS) restricts access to the logs
ALTER TABLE sin_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read their own logs (or super-admins can read all)
-- Assuming you have a way to identify admins (e.g. users table role, or auth metadata)
-- For now, allow inserts safely from server-side (Service Role bypasses this anyway)
CREATE POLICY "Allow service role full access" ON sin_access_logs USING (true) WITH CHECK (true);

-- RELOAD SCHEMA CACHE FOR POSTGREST (Required for Supabase JS Client immediate use)
NOTIFY pgrst, 'reload schema';
`;

async function run() {
    try {
        await client.connect();
        console.log("Connected to database. Running migration...");
        await client.query(sql);
        console.log("Migration executed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
    }
}

run();
