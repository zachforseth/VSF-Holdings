'use client';

import { useState, useRef, useEffect } from 'react';
import { PRICING_TIERS, getTier } from '@/utils/pricing-tiers';
import { Check, RotateCcw } from 'lucide-react';
import { commitProfileData } from '@/app/actions/document-actions';
import Link from 'next/link';

interface ReviewFormProps {
    profileId: string;
    detectedTierName: string;
    detectedPrice: number;
    detectedFormsJson: string;
    needsReview: boolean;
}

export default function ReviewForm({
    profileId,
    detectedTierName,
    detectedPrice,
    detectedFormsJson,
    needsReview
}: ReviewFormProps) {
    // State
    const detectedTier = getTier(detectedTierName);
    const [selectedTierName, setSelectedTierName] = useState(detectedTier.name);
    const [showUpgradeCard, setShowUpgradeCard] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowUpgradeCard(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Derived Logic
    const selectedTier = getTier(selectedTierName);
    const availableTiers = PRICING_TIERS.filter(t => t.rank >= detectedTier.rank);
    const nextTier = availableTiers.find(t => t.rank === selectedTier.rank + 1);
    const previousTier = availableTiers.find(t => t.rank === selectedTier.rank - 1);
    const isUpgraded = selectedTier.rank > detectedTier.rank;

    const handleUpgrade = () => {
        if (nextTier) {
            setSelectedTierName(nextTier.name);
            setShowUpgradeCard(false);
        }
    };

    return (
        <form action={commitProfileData as any} className='contents'>
            <input type='hidden' name='profileId' value={profileId} />
            <input type='hidden' name='detectedForms' value={detectedFormsJson} />
            <input type='hidden' name='needsReview' value={String(needsReview)} />
            <input type='hidden' name='quotedPlan' value={selectedTier.name} />
            <input type='hidden' name='quotedPrice' value={selectedTier.price} />

            <div className='w-full space-y-12'>

                {/* 1. SELECTED PLAN CARD */}
                <div className='text-center my-6'>
                    <p className='text-gray-500 font-medium text-lg'>
                        {isUpgraded ? 'You have selected this upgrade.' : 'Based on your documents, we’ve matched you with:'}
                    </p>
                </div>

                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 relative transition-all duration-300 w-full'>
                    {/* Header Section - Horizontal Flex */}
                    <div className='flex flex-col sm:flex-row justify-between items-baseline mb-8 gap-2 border-b border-gray-50 pb-6'>
                        <h3 className='text-blue-600 text-[30px] font-bold tracking-tight'>
                            {selectedTier.name} Plan
                        </h3>
                        <div className='flex items-baseline gap-1'>
                            <span className='text-5xl font-bold text-gray-900 tracking-tight leading-none'>${selectedTier.price}</span>
                            <span className='text-base text-gray-500 font-medium ml-1 translate-y-[-4px]'>CAD</span>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className='text-left'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-4'>
                            FEATURES INCLUDED
                        </p>
                        <ul className='flex flex-wrap gap-x-8 gap-y-3'>
                            {selectedTier.features.map((feat, i) => (
                                <li key={i} className='text-gray-700 flex items-center gap-3 text-base leading-relaxed'>
                                    <div className='bg-green-50 text-green-600 p-0.5 rounded-full shrink-0 flex items-center justify-center w-5 h-5'>
                                        <Check className='w-3.5 h-3.5' strokeWidth={3} />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Switch Back Link */}
                    {previousTier && (
                        <div className='mt-8 pt-6 border-t border-gray-50'>
                            <button
                                type="button"
                                onClick={() => setSelectedTierName(previousTier.name)}
                                className='text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto underline decoration-gray-200 underline-offset-4'
                            >
                                Switch back to {previousTier.name} Plan (${previousTier.price})
                            </button>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS (Clean Flex Row) */}
                <div className='mt-10 w-full flex flex-col md:flex-row items-center justify-between gap-6'>

                    {/* LEFT: Secondary Actions (Stacked) */}
                    <div className='flex flex-col items-center md:items-start gap-1'>

                        {/* Retry Link */}
                        <Link
                            href={`/filing/intake/documents?profileId=${profileId}`}
                            className='text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors'
                        >
                            Forget a document? Update documents to re-scan
                        </Link>

                        {/* Upsell Trigger (Text Link) */}
                        {nextTier && (
                            <div className='relative' ref={popoverRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowUpgradeCard(!showUpgradeCard)}
                                    className='text-blue-500 hover:text-blue-700 font-medium text-base hover:underline transition-colors text-left'
                                >
                                    Need More? View the {nextTier.name} Plan
                                </button>

                                {/* INLINE / POPOVER CARD (Aligned Left) */}
                                {showUpgradeCard && (
                                    <div className='absolute bottom-full left-0 mb-4 z-50 w-80 bg-white rounded-xl shadow-[0_10px_40px_-2px_rgba(0,0,0,0.15)] border border-gray-200 p-5 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200 origin-bottom-left'>

                                        <div className='text-left mb-4 flex justify-between items-start border-b border-gray-100 pb-3'>
                                            <div>
                                                <h4 className='text-blue-600 text-xl font-bold mb-0.5 leading-tight'>
                                                    {nextTier.upgradeHeadline || `${nextTier.name} Plan`}
                                                </h4>
                                                <p className='text-xs text-gray-500 font-medium'>Recommended Upgrade</p>
                                            </div>
                                            <div className='text-right'>
                                                <span className='text-2xl font-bold text-gray-900 block leading-none'>${nextTier.price}</span>
                                                <span className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>CAD / Filing</span>
                                            </div>
                                        </div>

                                        <div className='mb-5'>
                                            {nextTier.upgradeFeatures && nextTier.upgradeFeatures.length > 0 ? (
                                                <ul className='space-y-2.5'>
                                                    {nextTier.upgradeFeatures.map((feat, i) => (
                                                        <li key={i} className='flex items-start text-left gap-2.5'>
                                                            <div className='bg-green-50 text-green-600 rounded-full shrink-0 flex items-center justify-center w-4 h-4 mt-0.5'>
                                                                <Check className='w-2.5 h-2.5' strokeWidth={3} />
                                                            </div>
                                                            <span className='text-xs text-gray-700 font-medium leading-relaxed'>{feat}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className='text-gray-600 text-xs leading-relaxed'>
                                                    Adds: {nextTier.features[nextTier.features.length - 1]}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type='button'
                                            onClick={handleUpgrade}
                                            className='w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-50/50 flex items-center justify-center gap-2'
                                        >
                                            Upgrade to {nextTier.name}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Primary Confirm Button */}
                    <button
                        type='submit'
                        className='bg-blue-600 text-white text-[20px] font-semibold py-3.5 px-10 rounded-full hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[240px]'
                    >
                        Confirm & Continue
                    </button>

                </div>

            </div>
        </form >
    );
}
