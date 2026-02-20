import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

// Init Supabase (Admin context ideally, but Anon works if configured)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
        }

        console.log("Verifying Session:", sessionId);

        // 1. Retrieve Session from Stripe to get Job ID & Payment Details
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent.payment_method'] // Need this for card details
        });

        const jobId = session.metadata?.jobId;
        if (!jobId) throw new Error("No Job ID found in session metadata");

        // 2. Mock Email Sending (Log it)
        console.log(`[EMAIL TRIGGER] Sending confirmation email to guest...`);

        // 3. Update Job in Supabase (Mark as Paid)
        const { error: updateError } = await supabase
            .from('courier_jobs')
            .update({
                payment_status: 'paid',
                status: 'confirmed', // Fix 3: Explicitly set job status to confirmed
                stripe_payment_id: session.payment_intent as string || sessionId,
            })
            .eq('id', jobId);

        if (updateError) console.error("DB Update Error:", updateError);

        // 4. Fetch Latest Job Data to return to Frontend
        const { data: job, error: fetchError } = await supabase
            .from('courier_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (fetchError || !job) throw new Error("Failed to fetch job details");

        // 5. Extract Payment Method Info
        let paymentInfo = "Credit Card";
        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
        if (paymentIntent && typeof paymentIntent !== 'string') {
            const method = paymentIntent.payment_method as Stripe.PaymentMethod;
            if (method?.card) {
                paymentInfo = `${method.card.brand.toUpperCase()} ending in ${method.card.last4} • $${(session.amount_total || 5000) / 100}.00`;
            }
        } else {
            // Fallback if expansion failed or not card
            paymentInfo = `Secure Payment • $${(session.amount_total || 5000) / 100}.00`;
        }

        return NextResponse.json({
            job,
            paymentInfo
        });

    } catch (err: any) {
        console.error("Confirmation Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
