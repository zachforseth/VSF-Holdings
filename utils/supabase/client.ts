import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("🚨 [Supabase Client] Environment variables missing!");
        console.error("- NEXT_PUBLIC_SUPABASE_URL exists:", !!supabaseUrl);
        console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
    } else {
        // Debug diagnostic (safe for client, just hostname)
        try {
            const urlObj = new URL(supabaseUrl);
            console.log(`[Supabase Client] Initializing with host: ${urlObj.hostname}`);
        } catch {
            console.error(`[Supabase Client] Invalid URL format provided.`);
        }
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true
            }
        }
    )
}
