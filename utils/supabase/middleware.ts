import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'



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
        // Note: The specific 'admin' role check against the database is handled 
        // securely in `app/admin/layout.tsx` via the Node.js runtime. 
        // We avoid executing database queries in this Edge Middleware to comply 
        // with AWS Amplify's strict Edge function footprint limits.
    }

    return response
}
