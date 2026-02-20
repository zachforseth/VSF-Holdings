"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, LayoutGrid, FileText, CreditCard, LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const supabase = createClient();
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Explicit redirect to login after sign out
    };

    const isActive = (path: string) => {
        return pathname.includes(path);
    };

    return (
        <aside className="w-64 bg-[#FAF9F6] border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
            {/* Logo Area */}
            <div className="p-10 mb-8">
                <Image src="/images/logo.svg" alt="VSF Capital" width={40} height={40} className="opacity-90" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-8 space-y-6">
                <Link href="/portal/dashboard" className="block group">
                    <span className={`text-sm font-medium tracking-wide transition-colors ${isActive('/portal/dashboard') && !pathname.includes('mode=online') ? 'text-[#111]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        Overview
                    </span>
                </Link>
                <Link href="/portal/dashboard?mode=online" className="block group">
                    <span className={`text-sm font-medium tracking-wide transition-colors ${false ? 'text-[#111]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        Documents
                    </span>
                </Link>
                <Link href="/portal/dashboard" className="block group">
                    <span className={`text-sm font-medium tracking-wide transition-colors ${false ? 'text-[#111]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        Billing
                    </span>
                </Link>
            </nav>

            {/* Footer Actions */}
            <div className="p-8 space-y-4">
                <button
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#111] transition-colors"
                    onClick={handleSignOut}
                >
                    Sign Out
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </aside>
    );
}

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    // Auth check removed - handled by Middleware and Server Components

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex font-manrope">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <div className="w-full max-w-7xl mx-auto p-8 md:p-16 mb-20">
                    {children}
                </div>
            </div>
        </div>
    );
}
