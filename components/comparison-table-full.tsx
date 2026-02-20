'use client';
import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

export function ComparisonTableFull() {
    return (
        <section className="bg-transparent py-20 relative">
            <div className="max-w-7xl mx-auto px-4 pt-16">
                <div className="w-full pb-4">
                    {/* STICKY TRACK */}
                    <div className="relative bg-transparent w-full">

                        {/* STICKY HEADER - THE SANDWICH MASK: Container is opaque eggshell to hide scrolling text */}
                        <div className="sticky top-[80px] z-40 md:h-[200px] h-[160px] flex flex-col justify-end pointer-events-none bg-gray-50">
                            <div className="bg-white rounded-t-[32px] border-x border-t border-gray-200 md:h-[120px] h-[100px] w-full pointer-events-auto">
                                <div className="grid grid-cols-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] h-full items-end pb-4 md:pb-6 w-full md:min-w-[768px]">
                                    <div className="hidden md:flex pl-8 flex-col justify-end h-full relative z-50"></div>
                                    <div className="text-center text-lg md:text-2xl font-bold text-gray-900">Basic</div>
                                    <div className="h-full flex flex-col justify-end relative min-w-0">
                                        <div className="absolute top-2 md:top-4 left-0 right-0 mx-auto w-full px-1 flex justify-center">
                                            <div className="bg-[#4F62D6] text-white text-[8px] md:text-[10px] font-bold px-1 md:px-4 py-0.5 md:py-1 rounded-full uppercase tracking-tight shadow-none whitespace-nowrap max-w-full overflow-hidden text-ellipsis">Most Popular</div>
                                        </div>
                                        <div className="text-center text-lg md:text-2xl font-bold text-gray-900 pb-0 shrink-0">Plus</div>
                                    </div>
                                    <div className="text-center text-lg md:text-2xl font-bold text-gray-900">Pro</div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                            </div>

                        </div>

                        {/* TABLE BODY */}
                        <div className="border-x border-gray-200 bg-white relative z-10">
                            <div className="grid grid-cols-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:min-w-[768px] text-sm text-gray-900">
                                <SectionTitle id='TECH' title='Technical Support' />
                                <Row label='Email & Dashboard Chat' val1='less than 3 days' val2='less than 1 day' val3='less than 1 day' />
                                <SectionTitle id='BENEFITS' title='Benefits & Support' />
                                <Row label='Number of returns' val1='1' val2='1' val3='1' />
                                <Row label='Maximum return guaranteed' check1 check2 check3 />
                                <Row label='Year-round tax advice' check2 check3 />
                                <Row label='Audit protection' check2 check3 />
                                <Row label='Expert advice' check3 />
                                <SectionTitle id='INCOME' title='Income Types' />
                                <Row label='Employment (T4)' check1 check2 check3 />
                                <Row label='Self-employment income' check2 check3 />
                                <Row label='Investment income (T3/T5)' check2 check3 />
                                <Row label='Capital gains (T5008)' check3 />
                                <Row label='Crypto (T5008)' check3 />
                                <Row label='Rental income' check3 />
                                <Row label='Foreign income' check3 />
                                <SectionTitle id='DEDUCTIONS' title='Deductions & Credits' />
                                <Row label='Tuition & students' check1 check2 check3 />
                                <Row label='RRSP contributions' check2 check3 />
                                <Row label='Medical expenses' check2 check3 />
                                <Row label='Charitable donations' check2 check3 />
                                <Row label='Work from home' check2 check3 />
                            </div>
                        </div>
                    </div>

                    {/* STOPPER */}
                    <div className="h-24 w-full bg-white border-x border-b border-gray-200 rounded-b-[32px] relative z-10"></div>
                </div>

                {/* DISCLAIMER */}
                <div className="text-left pt-4 pb-8 pl-8">
                    <p className="text-gray-400 text-[10px] tracking-wide">*This chart was last updated December 2025</p>
                </div>

                {/* FOOTER CARD (Z-Index Fix applied here) */}


            </div>
        </section>
    );
}

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
            <div className="col-span-3 md:col-span-1 py-1 px-4 md:py-5 md:px-8 flex items-center bg-[#FDFBF7] md:bg-white pt-6 md:pt-5 border-t border-gray-100 md:border-t-[1px] min-w-0">
                <span className="font-bold md:font-medium text-gray-900 text-sm md:text-base truncate break-words">{label}</span>
            </div>
            <div className="py-4 md:py-5 px-1 md:px-4 md:border-t border-gray-100 flex items-center justify-center bg-white text-center min-w-0">
                {check1 ? <Check className="w-5 h-5 text-gray-900 mx-auto flex-shrink-0" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm leading-tight break-words">{val1}</span>}
            </div>
            <div className="py-4 md:py-5 px-1 md:px-4 md:border-t border-gray-100 border-l border-gray-100 flex items-center justify-center bg-white text-center min-w-0">
                {check2 ? <Check className="w-5 h-5 text-gray-900 mx-auto flex-shrink-0" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm leading-tight break-words">{val2}</span>}
            </div>
            <div className="py-4 md:py-5 px-1 md:px-4 md:border-t border-gray-100 border-l border-gray-100 flex items-center justify-center bg-white text-center min-w-0">
                {check3 ? <Check className="w-5 h-5 text-gray-900 mx-auto flex-shrink-0" /> : <span className="text-gray-500 font-medium text-[11px] md:text-sm leading-tight break-words">{val3}</span>}
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
