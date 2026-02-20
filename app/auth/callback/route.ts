import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = request.nextUrl.clone();
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    // Dynamic Host Resolution
    const hostStr = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host;
    const isLocal = hostStr.includes('localhost');
    const baseUrl = isLocal ? `http://${hostStr}` : 'https://vsfcapitalstructuring.com';

    console.log(`[Auth Callback] Request URL: ${request.url}`);
    console.log(`[Auth Callback] Resolved Base URL: ${baseUrl}`);

    if (code) {
        console.log('--- AUTH CALLBACK: CODE RECEIVED ---');
        // 1. Create a temporary holding tank for cookies
        const cookieStore = new Map<string, { value: string; options: CookieOptions }>();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("🚨 [Auth Callback] Environment variables missing!");
        } else {
            console.log(`[Auth Callback] Connecting to Supabase Host: ${new URL(supabaseUrl).hostname}`);
        }

        const supabase = createServerClient(
            supabaseUrl!,
            supabaseAnonKey!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Store them in our Map for the final explicit Response attachment
                            cookieStore.set(name, { value, options });
                        });
                    },
                },
            }
        );

        // 2. Exchange the Code for the Session (This fills the Map)
        console.log('--- AUTH CALLBACK: EXCHANGING CODE FOR SESSION ---');
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            console.log('--- AUTH CALLBACK: SESSION EXCHANGE SUCCESS ---');
            // 2.5 Smart Redirection: Check for existing profiles
            const { data: { user } } = await supabase.auth.getUser();
            let redirectUrl = next;

            if (user) {
                console.log('--- AUTH CALLBACK: USER FOUND ---', user.id, user.email);

                // --- SAFETY NET: Explicitly sync user to public.users ---
                try {
                    console.log('--- AUTH CALLBACK: RUNNING SAFETY NET SYNC ---');
                    const { error: syncError } = await supabase
                        .from('users')
                        .upsert({
                            id: user.id,
                            email: user.email,
                            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                            avatar_url: user.user_metadata?.avatar_url || '',
                            role: 'client'
                        }, { onConflict: 'id' });

                    if (syncError) console.error('--- AUTH CALLBACK: SAFETY NET SYNC ERROR ---', syncError);
                    else console.log('--- AUTH CALLBACK: SAFETY NET SYNC SUCCESS ---');
                } catch (syncErr) {
                    console.error('--- AUTH CALLBACK: SAFETY NET SYNC UNEXPECTED ERROR ---', syncErr);
                }

                // NOTE: We check 'tax_profiles' here because that's where the filing data lives.
                // The 'users' table is for base user profile info synced via trigger.
                const { data: profiles } = await supabase
                    .from('tax_profiles')
                    .select('id')
                    .eq('user_id', user.id);

                console.log('--- AUTH CALLBACK: PROFILES FOUND ---', profiles?.length || 0);

                // If no profiles exist, push them to create one
                if (!profiles || profiles.length === 0) {
                    redirectUrl = '/filing/new-profile';
                }
            }

            // 3. Create the Redirect Response
            console.log('--- AUTH CALLBACK: REDIRECTING TO ---', `${baseUrl}${redirectUrl}`);
            const response = NextResponse.redirect(`${baseUrl}${redirectUrl}`);

            // 4. MANUALLY attach every cookie from the Map to the Response
            cookieStore.forEach(({ value, options }, name) => {
                response.cookies.set(name, value, options);
            });

            return response;
        } else {
            console.error("Exchange Error:", error);
        }
    }

    // If we failed, send back to login with an error
    return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`);
}
