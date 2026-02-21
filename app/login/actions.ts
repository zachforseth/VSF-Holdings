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

    let shouldRedirectAdmin = false;
    let hasProfiles = true; // Default to true for safety
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

            // Use the authenticated user client to read their own profile and role
            const { data: userProfile, error: profileErr } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profileErr) {
                console.error('Failed to fetch user profile role:', profileErr.message);
            } else {
                role = userProfile?.role;
            }

            const userEmailRaw = (user.email || '').toLowerCase()

            console.log(`[LOGIN DEBUG] User: ${userEmailRaw}, Role: ${role}, ID: ${user.id}`)

            // Admin Logic
            const isAdminEmail = userEmailRaw.endsWith('@vsfholdings.com')
            console.log(`[LOGIN DEBUG] Is Admin Email? ${isAdminEmail}`)

            if (role === 'admin' && isAdminEmail) {
                console.log('[LOGIN DEBUG] Marking for Admin Dashboard Redirect')
                shouldRedirectAdmin = true;
            } else {
                // Client Logic: Check if they have at least 1 profile
                const { count, error: countErr } = await supabase
                    .from('tax_profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                if (!countErr && count === 0) {
                    hasProfiles = false;
                }
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
    if (!hasProfiles) {
        redirect('/filing/new-profile?onboarding=true')
    } else {
        redirect('/dashboard')
    }
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
