'use server'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function startStripeVerification(formData: FormData) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        throw new Error("Missing Stripe Secret Key");
    }

    // Initialize Stripe inside the action
    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-01-27.acacia' as any,
    })
    const profileId = formData.get('profileId') as string
    const returnTo = formData.get('returnTo') as string
    const supabase = await createClient()

    // 1. Get the host URL dynamically (so it works on localhost and production)
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    // Default to the questionnaire if no returnTo was provided
    let finalReturnPath = `/filing/intake/questionnaire?profileId=${profileId}&verified=true`
    if (returnTo) {
        // If the return path already has query params, we append '&'
        // If it doesn't, we append '?'
        const separator = returnTo.includes('?') ? '&' : '?'
        finalReturnPath = `${returnTo}${separator}profileId=${profileId}&verified=true`
    }

    // 2. Create the Verification Session on Stripe
    const verificationSession = await stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: {
            profile_id: profileId, // We tag the session with our Profile ID so we can match them later
        },
        options: {
            document: {
                require_matching_selfie: true, // Asks for a face scan to prevent stolen IDs
            },
        },
        // UPDATED: Use dynamic return URL
        return_url: `${baseUrl}${finalReturnPath}`,
    })

    // 3. Save the Session ID to the database (Optional but good practice)
    // For now we rely on the webhook or the return_url query params + manual verification check if needed.

    // 4. Redirect the user to the Stripe Hosted Page
    if (verificationSession.url) {
        redirect(verificationSession.url)
    } else {
        throw new Error('Could not create verification session')
    }
}
