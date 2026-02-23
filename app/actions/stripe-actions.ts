'use server'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function startStripeVerification(formData: FormData) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error("Missing Stripe Secret Key");
        return { success: false, error: "Missing Stripe Secret Key configuration." };
    }

    // Initialize Stripe inside the action
    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-01-27.acacia' as any,
    })
    const profileId = formData.get('profileId') as string
    let returnTo = formData.get('returnTo') as string

    // 1. Get the host URL from the client (failsafe for Amplify environment)
    let baseUrl = formData.get('baseUrl') as string;

    // In the extremely rare case it's missing, fallback to hardcoded production (but development should always pass it)
    if (!baseUrl) {
        baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.vsfcapitalstructuring.com'
    }

    // Ensure returnTo starts with a slash if it's a relative path just in case
    if (returnTo && !returnTo.startsWith('/') && !returnTo.startsWith('http')) {
        returnTo = `/${returnTo}`
    }

    // Default to the questionnaire if no returnTo was provided
    let finalReturnPath = `/filing/intake/questionnaire?profileId=${profileId}&verified=true`
    if (returnTo) {
        // If the return path already has query params, we append '&'
        // If it doesn't, we append '?'
        const separator = returnTo.includes('?') ? '&' : '?'
        finalReturnPath = `${returnTo}${separator}profileId=${profileId}&verified=true`
    }

    // 2. Create the Verification Session on Stripe
    let verificationSession;
    try {
        verificationSession = await stripe.identity.verificationSessions.create({
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
    } catch (error: any) {
        console.error("Stripe Verification Session Error:", error);
        return { success: false, error: error.message || "Could not create verification session with Stripe." };
    }

    // 3. Save the Session ID to the database (Optional but good practice)
    // For now we rely on the webhook or the return_url query params + manual verification check if needed.

    // 4. Return the verification URL to the client
    if (verificationSession?.url) {
        return { success: true, url: verificationSession.url }
    } else {
        return { success: false, error: 'Could not create verification session URL' }
    }
}
