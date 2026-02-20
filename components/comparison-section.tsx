"use client";

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ComparisonSection() {
    return (
        <section className="bg-[#FDFBF7] py-24">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-16 tracking-tight font-manrope">
                    Compare Plans
                </h2>

                {/* --- PART A: THE STICKY TRACK (Header + Rows) --- */}
                {/* Relative wrapper defines the 'Scroll Track'. No overflow-hidden. */}
                <div className="relative bg-white rounded-t-[32px] border border-gray-200 shadow-sm overflow-hidden">

                    {/* 1. STICKY HEADER (Top of the Card) */}
                    {/* sticky top-0 to stick to the top of the viewport when scrolling inside the section */}
                    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] min-w-[768px] items-end pb-6 pt-8">

                            {/* COL 1: EMPTY */}
                            <div className="pl-8 flex flex-col justify-end h-full">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Features</span>
                            </div>

                            {/* COL 2: ESSENTIAL */}
                            <div className="text-center text-xl md:text-2xl font-bold text-gray-900 font-manrope">
                                Essential
                            </div>

                            {/* COL 3: PLUS */}
                            <div className="relative flex flex-col items-center justify-end">
                                <div className="absolute -top-4">
                                    <div className="bg-[#4F62D6] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                </div>
                                <div className="text-center text-xl md:text-2xl font-bold text-gray-900 font-manrope">
                                    Plus
                                </div>
                            </div>

                            {/* COL 4: PRO */}
                            <div className="text-center text-xl md:text-2xl font-bold text-gray-900 font-manrope">
                                Pro
                            </div>
                        </div>
                    </div>

                    {/* 2. TABLE BODY (The Middle) */}
                    <div className="bg-white overflow-x-auto">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] min-w-[768px] text-sm text-gray-900">

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
                            <Row label="Work from home" check2 check3 />
                        </div>
                    </div>

                    {/* --- PRICING FOOTER (Inside the card bottom) --- */}
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] min-w-[768px] border-t border-gray-200 bg-gray-50/50 py-8">
                        <div className="hidden md:flex flex-col justify-center h-full pl-8">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900 text-xs tracking-wide uppercase">Professional filing.</p>
                                <p className="font-bold text-gray-900 text-xs tracking-wide uppercase">Maximum refund.</p>
                                <p className="font-bold text-gray-900 text-xs tracking-wide uppercase">Zero stress.</p>
                            </div>
                        </div>
                        {/* Empty spacer for mobile layout if needed or just hide the text column */}
                        <div className="md:hidden"></div>

                        <PriceColumn price="150" />
                        <PriceColumn price="250" />
                        <PriceColumn price="350" />
                    </div>
                </div>

                {/* DISCLAIMER */}
                <div className="text-left pt-4 pb-8 pl-4">
                    <p className="text-gray-400 text-[10px] tracking-wide">*This chart was last updated December 2025</p>
                </div>
            </div>
        </section>
    );
}

/* --- SUB-COMPONENTS --- */

function SectionTitle({ title, id }: { title: string, id: string }) {
    return (
        <div id={id} className="col-span-4 pt-12 pb-4 px-8 bg-white border-t border-gray-100 first:border-t-0">
            <h4 className="text-lg font-bold text-gray-900 tracking-tight uppercase">
                {title}
            </h4>
        </div>
    );
}

function Row({ label, val1, val2, val3, check1, check2, check3 }: any) {
    return (
        <>
            <div className="py-4 px-8 border-t border-gray-100 flex items-center bg-white">
                <span className="font-medium text-gray-900">{label}</span>
            </div>
            <div className="py-4 px-4 border-t border-gray-100 flex items-center justify-center bg-white border-l border-gray-50">
                {check1 ? <Check className="w-5 h-5 text-[#2952E3]" /> : <span className="text-gray-400 font-medium text-xs">{val1 || '-'}</span>}
            </div>
            <div className="py-4 px-4 border-t border-gray-100 flex items-center justify-center bg-white border-l border-gray-50">
                {check2 ? <Check className="w-5 h-5 text-[#2952E3]" /> : <span className="text-gray-400 font-medium text-xs">{val2 || '-'}</span>}
            </div>
            <div className="py-4 px-4 border-t border-gray-100 flex items-center justify-center bg-white border-l border-gray-50">
                {check3 ? <Check className="w-5 h-5 text-[#2952E3]" /> : <span className="text-gray-400 font-medium text-xs">{val3 || '-'}</span>}
            </div>
        </>
    );
}

function PriceColumn({ price }: { price: string }) {
    return (
        <div className="flex flex-col items-center justify-start h-full px-2">
            <div className="text-center mb-4">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-400 text-xs font-medium">+tax</span>
                </div>
            </div>

            <Button asChild size="sm" className="w-full max-w-[140px] rounded-full bg-[#2952E3] hover:bg-white text-white hover:text-[#2952E3] border border-transparent hover:border-[#2952E3] font-semibold text-xs h-9 transition-colors">
                <a href="mailto:info@vsfholdings.com">
                    Consultation
                </a>
            </Button>
        </div>
    );
}
