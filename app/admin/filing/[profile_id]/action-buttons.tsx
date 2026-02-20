'use client'

import { updateFilingStatus } from '@/app/actions/admin-actions'
import { Play, AlertTriangle, Search, CheckCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RequestInfoModal from './request-info-modal'
import ReviewLinkModal from './review-link-modal'

export default function ActionButtons({
    profileId,
    status,
    hasMissingInfo,
    initialRefund,
    initialOwing,
    finalReturnPath
}: {
    profileId: string
    status: string
    hasMissingInfo: boolean
    initialRefund?: number | null
    initialOwing?: number | null
    finalReturnPath?: string | null
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [optimisticStatus, setOptimisticStatus] = useState(status)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const router = useRouter()

    // Is flagged if status is ACTION_REQUIRED OR if we have missing info
    const isFlagged = optimisticStatus === 'ACTION_REQUIRED' || hasMissingInfo

    const handleAction = async (action: 'START_WORK' | 'REQUEST_INFO' | 'SEND_REVIEW' | 'FILE_RETURN' | 'RESOLVE_FLAG', missingInfo?: any, reviewLink?: string) => {
        setIsLoading(true)

        // Optimistic Update
        let nextStatus = optimisticStatus
        if (action === 'START_WORK') nextStatus = 'IN_PROGRESS'
        if (action === 'RESOLVE_FLAG') nextStatus = 'IN_PROGRESS'
        if (action === 'SEND_REVIEW') nextStatus = 'IN_REVIEW'
        if (action === 'FILE_RETURN') nextStatus = 'FILED'

        setOptimisticStatus(nextStatus)

        const result = await updateFilingStatus(profileId, action, missingInfo, reviewLink)
        if (!result.success) {
            alert(`Error: ${result.error}`)
            // Revert optimistic update
            setOptimisticStatus(status)
        } else {
            router.refresh()
        }
        setIsLoading(false)
    }

    const onRequestInfoClick = () => {
        setIsInfoModalOpen(true)
    }

    const onSendReviewClick = () => {
        setIsReviewModalOpen(true)
    }

    const handleInfoModalSubmit = async (missingInfo: any) => {
        setIsInfoModalOpen(false)
        await handleAction('REQUEST_INFO', missingInfo)
    }

    const handleReviewModalSubmit = async (reviewLink: string, file: File | null, refundAmount: number, amountOwing: number) => {
        setIsReviewModalOpen(false)
        setIsLoading(true)

        try {
            // 1. Upload File if new one provided
            if (file) {
                const formData = new FormData()
                formData.append('file', file)
                const { uploadFinalReturn } = await import('@/app/actions/admin-actions')
                await uploadFinalReturn(profileId, formData)
            }

            // 2. Update Amounts
            const { updateReturnAmounts } = await import('@/app/actions/admin-actions')
            await updateReturnAmounts(profileId, refundAmount, amountOwing)

            // 3. Send to Review
            await handleAction('SEND_REVIEW', undefined, reviewLink)
        } catch (error) {
            console.error('Error in review submit:', error)
            alert('Failed to send for review fully.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                {/* 1. START WORK */}
                {optimisticStatus !== 'IN_PROGRESS' && optimisticStatus !== 'IN_REVIEW' && optimisticStatus !== 'APPROVED' && optimisticStatus !== 'FILED' && (
                    <button
                        onClick={() => handleAction('START_WORK')}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        Start Work
                    </button>
                )}

                {/* 2. REQUEST INFO (Flag) */}
                {!isFlagged && optimisticStatus !== 'FILED' && (
                    <button
                        onClick={onRequestInfoClick}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-yellow-700 border border-yellow-200 rounded-lg font-bold text-sm hover:bg-yellow-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Request Info
                    </button>
                )}

                {/* 3. RESOLVE FLAG */}
                {isFlagged && (
                    <button
                        onClick={() => handleAction('RESOLVE_FLAG')}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Resolve Flag
                    </button>
                )}

                {/* 4. SEND FOR REVIEW */}
                {(optimisticStatus === 'IN_PROGRESS' || isFlagged) && (
                    <button
                        onClick={onSendReviewClick}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Search className="w-4 h-4" />
                        Send for Review
                    </button>
                )}

                {/* 5. MARK FILED */}
                {(optimisticStatus === 'IN_REVIEW' || optimisticStatus === 'APPROVED') && (
                    <button
                        onClick={() => handleAction('FILE_RETURN')}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        File Return
                    </button>
                )}
            </div>

            <RequestInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                onSubmit={handleInfoModalSubmit}
                isSubmitting={isLoading}
            />

            <ReviewLinkModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewModalSubmit}
                isSubmitting={isLoading}
                initialRefund={initialRefund}
                initialOwing={initialOwing}
                finalReturnPath={finalReturnPath}
            />
        </>
    )
}
