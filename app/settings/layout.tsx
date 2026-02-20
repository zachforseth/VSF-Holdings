'use client';

import React from 'react';
import DashboardNavbar from '@/app/components/dashboard-navbar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FCFCFC] font-manrope">
            <DashboardNavbar />
            <main className="p-8 md:p-16 max-w-[1400px] mx-auto">
                {children}
            </main>
        </div>
    );
}
