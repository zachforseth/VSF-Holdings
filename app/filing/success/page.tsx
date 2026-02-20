import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react'
import Stripe from 'stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
    const supabase = await createClient()
    const { session_id } = await searchParams
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')
    if (!session_id) redirect('/dashboard')

    // 1. Validate Environment Variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
        console.error(
            "Missing required environment variables. STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY must be set."
        );
        throw new Error("Internal Server Configuration Error");
    }

    // 2. Initialize SDKs locally (build-safe)
    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as any,
    })

    const supabaseAdmin = createAdminClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // DEBUGGING VARIABLES
    let debugInfo: any = {
        userId: user.id,
        sessionId: session_id,
        adminKeyPresent: !!supabaseServiceRoleKey,
    }

    // 1. Check if profiles exist BEFORE update
    const { data: profilesBefore, error: fetchError } = await supabaseAdmin
        .from('tax_profiles')
        .select('id, filing_status')
        .eq('user_id', user.id)

    debugInfo.profilesFound = profilesBefore?.length || 0;
    debugInfo.allProfilesForUser = profilesBefore;
    debugInfo.fetchError = fetchError;

    // Fetch the Stripe session to check if it's an upgrade payment
    let amount = 0;
    let isUpgradePayment = false;
    let upgradeProfileId = null;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)
        amount = (session.amount_total || 0) / 100;
        if (session.metadata?.is_upgrade_payment === 'true') {
            isUpgradePayment = true;
            upgradeProfileId = session.metadata?.profile_ids;
        }
    } catch (e) {
        console.error('Stripe fetch error:', e);
    }

    let updatedProfiles;

    if (isUpgradePayment && upgradeProfileId) {
        // Upgrade Payment: Only clear balance_owing, do not change filing_status if already past 'paid'.
        const { error: updateError, data } = await supabaseAdmin
            .from('tax_profiles')
            .update({
                balance_owing: 0
            })
            .eq('id', upgradeProfileId)
            .select()
        updatedProfiles = data;
    } else {
        // Standard Payment: Mark 'ready_to_pay' profiles as 'paid'
        const { error: updateError, data } = await supabaseAdmin
            .from('tax_profiles')
            .update({
                filing_status: 'paid', // Or 'submitted' depending on workflow? Usually 'paid' then 'submitted'
                payment_id: session_id
            })
            .eq('user_id', user.id)
            .eq('filing_status', 'ready_to_pay')
            .select()
        updatedProfiles = data;
    }

    // Fallback: If no profiles updated (maybe page refresh), try finding recently paid ones by this session_id
    let displayProfiles = updatedProfiles || [];
    if (displayProfiles.length === 0) {
        const { data: recentPaid } = await supabaseAdmin
            .from('tax_profiles')
            .select('*')
            .eq('payment_id', session_id);

        displayProfiles = recentPaid || [];
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white">
            <div className='max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700'>

                {/* 1. Big Green Check */}
                <div className='relative mx-auto w-24 h-24'>
                    <div className='absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20'></div>
                    <div className='relative z-10 bg-green-50 w-24 h-24 rounded-full flex items-center justify-center text-green-600'>
                        <CheckCircle2 className='w-12 h-12' />
                    </div>
                </div>

                {/* 2. Success Text */}
                <div className='space-y-4'>
                    <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
                        Payment Successful!
                    </h1>
                    <p className='text-lg text-gray-500'>
                        We have received your filing request.
                    </p>
                </div>

                {/* 3. Receipt / Summary Card */}
                {displayProfiles.length > 0 && (
                    <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left space-y-4'>
                        <div className='flex justify-between items-center pb-4 border-b border-gray-100'>
                            <span className='text-sm text-gray-500 font-medium'>Total Paid</span>
                            <span className='text-xl font-bold text-gray-900'>${amount.toFixed(2)}</span>
                        </div>

                        <div className='space-y-3'>
                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Filed Returns</p>
                            {displayProfiles.map((p) => (
                                <div key={p.id} className='flex justify-between items-center'>
                                    <span className='text-gray-900 font-medium flex items-center gap-2'>
                                        <CheckCircle2 className='w-4 h-4 text-green-500' />
                                        {p.first_name} {p.last_name}
                                    </span>
                                    <span className='text-sm text-gray-500'>{p.quoted_plan}</span>
                                </div>
                            ))}
                        </div>

                        <div className='pt-2 text-xs text-gray-400 text-center'>
                            Confirmation emailed to {user.email}
                        </div>
                    </div>
                )}

                <div className='pt-2'>
                    <Link
                        href='/dashboard'
                        className='w-full inline-flex items-center justify-center gap-2 bg-[#4374D4] text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-[#3460b5] transition-all hover:-translate-y-0.5 group'
                    >
                        Go to Dashboard <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </Link>
                </div>
            </div>
        </div>
    )
}
