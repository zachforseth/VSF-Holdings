'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export async function createStripeCheckout() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        throw new Error("Missing Stripe Secret Key");
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as any, // Use your preferred version
    })

    // 1. Get the Items from the Cart
    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('filing_status', 'ready_to_pay')

    if (!profiles || profiles.length === 0) throw new Error('Cart is empty')

    // 2. Build Line Items for Stripe
    const line_items = profiles.map((profile) => ({
        price_data: {
            currency: 'cad',
            product_data: {
                name: `Tax Filing: ${profile.first_name} ${profile.last_name}`,
                description: `${profile.quoted_plan} (2025 Tax Return)`,
            },
            unit_amount: (profile.quoted_price || 0) * 100, // Stripe expects cents
        },
        quantity: 1,
    }))

    // 3. Create Session
    const headersList = await headers();
    const hostStr = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
    const isLocal = hostStr.includes('localhost');
    const origin = isLocal ? `http://${hostStr}` : 'https://vsfcapitalstructuring.com';

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${origin}/filing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/filing/intake/payment`,
        metadata: {
            user_id: user.id, // We bill the Master Account
            profile_ids: profiles.map(p => p.id).join(','), // Track exactly which profiles this covers
        },
        customer_email: user.email // Prefill the email for better UX
    })

    if (session.url) {
        redirect(session.url)
    }
}
