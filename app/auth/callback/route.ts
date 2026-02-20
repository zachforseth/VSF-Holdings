import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // Default to dashboard if no 'next' param provided
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        console.log('--- AUTH CALLBACK: CODE RECEIVED ---');
        // 1. Create a temporary holding tank for cookies
        const cookieStore = new Map<string, { value: string; options: CookieOptions }>();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.headers.get('Cookie')?.match(new RegExp(`(^| )${name}=([^;]+)`))?.[2];
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Instead of setting immediately, store them in our Map
                        cookieStore.set(name, { value, options });
                    },
                    remove(name: string, options: CookieOptions) {
                        // Mark for deletion in our Map
                        cookieStore.set(name, { value: '', options: { ...options, maxAge: 0 } });
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
            console.log('--- AUTH CALLBACK: REDIRECTING TO ---', redirectUrl);
            const response = NextResponse.redirect(`${origin}${redirectUrl}`);

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
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
