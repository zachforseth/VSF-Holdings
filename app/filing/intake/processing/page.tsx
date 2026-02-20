'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { reprocessAllDocuments } from '@/app/actions/document-actions'

function ProcessingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const profileId = searchParams.get('profileId')

    const [step, setStep] = useState(0)

    const messages = [
        'Securely encrypting your documents...',
        'Analyzing tax complexity...',
        'Scanning for T4 and T5 slips...',
        'Finalizing your optimal tier...',
        'Generating your personalized quote...'
    ]

    useEffect(() => {
        if (!profileId) return

        // 1. Cycle through messages
        const messageInterval = setInterval(() => {
            setStep((prev) => (prev + 1) % messages.length)
        }, 1200)

        const runProcess = async () => {
            try {
                // Minimum time to show animation
                const minTime = new Promise(resolve => setTimeout(resolve, 3500));

                // Start the actual sync in parallel
                // reprocessAllDocuments is now STATELESS - it returns data but doesn't save to DB
                const syncOp = reprocessAllDocuments(profileId);

                const [_, syncResult] = await Promise.all([minTime, syncOp]);

                if (syncResult && syncResult.success) {
                    // Success: Redirect to Review with Data in URL (Stateless)
                    // We serialize the forms to a JSON string
                    const params = new URLSearchParams();
                    params.set('profileId', profileId);
                    params.set('tier', syncResult.tier || 'Essential');
                    params.set('price', (syncResult.price || 150).toString());
                    if (syncResult.reason) params.set('reason', syncResult.reason);
                    if (syncResult.alert) params.set('alert', syncResult.alert);
                    params.set('needsReview', String(syncResult.needsReview));
                    params.set('detectedForms', JSON.stringify(syncResult.detectedForms || []));

                    router.push(`/filing/intake/review?${params.toString()}`);
                } else {
                    // Fallback to error or simple redirect if failed (shouldn't happen often)
                    console.error("Processing failed or returned no result");
                    router.push(`/filing/intake/processing?profileId=${profileId}`); // Safest fallback is to reload processing or show error, but review needs params now.
                    // Actually, if it failed, Review will kick them out anyway.
                    // Let's redirect them back to Documents to try again
                    router.push(`/filing/intake/documents?profileId=${profileId}&error=processing_failed`);
                }
            } catch (e) {
                console.error("Processing error:", e);
                router.push(`/filing/intake/documents?profileId=${profileId}&error=processing_failed`);
            }
        }

        runProcess();

        return () => clearInterval(messageInterval);
    }, [router, searchParams, profileId])

    return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] text-center w-full'>
            <div className='space-y-8'>
                <div className='relative flex items-center justify-center'>
                    <div className='w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin' />
                </div>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                        {messages[step]}
                    </h2>
                    <p className='text-gray-500'>
                        This usually takes about 5-10 seconds...
                    </p>
                </div>
            </div>
        </div>
    )
}

import { Suspense } from 'react'

export default function ProcessingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProcessingContent />
        </Suspense>
    )
}
