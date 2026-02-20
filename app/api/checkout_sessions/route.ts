import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        console.log("1. API Route Hit");

        // Secure Origin for Redirects
        const hostStr = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
        const isLocal = hostStr.includes('localhost');
        const origin = isLocal ? `http://${hostStr}` : 'https://vsfcapitalstructuring.com';

        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing");
            return NextResponse.json({ error: "Server Configuration Error: Missing Stripe Key" }, { status: 500 });
        }

        const stripe = new Stripe(key, {
            apiVersion: '2023-10-16' as any,
        });

        const body = await req.json();
        const {
            draftJobId,
            fullName,
            email,
            phone,
            notes,
            address,
            addressCoords,
            scheduledTime
        } = body;

        console.log("3. Payload:", { email, draftJobId });

        // --- 0. SUPABASE ADMIN CLIENT (The Nuclear Option) ---
        // Bypass RLS completely to ensure writes always succeed
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must be set

        if (!supabaseServiceRoleKey) {
            console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        let jobId = draftJobId;

        // A. UPSERT LOGIC (Admin Context)
        if (jobId) {
            console.log("Updating Draft Job (Admin Override):", jobId);

            // We use Admin client so RLS doesn't block us from checking 'payment_status'
            const { data: existingJob, error: fetchError } = await supabaseAdmin
                .from('courier_jobs')
                .select('payment_status')
                .eq('id', jobId)
                .single();

            if (!fetchError && existingJob?.payment_status === 'pending') {
                await supabaseAdmin
                    .from('courier_jobs')
                    .update({
                        full_name: fullName,
                        email: email,
                        phone: phone,
                        package_tier: body.packageTier,
                        pickup_address: address,
                        pickup_coordinates: addressCoords,
                        scheduled_time: scheduledTime,
                        courier_notes: notes,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', jobId);
            } else {
                console.warn("Skipping Update: Job not found or already paid. Creating new one.");
                jobId = null;
            }
        }

        if (!jobId) {
            console.log("Creating New Job (Admin Override)...");
            const { data: newJob, error: insertError } = await supabaseAdmin
                .from('courier_jobs')
                .insert({
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    pickup_address: address,
                    pickup_coordinates: addressCoords,
                    scheduled_time: scheduledTime,
                    package_tier: body.packageTier || 'Standard',
                    courier_notes: notes,
                    payment_status: 'pending',
                })
                .select('id')
                .single();

            if (insertError) throw new Error(`DB Insert Error: ${insertError.message}`);
            jobId = newJob.id;
        }

        console.log("Final Job ID:", jobId);

        // --- 1. SETUP STRIPE SESSION ---
        const stripeSessionPromise = stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: 'VSF Secure Courier',
                        description: `Service: ${body.packageTier || 'Standard'} Package` // Show in Stripe
                    },
                    unit_amount: 5000, // $50.00
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/onboarding`,
            metadata: {
                jobId: jobId,
                package_tier: body.packageTier // Metadata for Dashboard
            }
        });

        // --- 2. SETUP COINBASE CHARGE ---
        let coinbaseChargePromise = Promise.resolve(null);
        if (process.env.COINBASE_API_KEY) {
            try {
                const { Client, resources } = require('coinbase-commerce-node');
                Client.init(process.env.COINBASE_API_KEY);
                const { Charge } = resources;

                coinbaseChargePromise = Charge.create({
                    name: 'VSF Secure Courier',
                    description: 'Document Pickup Service',
                    local_price: { amount: '50.00', currency: 'CAD' },
                    pricing_type: 'fixed_price',
                    metadata: { jobId: jobId, customer_email: email },
                    redirect_url: `${origin}/success?source=coinbase`,
                    cancel_url: `${origin}/onboarding`,
                });
            } catch (error) {
                console.error("Coinbase Init Error:", error);
            }
        }

        // --- 3. EXECUTE PARALLEL CREATION ---
        const [stripeSession, coinbaseCharge] = await Promise.all([
            stripeSessionPromise,
            coinbaseChargePromise
        ]);

        const coinbaseChargeFields = coinbaseCharge as any;

        console.log("Links Generated:", {
            stripe: stripeSession.url,
            coinbase: coinbaseChargeFields?.hosted_url
        });

        // --- FIX 3: NUCLEAR WAIT (BLOCKING) ---
        if (jobId) {
            console.log("NUCLEAR WAIT: Identifying Session IDs...");
            const { error: updateError } = await supabaseAdmin
                .from('courier_jobs')
                .update({
                    stripe_session_id: stripeSession.id,
                    coinbase_charge_id: coinbaseChargeFields?.code || null,
                    payment_status: 'pending',
                    package_tier: body.packageTier,
                    scheduled_time: scheduledTime
                })
                .eq('id', jobId);

            if (updateError) {
                console.error("FATAL DB ERROR:", updateError);
                return NextResponse.json({ error: "Database critical failure" }, { status: 500 });
            } else {
                console.log("NUCLEAR SUCCESS: DB Updated.");
            }
        }

        // --- 4. RETURN BOTH URLS ---
        return NextResponse.json({
            stripeUrl: stripeSession.url,
            coinbaseUrl: coinbaseChargeFields?.hosted_url || null
        });

    } catch (err: any) {
        console.error("API ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
