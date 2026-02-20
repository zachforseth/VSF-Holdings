'use client'

import { ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'

// Icon mapping helper
const getIconForType = (type: string) => {
    const t = type.toUpperCase()
    if (t.includes('T4')) return <FileText className="w-5 h-5 text-blue-600" />
    if (t.includes('T5') || t.includes('T3')) return <FileText className="w-5 h-5 text-purple-600" />
    if (t.includes('T2202')) return <FileText className="w-5 h-5 text-cyan-600" />
    if (t.includes('T776')) return <FileText className="w-5 h-5 text-orange-600" />
    return <FileText className="w-5 h-5 text-gray-500" />
}

export default function PlanExplanation({
    finalFee,
    detectedForms,
    tierName,
    transparencyAlert
}: {
    finalFee: number,
    detectedForms: any[],
    tierName: string,
    transparencyAlert?: string
}) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Plan Verification Complete</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    We've analyzed your documents to ensure you're on the right plan.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white border boundary-gray-200 rounded-3xl shadow-sm overflow-hidden">
                {/* Detected Documents Section */}
                <div className="p-8 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                        AI Detected Documents
                    </h3>

                    {detectedForms.length === 0 ? (
                        <p className="text-gray-500 italic">No specific forms detected yet (Standard filing).</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {detectedForms.map((form, i) => {
                                const confidence = form.confidence || 0
                                const isHighConfidence = confidence >= 0.95

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            relative group flex items-center gap-3 p-3 rounded-xl border transition-all
                                            ${isHighConfidence ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}
                                        `}
                                    >
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            {getIconForType(form.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">{form.type}</p>
                                            </div>
                                            <p className={`text-xs ${isHighConfidence ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                                                {isHighConfidence ? 'High Confidence Match' : `Verified`}
                                            </p>
                                        </div>

                                        {isHighConfidence && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Benefits & Support Section */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Benefits & Support
                    </h3>
                    <div className="flex flex-col gap-2">
                        {tierName?.includes('Pro') && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Audit Protection</strong> - Full representation included.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Expert Advice</strong> - Dedicated senior tax strategist.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Complex Filing Support</strong> - Rental & Foreign income handling.</span>
                                </div>
                            </>
                        )}
                        {tierName?.includes('Plus') && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Investment Optimization</strong> - T3/T5 & Capital Gains.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Family Credits</strong> - Tuition & Medical expense maximization.</span>
                                </div>
                            </>
                        )}
                        {tierName?.includes('Essential') && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Standard Filing</strong> - Fast & accurate T4 processing.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span><strong>Basic Automation</strong> - Smart data import.</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="p-8 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Final Verified Plan</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{tierName}</h2>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Fee</p>
                        <div className="text-4xl font-bold text-[#2C2C2C]">
                            ${finalFee}
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Step Hint */}
            <p className="text-center text-sm text-gray-400">
                Proceeding to secure payment will confirm this amount.
            </p>
        </div>
    )
}
