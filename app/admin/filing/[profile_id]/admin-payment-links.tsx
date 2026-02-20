'use client'

import { useState } from 'react'
import { Loader2, Copy, CheckCircle2, DollarSign, ExternalLink } from 'lucide-react'

interface Props {
    profileId: string
    quotedPlan?: string
    quotedPrice?: number
    filingStatus?: string
    paymentId?: string
    balanceOwing?: number
}

export default function AdminPaymentLinks({ profileId, quotedPlan, quotedPrice, filingStatus, paymentId, balanceOwing }: Props) {
    const [stripeUrl, setStripeUrl] = useState('')
    const [differenceStripeUrl, setDifferenceStripeUrl] = useState('')
    const [coinbaseUrl, setCoinbaseUrl] = useState('')
    const [copiedStripe, setCopiedStripe] = useState(false)
    const [copiedDifference, setCopiedDifference] = useState(false)
    const [copiedCoinbase, setCopiedCoinbase] = useState(false)
    const [error, setError] = useState('')
    const [isGeneratingDiff, setIsGeneratingDiff] = useState(false)
    const [isFetchingReceipt, setIsFetchingReceipt] = useState(false)

    // Consider the profile paid if it has a payment_id OR is in a post-payment status
    const isPaid = ['paid', 'in_review', 'approved', 'filed', 'submitted', 'completed'].includes((filingStatus || '').toLowerCase()) || !!paymentId;
    const hasBalanceOwing = (balanceOwing || 0) > 0;

    const handleViewReceipt = async () => {
        setIsFetchingReceipt(true)
        const { adminGetReceiptUrl } = await import('@/app/actions/admin-actions')
        const res = await adminGetReceiptUrl(profileId)
        setIsFetchingReceipt(false)
        if (res.success && res.url) {
            window.open(res.url, '_blank')
        } else {
            alert('Could not find a receipt for this payment.')
        }
    }

    const handleGenerateDifferenceLink = async () => {
        setIsGeneratingDiff(true)
        setError('')
        const { adminGenerateDifferencePaymentLink } = await import('@/app/actions/admin-actions')
        const res = await adminGenerateDifferencePaymentLink(profileId)
        setIsGeneratingDiff(false)
        if (res.success && res.stripeUrl) {
            setDifferenceStripeUrl(res.stripeUrl)
        } else {
            setError(res.error || 'Failed to generate link')
        }
    }

    const copyToClipboard = (text: string, type: 'stripe' | 'coinbase' | 'difference') => {
        navigator.clipboard.writeText(text)
        if (type === 'stripe') {
            setCopiedStripe(true)
            setTimeout(() => setCopiedStripe(false), 2000)
        } else if (type === 'difference') {
            setCopiedDifference(true)
            setTimeout(() => setCopiedDifference(false), 2000)
        } else {
            setCopiedCoinbase(true)
            setTimeout(() => setCopiedCoinbase(false), 2000)
        }
    }

    // Default to Essentials / $150 visually if not set yet, but generation will fail if price is 0
    const planName = quotedPlan || 'Pending AI Analysis'
    const price = quotedPrice || 0

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-md font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    Tier & Payment
                </h2>
                <div className="flex items-center gap-2">
                    {isPaid && hasBalanceOwing ? (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            Balance Due: ${balanceOwing}
                        </span>
                    ) : isPaid ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                        </span>
                    ) : (
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            Unpaid
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{planName}</h3>
                    <p className="text-sm text-gray-500">
                        {price > 0 ? `$${price} CAD` : 'Upload documents to generate tier & pricing'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isPaid && hasBalanceOwing && !differenceStripeUrl && (
                        <button
                            onClick={handleGenerateDifferenceLink}
                            disabled={isGeneratingDiff}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isGeneratingDiff ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                            Bill Difference
                        </button>
                    )}
                    {isPaid && (
                        <button
                            onClick={handleViewReceipt}
                            disabled={isFetchingReceipt}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isFetchingReceipt ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                            View Receipt
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded">{error}</p>}

            {/* Difference Link Output */}
            {isPaid && hasBalanceOwing && differenceStripeUrl && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                            Difference Link (Stripe)
                            <a href={differenceStripeUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-700 transition-colors"><ExternalLink className="w-3 h-3" /></a>
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={differenceStripeUrl}
                                className="flex-1 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 text-sm text-amber-800 outline-none focus:ring-2 focus:ring-amber-300 transition-shadow"
                            />
                            <button
                                onClick={() => copyToClipboard(differenceStripeUrl, 'difference')}
                                className={`p-2.5 rounded-lg border transition-all ${copiedDifference ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-amber-200 hover:bg-amber-50 text-amber-600'}`}
                                title="Copy link"
                            >
                                {copiedDifference ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isPaid && (stripeUrl || coinbaseUrl) && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-2">
                    {stripeUrl && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                                Stripe (Credit Card)
                                <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors"><ExternalLink className="w-3 h-3" /></a>
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={stripeUrl}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
                                />
                                <button
                                    onClick={() => copyToClipboard(stripeUrl, 'stripe')}
                                    className={`p-2.5 rounded-lg border transition-all ${copiedStripe ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                    title="Copy link"
                                >
                                    {copiedStripe ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {coinbaseUrl && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                                Coinbase Commerce (Crypto)
                                <a href={coinbaseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors"><ExternalLink className="w-3 h-3" /></a>
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={coinbaseUrl}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
                                />
                                <button
                                    onClick={() => copyToClipboard(coinbaseUrl, 'coinbase')}
                                    className={`p-2.5 rounded-lg border transition-all ${copiedCoinbase ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                    title="Copy link"
                                >
                                    {copiedCoinbase ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
