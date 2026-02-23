'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Client, resources } from 'coinbase-commerce-node' // You likely installed this for the pickup flow

export async function createCoinbaseCheckout() {
    try {
        console.log("Starting Coinbase Checkout...");

        // Debugging AWS Amplify Environment variables
        console.log("[DEBUG] All Process Env Keys:", Object.keys(process.env).filter(k => k.includes('COINBASE') || k.includes('NEXT_PUBLIC')));

        const coinbaseApiKey = process.env.COINBASE_API_KEY;
        if (!coinbaseApiKey) {
            console.error("[DEBUG] COINBASE_API_KEY undefined inside Server Action environment. Available keys:", Object.keys(process.env).length);
            throw new Error('Server Configuration Error: Missing Coinbase API Key');
        }

        console.log("Initializing Coinbase Client...");
        // Initialize Coinbase
        Client.init(coinbaseApiKey);

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Unauthorized')

        // 1. Calculate Total from Cart
        const { data: profiles } = await supabase
            .from('tax_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('filing_status', 'ready_to_pay')

        if (!profiles || profiles.length === 0) throw new Error('Cart is empty')

        const totalAmount = profiles.reduce((sum, p) => sum + (p.quoted_price || 0), 0)

        // Dynamic Host Resolution
        const headersList = await headers();
        const hostStr = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
        const isLocal = hostStr.includes('localhost');
        const origin = isLocal ? `http://${hostStr}` : 'https://vsfcapitalstructuring.com';

        // 2. Create Charge

        // Format the invoice description based on how many profiles are in the cart
        const invoiceDescription = profiles.length === 1
            ? `${profiles[0].quoted_plan} (${profiles[0].filing_year || 2024} Tax Return)`
            : `Bulk Tax Filing for ${profiles.length} profile(s)`;

        const chargeData = {
            name: 'VSF Capital Tax Filing',
            description: invoiceDescription,
            pricing_type: 'fixed_price',
            local_price: {
                amount: totalAmount.toFixed(2), // Ensure string format
                currency: 'CAD',
            },
            metadata: {
                user_id: user.id,
                profile_ids: profiles.map(p => p.id).join(','), // Track who we are paying for
            },
            redirect_url: `${origin}/filing/success`,
            cancel_url: `${origin}/filing/intake/payment`,
        }

        console.log("Creating Charge...", chargeData);
        // 3. Create the Charge via API
        const Charge = resources.Charge
        const charge = await Charge.create(chargeData)

        console.log("Charge created:", charge.hosted_url);
        // 4. Redirect to Coinbase Hosted Page
        if (charge.hosted_url) {
            // Must return instead of directly redirecting inside try/catch because redirect throws
            return { redirectUrl: charge.hosted_url }
        }
        return { error: 'No hosted url returned' }
    } catch (error: any) {
        console.error("Coinbase Error:", error);
        return { error: error.message || "Failed to create Coinbase checkout" };
    }
}
