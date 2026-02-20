import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("🚨 [Middleware] Supabase Environment variables missing!");
        console.error("- NEXT_PUBLIC_SUPABASE_URL exists:", !!supabaseUrl);
    }

    const supabase = createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // This refreshes the session if needed
    const { data: { user } } = await supabase.auth.getUser()

    // PROTECTED ROUTE LOGIC
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Use Service Role to bypass RLS for role check
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                }
            }
        )

        const { data: userProfile } = await adminClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = userProfile?.role
        const email = (user.email || '').toLowerCase()

        console.log(`[MIDDLEWARE DEBUG] Path: ${request.nextUrl.pathname}`)
        console.log(`[MIDDLEWARE DEBUG] User: ${email}, Role: ${role}`)

        // Create a response object first to handle cookie setting if needed
        // but since we are redirecting, we just return the redirect response
        if (role !== 'admin' || !email.endsWith('@vsfholdings.com')) {
            console.log('[MIDDLEWARE DEBUG] Unauthorized Admin Access -> Redirecting to /dashboard')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}
