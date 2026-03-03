"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

function StartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "essential";
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handleNext = () => {
        if (selectedMethod) {
            // TRACKING: Start Questionnaire
            if (typeof window !== "undefined") {
                if ((window as any).fbq) {
                    (window as any).fbq('trackCustom', 'StartQuestionnaire', { method: selectedMethod });
                }
                if ((window as any).ttq) {
                    (window as any).ttq.track('StartQuestionnaire', { method: selectedMethod });
                }
            }

            if (selectedMethod === "home") {
                router.push(`/instructions?plan=${plan}`);
            } else if (selectedMethod === "office") {
                router.push('/visit');
            } else {
                router.push(`/onboarding?plan=${plan}&method=${selectedMethod}`);
            }
        }
    };

    return (
        <div className="h-screen w-screen bg-white overflow-hidden flex flex-col items-center justify-center relative">
            {/* Header: Close Action Only */}
            <div className="absolute top-0 right-0 p-6 md:p-8">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition block">
                    <X className="w-6 h-6 text-[#111]" />
                </Link>
            </div>

            {/* Main Content: Centered Selection */}
            <div className="w-full max-w-[500px] p-4 flex flex-col items-center">

                <h1 className="text-3xl font-bold text-[#111] text-center mb-12 font-manrope">
                    How do you want to get started with your tax {plan.charAt(0).toUpperCase() + plan.slice(1)}?
                </h1>

                <div className="w-full space-y-4 mb-12">
                    {/* Option 1: Home (Recommended) - New Design with Blue Header */}
                    <div
                        onClick={() => setSelectedMethod("home")}
                        className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${selectedMethod === "home"
                            ? "border-[#2952E3] bg-blue-50/50"
                            : "border-gray-100 hover:border-gray-200"
                            }`}
                    >
                        {/* Blue Header Bar */}
                        <div className="bg-[#7297DF] w-full py-1.5 flex justify-center items-center">
                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                                Recommended
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                            <span className="font-bold text-lg text-[#111] block mb-1">From Home</span>
                            <p className="text-gray-500 text-sm">Upload your documents online</p>
                        </div>
                    </div>

                    {/* Option 2: Office */}
                    <div
                        onClick={() => setSelectedMethod("office")}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedMethod === "office"
                            ? "border-[#2952E3] bg-blue-50/50"
                            : "border-gray-100 hover:border-gray-200"
                            }`}
                    >
                        <span className="font-bold text-lg text-[#111] block mb-1">Drop off my files at an office</span>
                        <p className="text-gray-500 text-sm">Meet with a tax professional, if you want</p>
                    </div>

                    {/* Option 3: Courier */}
                    <div
                        onClick={() => setSelectedMethod("courier")}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedMethod === "courier"
                            ? "border-[#2952E3] bg-blue-50/50"
                            : "border-gray-100 hover:border-gray-200"
                            }`}
                    >
                        <span className="font-bold text-lg text-[#111] block mb-1">Have VSF pick up my documents</span>
                        <p className="text-gray-500 text-sm">Have a tax professional pick up your documents</p>
                    </div>
                </div>

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    disabled={!selectedMethod}
                    className="w-[200px] bg-[#2952E3] text-white font-semibold rounded-full py-6 text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default function StartPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StartContent />
        </Suspense>
    );
}
