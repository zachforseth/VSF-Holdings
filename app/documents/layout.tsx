'use client';

import React from 'react';
import DashboardNavbar from '@/app/components/dashboard-navbar';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FCFCFC] font-manrope">
            <DashboardNavbar />
            {children}
        </div>
    );
}
