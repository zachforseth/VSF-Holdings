'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    console.log('Login Server Action Started')

    // DEBUG: Check Environment and Connectivity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log('Target Supabase URL:', supabaseUrl)

    if (!supabaseUrl) {
        console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is missing')
        return { error: 'Configuration Error: Missing Supabase URL' }
    }

    try {
        console.log('Testing connectivity to Supabase...')
        const healthCheck = await fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET', cache: 'no-store' })
        const text = await healthCheck.text()
        console.log('Supabase Health Status:', healthCheck.status)
        console.log('Supabase Health Response (first 200 chars):', text.substring(0, 200))
    } catch (netErr) {
        console.error('NETWORK ERROR: Could not reach Supabase:', netErr)
        return { error: 'Network Error: Cound not connect to authentication server.' }
    }

    let shouldRedirectAdmin = false;
    try {
        const supabase = await createClient()

        // 1. Validate Data
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        console.log('Attempting sign in for:', email)

        // 2. Sign In
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Supabase Sign In Error:', error.message)
            return { error: error.message }
        }

        console.log('Sign in successful. Checking role...')

        // 3. Check Role & Redirect
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            let role = null;
            const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (roleKey) {
                // Use Service Role to bypass RLS for role check
                const adminClient = createAdminClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    roleKey,
                    {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                        }
                    }
                )

                const { data: userProfile, error: profileErr } = await adminClient
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profileErr) {
                    console.error('Failed to fetch user profile role:', profileErr.message);
                } else {
                    role = userProfile?.role;
                }
            } else {
                console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Skipping admin role check.');
            }

            const userEmailRaw = (user.email || '').toLowerCase()

            console.log(`[LOGIN DEBUG] User: ${userEmailRaw}, Role: ${role}, ID: ${user.id}`)

            // Admin Logic
            const isAdminEmail = userEmailRaw.endsWith('@vsfholdings.com')
            console.log(`[LOGIN DEBUG] Is Admin Email? ${isAdminEmail}`)

            if (role === 'admin' && isAdminEmail) {
                console.log('[LOGIN DEBUG] Marking for Admin Dashboard Redirect')
                shouldRedirectAdmin = true;
            }
        }

    } catch (e) {
        console.error('Login Action Unexpected Error:', e)
        return { error: 'An unexpected error occurred during login.' }
    }

    if (shouldRedirectAdmin) {
        revalidatePath('/admin', 'layout')
        redirect('/admin/dashboard')
    }

    // Default Client Redirect
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Dynamically get the current host to prevent undefined or bad redirects
    const headerPayload = await headers();
    const host = headerPayload.get('x-forwarded-host') || headerPayload.get('host') || process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    // 1. Validate Data
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 2. Sign Up
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
