"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { X, UserCircle, FilePlus, Search, PenLine } from "lucide-react"; // Using PenLine as closest to Signature if Signature not available, or I'll check generic lucide
import Link from "next/link";

// Lucide doesn't have a specific "Signature" icon, using PenLine as a good semantic approximation for signing.
// Figma prompt asked for "Signature" - typically represented by a pen.

function InstructionsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "essential";

    const handleNext = () => {
        router.push(`/login?plan=${plan}&method=online`);
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#FAF9F6] flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center p-6 md:p-8 w-full absolute top-0 left-0 z-10">
                <Link href={`/start?plan=${plan}`} className="text-[#111] font-semibold underline underline-offset-4 hover:opacity-70 transition">
                    Back
                </Link>
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition block">
                    <X className="w-6 h-6 text-[#111]" />
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-7xl mx-auto">

                <h1 className="text-4xl md:text-5xl font-bold text-[#111] text-center mb-24 font-manrope">
                    Professional filing, entirely digital.
                </h1>

                {/* 4-Step Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 w-full px-4 mb-24">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center">
                        <UserCircle className="w-12 h-12 text-[#111] mb-6" strokeWidth={1} />
                        <p className="max-w-[220px] font-semibold text-lg text-[#111] leading-snug">
                            Provide some info so we know how to best help you
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center">
                        <FilePlus className="w-12 h-12 text-[#111] mb-6" strokeWidth={1} />
                        <p className="max-w-[220px] font-semibold text-lg text-[#111] leading-snug">
                            Add your ID and tax documents
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center">
                        <Search className="w-12 h-12 text-[#111] mb-6" strokeWidth={1} />
                        <p className="max-w-[220px] font-semibold text-lg text-[#111] leading-snug">
                            Our team reviews and prepares your documents
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center">
                        <PenLine className="w-12 h-12 text-[#111] mb-6" strokeWidth={1} />
                        <p className="max-w-[220px] font-semibold text-lg text-[#111] leading-snug">
                            Review & E-Sign or connect with your tax professional
                        </p>
                    </div>
                </div>

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    className="w-[200px] bg-[#2952E3] text-white font-semibold rounded-full py-6 text-lg hover:bg-blue-700 transition"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default function InstructionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InstructionsContent />
        </Suspense>
    );
}
