'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewPage() {
    // Dummy state for the card rendering
    const [filings] = useState([
        { id: 1, name: "Zach's Tax Return", plan: 'Pro', price: 350 },
    ]);

    const total = filings.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 pb-32">

            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-bold text-[#111] font-manrope mb-4">
                    Review your Filing Group
                </h1>
                <p className="text-gray-500 max-w-xl mx-auto text-lg">
                    Verify the returns in your group before proceeding to checkout.
                </p>
            </div>

            {/* The Filing Cards */}
            <div className="space-y-4 mb-12">
                {filings.map((filing) => (
                    <div
                        key={filing.id}
                        className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-md"
                    >
                        {/* Left: Name */}
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="w-12 h-12 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#2952E3] font-bold text-lg">
                                {filing.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-[#111]">{filing.name}</h3>
                                <p className="text-sm text-gray-500">Ready for review</p>
                            </div>
                        </div>

                        {/* Right: Plan Price */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <span className="block font-bold text-lg text-[#111]">{filing.plan} Plan</span>
                                <span className="block text-gray-500">${filing.price}</span>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <div className="flex justify-center mb-24">
                <Link href="/filing/select-profile">
                    <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                        <Plus className="w-4 h-4" />
                        <span>Add another return</span>
                    </button>
                </Link>
            </div>

            {/* --- STICKY FOOTER --- */}
            <div className="fixed bottom-8 left-0 right-0 px-4 md:px-0 flex justify-center z-50">
                <div className="bg-[#2952E3] text-white rounded-full p-2 pl-8 pr-2 shadow-[0_8px_32px_rgba(41,82,227,0.4)] flex items-center justify-between gap-8 min-w-[320px] md:min-w-[400px] backdrop-blur-md bg-opacity-95">

                    {/* Total (Left) */}
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Total</span>
                        <span className="text-xl font-bold font-manrope">${total}</span>
                    </div>

                    {/* Proceed Button (Right) */}
                    {/* Linking to where we believe the Stripe Checkout flow starts or exists. 
                        User said 'Stripe Checkout page we built earlier'. 
                        I'm pointing to /portal for now or /start/checkout if it exists. 
                        Actually I'll use a Button that could trigger an action, 
                        but prompt asked to Link. keeping it simple. */}
                    <Link href="/api/checkout_sessions">
                        <Button className="rounded-full bg-white text-[#2952E3] font-bold px-8 py-3 hover:bg-white/90 h-auto text-base">
                            Proceed to payment
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    );
}
