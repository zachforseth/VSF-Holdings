"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Users, User, Baby, Building2 } from "lucide-react";

export function PriceCalculator() {
    const [filers, setFilers] = useState({
        primary: 1,
        partner: 0,
        dependents: 0,
        corporate: 0,
    });

    const basePrice = 150; // Essential
    const partnerPrice = 100; // Discounted for family
    const dependentPrice = 50; // Discounted for family
    const corporatePrice = 1200; // Flat T2

    const calculateTotal = () => {
        return (
            filers.primary * basePrice +
            filers.partner * partnerPrice +
            filers.dependents * dependentPrice +
            filers.corporate * corporatePrice
        );
    };

    const isFamilyBundle = filers.partner > 0 || filers.dependents > 0;

    return (
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-gray-100 font-manrope max-w-2xl mx-auto w-full">
            <div className="mb-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900">Custom Price Calculator</h3>
                <p className="text-gray-500 mt-3 font-light">Build your perfect filing bundle.</p>
            </div>

            <div className="space-y-4">
                {/* Primary Filer */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-5">
                        <div className="bg-blue-50 p-3 rounded-xl text-[#2952E3]">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Primary Filer</p>
                            <p className="text-sm text-gray-500 font-medium">Starting at ${basePrice}</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 md:mr-4 text-gray-400">
                        <span className="font-bold text-xl text-gray-900 md:hidden">Count</span>
                        <span className="font-bold text-xl text-gray-900">1</span>
                    </div>
                </div>

                {/* Partner / Spouse */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-5">
                        <div className="bg-blue-50 p-3 rounded-xl text-[#2952E3]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Partner / Spouse</p>
                            <p className="text-sm text-blue-600 font-medium">+${partnerPrice} (Family Rate)</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 bg-white md:bg-transparent rounded-full md:rounded-none p-1 md:p-0 border border-gray-200 md:border-none shadow-sm md:shadow-none">
                        <span className="font-bold text-sm text-gray-500 ml-3 md:hidden">Quantity</span>
                        <div className="flex items-center gap-2 bg-white rounded-full p-1 md:border md:border-gray-200 md:shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, partner: Math.max(0, filers.partner - 1) })}
                            >
                                -
                            </Button>
                            <span className="font-bold text-lg w-4 text-center text-gray-900">{filers.partner}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, partner: Math.min(1, filers.partner + 1) })}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dependents */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-5">
                        <div className="bg-blue-50 p-3 rounded-xl text-[#2952E3]">
                            <Baby className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Dependents</p>
                            <p className="text-sm text-blue-600 font-medium">+${dependentPrice} per child</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 bg-white md:bg-transparent rounded-full md:rounded-none p-1 md:p-0 border border-gray-200 md:border-none shadow-sm md:shadow-none">
                        <span className="font-bold text-sm text-gray-500 ml-3 md:hidden">Quantity</span>
                        <div className="flex items-center gap-2 bg-white rounded-full p-1 md:border md:border-gray-200 md:shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, dependents: Math.max(0, filers.dependents - 1) })}
                            >
                                -
                            </Button>
                            <span className="font-bold text-lg w-4 text-center text-gray-900">{filers.dependents}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, dependents: filers.dependents + 1 })}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Corporate */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-5">
                        <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Corporate Entity (T2)</p>
                            <p className="text-sm text-gray-500 font-medium">+${corporatePrice} per corporation</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 bg-white md:bg-transparent rounded-full md:rounded-none p-1 md:p-0 border border-gray-200 md:border-none shadow-sm md:shadow-none">
                        <span className="font-bold text-sm text-gray-500 ml-3 md:hidden">Quantity</span>
                        <div className="flex items-center gap-2 bg-white rounded-full p-1 md:border md:border-gray-200 md:shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, corporate: Math.max(0, filers.corporate - 1) })}
                            >
                                -
                            </Button>
                            <span className="font-bold text-lg w-4 text-center text-gray-900">{filers.corporate}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600"
                                onClick={() => setFilers({ ...filers, corporate: filers.corporate + 1 })}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        {isFamilyBundle ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold uppercase tracking-widest text-xs mb-2">
                                <Check className="w-3 h-3" /> Family Bundle Applied
                            </div>
                        ) : (
                            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                                Standard Rate
                            </p>
                        )}
                        <p className="text-gray-500 text-sm font-medium">Includes all taxes and filing fees.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-6xl font-black tracking-tighter text-gray-900">
                            ${calculateTotal()}
                        </p>
                    </div>
                </div>

                <Button className="w-full h-16 text-xl rounded-full bg-[#2952E3] hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Select Bundle & Proceed
                </Button>
                <p className="text-center text-xs text-gray-400 mt-4 flex justify-center items-center gap-1.5 font-medium uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5" /> Secure Stripe Checkout
                </p>
            </div>
        </div>
    );
}
