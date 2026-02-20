'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type OptionId = 'home' | 'office' | 'courier'

interface Option {
    id: OptionId
    title: string
    subtitle: string
    recommended?: boolean
    path: string
}

const options: Option[] = [
    {
        id: 'home',
        title: 'From Home',
        subtitle: 'Upload your documents online',
        recommended: true,
        path: '/filing/select-profile',
    },
    {
        id: 'office',
        title: 'Drop off my files at an office',
        subtitle: 'Meet with a tax professional, if you want',
        path: '/visit',
    },
    {
        id: 'courier',
        title: 'Have VSF pick up my documents',
        subtitle: 'Have a tax professional pick up your documents',
        path: '/onboarding',
    },
]

export default function GetStartedPage() {
    const router = useRouter()
    const [selected, setSelected] = useState<OptionId>('home')

    const handleNext = () => {
        const option = options.find((o) => o.id === selected)
        if (option) {
            router.push(option.path)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
            {/* Close Button */}
            <Link
                href="/"
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-6 h-6" />
            </Link>

            <div className="max-w-xl w-full">
                {/* Header */}
                <h1 className="text-3xl md:text-4xl font-bold text-center text-[#111] font-manrope mb-12">
                    How do you want to get started?
                </h1>

                {/* Options Stack */}
                <div className="space-y-4 mb-10">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => setSelected(option.id)}
                            className={cn(
                                "relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden",
                                selected === option.id
                                    ? "border-[#5B89F0] shadow-[0_0_0_1px_#5B89F0]"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {option.recommended && (
                                <div className="bg-[#7297DF] text-white text-center text-xs font-semibold py-1 uppercase tracking-wide">
                                    Recommended
                                </div>
                            )}

                            <div className={cn("p-6", option.recommended ? "pt-5" : "py-6")}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#111] mb-1">
                                            {option.title}
                                        </h3>
                                        <p className="text-gray-600 text-base">
                                            {option.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Area */}
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handleNext}
                        className="w-48 bg-[#4373E6] hover:bg-[#2952E3] text-white font-semibold py-3.5 rounded-full transition-colors text-lg shadow-sm"
                    >
                        Next
                    </button>

                    <Link
                        href="/compare"
                        className="text-sm font-medium text-gray-500 hover:text-[#2952E3] underline decoration-1 underline-offset-4"
                    >
                        Compare options
                    </Link>
                </div>
            </div>
        </div>
    )
}
