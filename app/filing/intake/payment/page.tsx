import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createStripeCheckout } from '@/app/actions/payment-actions'
import { createCoinbaseCheckout } from '@/app/actions/coinbase-actions'

export default async function PaymentMethodPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('quoted_price')
        .eq('user_id', user.id)
        .eq('filing_status', 'ready_to_pay')

    const totalAmount = profiles?.reduce((sum, p) => sum + (p.quoted_price || 0), 0) || 0
    // If for some reason total is 0, redirect to review
    if (totalAmount === 0) redirect('/filing/intake/review-group')

    return (
        <div className="bg-white min-h-screen">
            {/* Content Header */}
            <div className="px-8 pt-8">
                <Link
                    href="/filing/intake/review-group"
                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Review
                </Link>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-bold tracking-tight text-center text-black mt-8 mb-4">
                Select Payment Method
            </h1>
            <p className='text-gray-500 text-center text-lg mb-20'>
                Total to pay: <span className='font-bold text-gray-900'>${totalAmount} CAD</span>
            </p>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[750px] mx-auto px-4 w-full mb-20">

                {/* LEFT COLUMN: PAY BY CARD */}
                <div className="flex flex-col items-center">
                    {/* Visual Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[340px] w-[340px]">
                        <h2 className="text-2xl font-bold text-black mb-2">Pay by Card</h2>
                        <p className="text-gray-500 text-[13px] leading-relaxed mb-5 px-1 max-w-[300px] mx-auto">
                            Pay securely using your credit or debit card, Apple Pay, Google Pay, or Klarna.
                        </p>

                        {/* Logo Cluster */}
                        <img
                            src="/logos/fiat-cluster.png"
                            alt="Payment Methods"
                            className="w-52 h-auto mb-5 mt-2 object-contain"
                        />

                        <form action={createStripeCheckout} className="w-full mt-auto">
                            <button
                                type="submit"
                                className="w-full bg-[#4F62D6] text-[13px] font-semibold text-white py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Continue with secure checkout
                            </button>
                        </form>
                    </div>

                    {/* Powered By Footer (Outside) */}
                    <div className="mt-5 flex items-center justify-center gap-1.5">
                        <span className="text-xs text-gray-500 font-medium">Powered by</span>
                        <img src="/logos/stripe.png" alt="Stripe" className="h-5 opacity-90 relative top-[1px]" />
                    </div>
                </div>

                {/* RIGHT COLUMN: PAY WITH CRYPTO */}
                <div className="flex flex-col items-center">
                    {/* Visual Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[340px] w-[340px]">
                        <h2 className="text-2xl font-bold text-black mb-2">Pay with Crypto</h2>
                        <p className="text-gray-500 text-[13px] leading-relaxed mb-5 px-1">
                            Pay securely using Bitcoin, Ethereum,<br /> or other supported cryptocurrencies.
                        </p>

                        {/* Logo Cluster */}
                        <img
                            src="/logos/crypto-cluster.png"
                            alt="Crypto Tokens"
                            className="w-52 h-auto mb-5 -mt-1 object-contain"
                        />

                        <form action={createCoinbaseCheckout} className="w-full mt-auto">
                            <button
                                type="submit"
                                className="w-full bg-[#4F62D6] text-[13px] font-semibold text-white py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Continue with secure checkout
                            </button>
                        </form>
                    </div>

                    {/* Powered By Footer (Outside) */}
                    <div className="mt-5 flex items-baseline justify-center gap-1.5">
                        <span className="text-xs text-gray-500 font-medium">Powered by</span>
                        <img src="/logos/coinbase.png" alt="Coinbase" className="h-3 opacity-90" />
                    </div>
                </div>

            </div>

            {/* Global Footer */}
            <div className="w-full text-center mt-auto mb-10 px-6">
                <p className="text-[11px] text-gray-400 leading-relaxed font-normal max-w-md mx-auto">
                    All payments are encrypted and processed securely by <span className="font-semibold text-gray-900">Stripe</span> or <span className="font-semibold text-gray-900">Coinbase</span>.
                    <br />
                    <span className="italic font-light text-gray-400 opacity-80 block mt-2">
                        *Note: Your tax filing will be processed immediately upon payment confirmation.
                    </span>
                </p>
            </div>
        </div >
    )
}
