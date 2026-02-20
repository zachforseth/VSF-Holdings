'use client';

import React from 'react';
import DashboardNavbar from '@/app/components/dashboard-navbar';

export default function FinalApprovalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FCFCFC] font-manrope">
            {/* Same Navbar as Dashboard and Documents */}
            <DashboardNavbar />
            {children}
        </div>
    );
}
