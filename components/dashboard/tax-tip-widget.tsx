'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const TIPS = [
    {
        id: 1,
        category: 'TAX TIP',
        content: (
            <>
                <span className='italic'>RRSP</span> contributions before March 1 can reduce your tax bill.
            </>
        ),
    },
    {
        id: 2,
        category: 'DEDUCTIONS',
        content: (
            <>
                Worked from home? Claim the <span className='italic'>flat rate</span> method for easy deductions.
            </>
        ),
    },
    {
        id: 3,
        category: 'REMINDER',
        content: (
            <>
                Don't forget to gather all receipts for <span className='italic'>medical expenses</span> this year.
            </>
        ),
    },
]

export default function TaxTipWidget() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % TIPS.length)
    }

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + TIPS.length) % TIPS.length)
    }

    const currentTip = TIPS[currentIndex]

    const nextIndex = (currentIndex + 1) % TIPS.length

    return (
        <div className='flex flex-col h-full'>
            {/* Pagination Controls */}
            <div className='flex items-center justify-between text-gray-400 mb-3 px-1'>
                <div className='text-sm font-medium'>
                    {currentIndex + 1} of {TIPS.length}
                </div>
                <div className='flex gap-4'>
                    <button
                        onClick={handlePrev}
                        className='hover:text-gray-600 transition-colors cursor-pointer'
                        aria-label="Previous tip"
                    >
                        <ChevronLeft className='w-5 h-5' />
                    </button>
                    <button
                        onClick={handleNext}
                        className='hover:text-gray-600 transition-colors cursor-pointer'
                        aria-label="Next tip"
                    >
                        <ChevronRight className='w-5 h-5' />
                    </button>
                </div>
            </div>

            {/* The Card */}
            <div className='bg-[#D3CFC2] p-8 rounded-2xl flex flex-col justify-between aspect-[4/5] relative border border-[#C5C0B0]'>
                <div className="relative z-10 h-full flex flex-col">
                    <p className='text-xs font-bold text-gray-800/60 uppercase tracking-widest mb-6 font-mono'>
                        {currentTip.category}
                    </p>
                    <h3 className='text-4xl font-medium text-[#2A2822] leading-[1.1] mb-8 tracking-tight font-serif'>
                        {currentTip.content}
                    </h3>

                    <button className='text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 group hover:opacity-70 transition-opacity mt-auto'>
                        Read Article
                        <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                    </button>
                </div>
            </div>
        </div>
    )
}
