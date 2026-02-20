'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function VisitPage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUser(data.user);
            }
        };
        checkUser();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-[#2952E3] text-white p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto flex flex-col h-full">

                {/* --- NAVIGATION ROW --- */}
                <div className="flex justify-between items-center mb-12">
                    <Link href="/" className="text-lg font-medium underline decoration-1 underline-offset-4 hover:opacity-80">
                        Back
                    </Link>
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white" />
                    </Link>
                </div>

                {/* --- MAIN CONTENT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-12">

                    {/* LEFT COL: INFO */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                            Visit VSF
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-12 font-light">
                            No appointment necessary for drop-offs.
                        </p>

                        {/* Address Section */}
                        <div className="mb-8 border-b border-white/20 pb-8">
                            <div className="flex justify-between text-lg md:text-xl">
                                <span className="font-bold">Address:</span>
                                <span className="text-right">
                                    10th Floor, Bankers Hall West Tower<br />
                                    888 3rd Street SW<br />
                                    Calgary, Alberta, T2P 5C5
                                </span>
                            </div>
                        </div>

                        {/* Hours Section */}
                        <div className="space-y-2 text-lg md:text-xl">
                            <div className="flex justify-between">
                                <span className="font-bold">Monday:</span>
                                <span>9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">Tuesday:</span>
                                <span>9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">Wednesday:</span>
                                <span>9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">Thursday:</span>
                                <span>9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">Friday:</span>
                                <span>9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between text-blue-100">
                                <span className="font-bold">Saturday:</span>
                                <span>Closed</span>
                            </div>
                            <div className="flex justify-between text-blue-100">
                                <span className="font-bold">Sunday:</span>
                                <span>Closed</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: GOOGLE MAP (IFRAME VERSION) */}
                    <div className="w-full h-[400px] lg:h-auto rounded-3xl shadow-xl overflow-hidden bg-gray-100 relative">
                        <iframe
                            src="https://www.google.com/maps?q=10th+Floor+888+3rd+Street+SW+Bankers+Hall+West+Tower+Calgary+Alberta+T2P+5C5&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            className="absolute inset-0"
                        />
                    </div>
                </div>

                {/* --- FOOTER CARD --- */}
                <div className="mt-auto bg-[#1a35a6] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-lg">
                    <div className="max-w-xl">
                        <h3 className="text-3xl font-bold mb-2">
                            {user ? `Welcome back, ${user.user_metadata?.full_name || user.email}` : "Have you filed with us before?"}
                        </h3>
                        <p className="text-blue-100 text-lg">
                            {user ? "Continue to your dashboard to track your filing or chat with your advisor." : "Skip the intake line, sign in to book a specific hand-off time with your tax professional."}
                        </p>
                    </div>

                    {/* Sign In Button Container */}
                    <div className="w-full md:w-auto">
                        <Link href={user ? "/dashboard" : "/login"}>
                            <button className="w-full md:w-auto bg-[#2D2D2D] hover:bg-black text-white px-16 py-6 rounded-full font-bold text-2xl transition-all shadow-lg">
                                {user ? "Go to Dashboard" : "Sign In"}
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
