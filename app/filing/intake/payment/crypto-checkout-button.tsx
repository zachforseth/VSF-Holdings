'use client'

import { useState } from 'react'
import { createCoinbaseCheckout } from '@/app/actions/coinbase-actions'
import { Loader2 } from 'lucide-react'

export default function CryptoCheckoutButton() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCheckout = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await createCoinbaseCheckout()

            if (result.error) {
                setError(result.error)
                setIsLoading(false)
            } else if (result.redirectUrl) {
                window.location.href = result.redirectUrl
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full mt-auto space-y-2">
            <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-[#4F62D6] disabled:opacity-50 flex items-center justify-center text-[13px] font-semibold text-white py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue with secure checkout'}
            </button>
            {error && (
                <div className="text-red-500 text-xs font-semibold px-2 animate-in fade-in zoom-in-95 duration-200 text-center">
                    {error}
                </div>
            )}
        </div>
    )
}
