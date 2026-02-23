'use client';

import { useState } from 'react';
import { startStripeVerification } from '@/app/actions/stripe-actions';
import { toast } from 'sonner';

export default function VerificationButton({ profileId, returnTo }: { profileId: string, returnTo?: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (formData: FormData) => {
        setIsLoading(true);
        try {
            // Explicitly attach the client-side base URL to avoid server-side header crashes
            formData.append('baseUrl', window.location.origin);

            const result = await startStripeVerification(formData);
            if (result?.success && result.url) {
                window.location.href = result.url;
            } else {
                throw new Error(result?.error || 'Failed to start verification.');
            }
        } catch (error: any) {
            console.error('Stripe Verification Error:', error);
            toast.error(error.message || 'Failed to start verification.');
            setIsLoading(false);
        }
    };

    return (
        <form action={handleVerify} className='w-full flex justify-center'>
            <input type='hidden' name='profileId' value={profileId} />
            {returnTo && <input type='hidden' name='returnTo' value={returnTo} />}

            <button
                type='submit'
                disabled={isLoading}
                className='bg-blue-600 text-white text-lg font-medium py-4 px-12 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Redirecting...
                    </>
                ) : 'Start Verification'}
            </button>
        </form>
    );
}
