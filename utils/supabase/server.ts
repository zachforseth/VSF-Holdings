import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("🚨 [Supabase Server] Environment variables missing!");
        console.error("- NEXT_PUBLIC_SUPABASE_URL exists:", !!supabaseUrl);
        console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
    } else {
        try {
            const urlObj = new URL(supabaseUrl);
            console.log(`[Supabase Server] Initializing with host: ${urlObj.hostname}`);
        } catch {
            console.error(`[Supabase Server] Invalid URL format provided.`);
        }
    }

    return createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The setAll method was called from a Server Component. 
                        // This can be ignored if you have middleware refreshing 
                        // user sessions. 
                    }
                },
            },
        }
    )
}
