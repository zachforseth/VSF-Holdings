"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InlineWidget } from "react-calendly";

export default function BookConsultationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#FAF9F6] overflow-hidden">
            <section className="w-full h-full flex flex-col lg:flex-row items-stretch">

                {/* Left Side: Text and CTA */}
                <div className="w-full lg:w-5/12 p-8 lg:p-16 xl:p-24 flex flex-col justify-center shrink-0">
                    <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold font-manrope text-[#111] mb-6 leading-tight">
                        Meet with our team
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-500 mb-8 font-light max-w-lg">
                        Please choose a time on the calendar to schedule a quick introductory call with our senior advisory team. We look forward to learning more about your business.
                    </p>
                    <div className="mt-2">
                        <Link href="/business">
                            <Button className="rounded-full px-8 py-6 text-base lg:text-lg font-bold bg-[#2952E3] hover:bg-blue-700 text-white transition-colors shadow-sm">
                                Back to Business
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Side: Calendly Widget */}
                <div className="w-full flex-grow lg:w-7/12 relative overflow-hidden bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
                    <div className="absolute inset-0">
                        <InlineWidget
                            url="https://calendly.com/zachforseth-vsfholdings/30min"
                            styles={{
                                height: '100%',
                                minWidth: '320px'
                            }}
                        />
                    </div>
                </div>

            </section>
        </div>
    );
}
