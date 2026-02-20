"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [loading, setLoading] = useState(true);
    const [jobData, setJobData] = useState<any>(null);
    const [paymentInfo, setPaymentInfo] = useState<string>("");

    useEffect(() => {
        // Clear local storage immediately
        localStorage.removeItem('vsf_courier_draft');

        async function verifyPayment() {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/jobs/confirm?session_id=${sessionId}`);
                if (!res.ok) throw new Error("Verification Failed");

                const data = await res.json();
                setJobData(data.job);
                setPaymentInfo(data.paymentInfo);
            } catch (err) {
                console.error("Verification Error:", err);
            } finally {
                setLoading(false);
            }
        }

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <Loader2 className="w-12 h-12 text-[#2952E3] animate-spin mb-4" />
                <h2 className="text-xl font-bold text-[#111]">Verifying Payment...</h2>
            </div>
        );
    }

    // Default Fallback if no data found (e.g. direct visit)
    // Default Fallback if no data found
    // Manual Formatting (The 'Stop Math' Fix)
    const displayTime = jobData?.scheduled_time
        ? (() => {
            const dateStr = jobData.scheduled_time; // Expect "2026-01-27T16:00:00"
            // Split manually
            const [y, m, d, h, min] = dateStr.split(/[-T:]/);
            const dateObj = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));

            return dateObj.toLocaleString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
        })()
        : "Standard Pickup Window";

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-20 pb-12 px-6 font-manrope text-[#111]">

            {/* Header */}
            <h1 className="text-4xl font-bold mb-10 tracking-tight text-center">Pickup Confirmed!</h1>

            {/* The Icon */}
            <div className="bg-[#54A05C] rounded-full w-24 h-24 flex items-center justify-center mb-12 shadow-sm">
                <Check className="w-12 h-12 text-white stroke-[4]" />
            </div>

            {/* The Receipt Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-[500px] shadow-sm mx-auto">
                <div className="space-y-5">

                    {/* Time */}
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start">
                        <span className="font-bold min-w-[100px] text-black">Time:</span>
                        <span className="text-gray-800 font-medium">{displayTime}</span>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start">
                        <span className="font-bold min-w-[100px] text-black">Location:</span>
                        <span className="text-gray-800 font-medium">{jobData?.pickup_address || "Calgary, AB"}</span>
                    </div>

                    {/* Transaction */}
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start">
                        <span className="font-bold min-w-[100px] text-black">Transaction:</span>
                        <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">{paymentInfo || "Paid - $50.00"}</span>
                            <span className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wide">
                                Service: {jobData?.package_tier || "Standard"} Package
                            </span>
                            <span className="text-[9px] text-gray-400 font-normal mt-0.5">
                                Includes Courier Pickup & Intake. Filing fees billed separately.
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start">
                        <span className="font-bold min-w-[100px] text-black">Courier Notes:</span>
                        <span className="text-gray-800 font-medium leading-relaxed">
                            {jobData?.courier_notes || "None provided"}
                        </span>
                    </div>

                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-12 text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-black mb-3">Access your Secure Portal</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                    We have automatically created a secure guest account for you. A link has been sent to <span className="font-semibold text-gray-700">{jobData?.email || "your email"}</span>. Click it to track your driver and view your receipt.
                </p>
            </div>

            {/* Return Button */}
            <Link href="/">
                <button className="mt-12 rounded-full border border-gray-200 px-10 py-3 text-gray-400 font-medium hover:text-black hover:border-gray-400 transition-colors bg-transparent">
                    Return to Home
                </button>
            </Link>

        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
