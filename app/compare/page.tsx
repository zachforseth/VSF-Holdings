'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComparePlans() {
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pop {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

            {/* Navbar z-100 - FIXED: Sticky top-0 */}
            <div className="sticky top-0 z-[100] bg-[#FDFBF7]">
                <Navbar />
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-16">
                <h1 className="text-4xl md:text-5xl font-bold text-center text-black mb-16 tracking-tight">
                    Compare Plans
                </h1>

                {/* --- PART A: THE STICKY TRACK (Header + Rows) --- */}
                <div className="relative bg-white w-full">

                    {/* 1. STICKY HEADER (Top of the Card) */}
                    {/* FIXED: top-[80px] to account for sticky navbar */}
                    <div className="sticky top-[80px] z-40 bg-[#FDFBF7] md:h-[200px] h-[160px] flex flex-col justify-end">
                        <div className="bg-white rounded-t-[32px] border-x border-t border-gray-200 md:h-[120px] h-[100px] w-full">
                            <div className="grid grid-cols-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] h-full items-end pb-4 md:pb-6 w-full md:min-w-[768px]">

                                {/* COL 1: EMPTY (Removed Pop-up Title) */}
                                <div className="hidden md:flex pl-8 flex-col justify-end h-full overflow-hidden relative z-50">
                                </div>

                                {/* COL 2: ESSENTIAL / BASIC */}
                                <div className="text-center text-lg md:text-2xl font-bold text-gray-900">
                                    Basic
                                </div>

                                {/* COL 3: PLUS */}
                                <div className="h-full flex flex-col justify-end relative z-10 w-full mb-1">
                                    <div className="absolute top-2 md:top-4 left-0 right-0 mx-auto w-full px-1 flex justify-center">
                                        <div className="bg-[#4F62D6] text-white text-[9px] md:text-[10px] font-bold px-2 md:px-4 py-0.5 md:py-1 rounded-full uppercase tracking-wide shadow-none whitespace-nowrap">
                                            Most Popular
                                        </div>
                                    </div>
                                    <div className="text-center text-lg md:text-2xl font-bold text-gray-900 pb-0">
                                        Plus
                                    </div>
                                </div>

                                {/* COL 4: PRO */}
                                <div className="text-center text-lg md:text-2xl font-bold text-gray-900">
                                    Pro
                                </div>
                            </div>

                            {/* Divider Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                        </div>
                    </div>

                    {/* 2. TABLE BODY (The Middle) */}
                    {/* border-x connects the header to the stopper */}
                    <div className="border-x border-gray-200 bg-white">
                        <div className="grid grid-cols-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:min-w-[768px] text-sm text-gray-900">

                            <SectionTitle id="TECHNICAL SUPPORT" title="Technical Support" />
                            <Row label="Email" val1="Standard (3 days)" val2="Priority (1 day)" val3="Priority (1 day)" />

                            <SectionTitle id="BENEFITS & SUPPORT" title="Benefits & Support" />
                            <Row label="Number of returns" val1="1" val2="1" val3="1" />
                            <Row label="Maximum return guaranteed" check1 check2 check3 />
                            <Row label="Year-round tax advice" check2 check3 />
                            <Row label="Audit protection" check2 check3 />
                            <Row label="Expert advice" check3 />

                            <SectionTitle id="INCOME TYPES" title="Income Types" />
                            <Row label="Employment (T4)" check1 check2 check3 />
                            <Row label="Gig economy / Side hustle" check2 check3 />
                            <Row label="Investment (T3/T5)" check2 check3 />
                            <Row label="Capital gains" check3 />
                            <Row label="Crypto" check3 />
                            <Row label="Rental income" check3 />
                            <Row label="Foreign income" check3 />

                            <SectionTitle id="DEDUCTIONS & CREDITS" title="Deductions & Credits" />
                            <Row label="Tuition & students" check1 check2 check3 />
                            <Row label="RRSP contributions" check2 check3 />
                            <Row label="Medical expenses" check2 check3 />
                            <Row label="Charitable donations" check2 check3 />
                            {/* The Track ends here */}
                            <Row label="Work from home" check2 check3 />
                        </div>
                    </div>
                </div>

                {/* --- PART B: THE STOPPER (Rounded Bottom) --- */}
                {/* Sits OUTSIDE the track. Header stops before hitting this. */}
                <div className="h-24 w-full bg-white border-x border-b border-gray-200 rounded-b-[32px]"></div>

                {/* DISCLAIMER */}
                <div className="text-left pt-4 pb-8 pl-8">
                    <p className="text-gray-400 text-[10px] tracking-wide">*This chart was last updated December 2025</p>
                </div>

                {/* --- PRICING FOOTER --- */}
                {/* Matches width via parent max-w-7xl */}
                {/* Bottom CTA - Horizontal Layout */}
                <div className='mt-8 mb-24 max-w-7xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm py-12 px-10 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8'>

                    {/* Left Side: Text */}
                    <div className='text-left md:max-w-2xl'>
                        <h3 className='text-3xl font-bold text-gray-900 mb-4 tracking-tight'>
                            Ready to keep more of what&apos;s yours?
                        </h3>
                        <p className='text-lg text-gray-500 leading-relaxed'>
                            Just upload your documents, and our system will automatically match you with the right tier.
                        </p>
                    </div>

                    {/* Right Side: Button */}
                    <div className='flex-shrink-0'>
                        <Link
                            href='/get-started'
                            className='inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white transition-all bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
                        >
                            Start Filing
                        </Link>
                    </div>

                </div>

            </div>

            <Footer />
        </div>
    );
}

/* --- COMPONENTS --- */

function SectionTitle({ title, id }: { title: string, id: string }) {
    return (
        <div id={id} className="compare-target col-span-3 md:col-span-4 pt-10 md:pt-12 pb-4 md:pb-6 px-4 md:px-8 bg-white scroll-mt-64">
            <h4 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight uppercase">
                {title}
            </h4>
        </div>
    );
}

function Row({ label, val1, val2, val3, check1, check2, check3 }: any) {
    return (
        <>
            <div className="col-span-3 md:col-span-1 py-1 px-4 md:py-5 md:px-8 flex items-center bg-[#FDFBF7] md:bg-white pt-6 md:pt-5 border-t border-gray-100 md:border-t-[1px]">
                <span className="font-bold md:font-medium text-gray-900 text-sm md:text-base">{label}</span>
            </div>
            <div className="py-4 md:py-5 px-2 md:px-4 md:border-t border-gray-100 flex items-center justify-center bg-white text-center">
                {check1 ? <Check className="w-5 h-5 text-gray-900 mx-auto" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm">{val1}</span>}
            </div>
            <div className="py-4 md:py-5 px-2 md:px-4 md:border-t border-gray-100 border-l border-gray-100 flex items-center justify-center bg-white text-center">
                {check2 ? <Check className="w-5 h-5 text-gray-900 mx-auto" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm">{val2}</span>}
            </div>
            <div className="py-4 md:py-5 px-2 md:px-4 md:border-t border-gray-100 border-l border-gray-100 flex items-center justify-center bg-white text-center">
                {check3 ? <Check className="w-5 h-5 text-gray-900 mx-auto" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm">{val3}</span>}
            </div>
        </>
    );
}

function PriceColumn({ name, price, link, btnText, variant, badge }: any) {
    return (
        <div className="flex flex-col items-center justify-end h-full relative">
            {badge && (
                <div className="absolute -top-12 bg-[#4F62D6] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-none">
                    Most Popular
                </div>
            )}
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-400 text-xs font-medium">+tax</span>
                </div>
            </div>

            {/* FIX: This Link IS now the button. No nesting conflicts. */}
            <Link
                href={link}
                className={`inline-block min-w-[180px] py-3 px-6 rounded-full text-center text-sm font-medium transition-all ${variant === 'black' ? 'bg-[#1F1F1F] text-white hover:bg-black' :
                    variant === 'blue' ? 'bg-[#4F62D6] text-white hover:bg-blue-700' :
                        'bg-white border border-gray-200 text-gray-900 hover:border-gray-400'
                    }`}
            >
                {btnText}
            </Link>
        </div>
    );
}
