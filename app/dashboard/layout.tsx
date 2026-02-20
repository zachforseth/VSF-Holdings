'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardNavbar from '@/app/components/dashboard-navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // SECURE TUNNEL LOGIC: Bypass Dashboard Shell for specific pages
    if (pathname?.startsWith('/dashboard/new-profile') || pathname?.startsWith('/dashboard/verify-identity') || pathname?.startsWith('/filing/select-profile') || pathname?.startsWith('/filing/select-year')) {
        return <div className="font-manrope">{children}</div>;
    }

    const isChatPage = pathname?.startsWith('/dashboard/chat');

    const familyFilingSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Multi-Entity Family Tax Filing",
        "provider": {
            "@type": "LocalBusiness",
            "name": "VSF Capital Structuring"
        },
        "description": "Comprehensive tax preparation and filing service handling Multi-Entity Family logic, corporate T2 processing, and personal tax returns under one unified structure.",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Filing Profiles",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Primary Filer",
                        "description": "The main entity or individual responsible for the corporate and personal returns."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Child/Dependent Filer",
                        "description": "Linked family members processed under the parent organization's return bundle."
                    }
                }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] font-manrope">
            {/* --- TOP NAVBAR (STICKY) --- */}
            <DashboardNavbar />

            {/* Main Content */}
            <main className={`${isChatPage ? '' : 'p-4 sm:p-6 md:p-16'} max-w-[1400px] mx-auto overflow-x-hidden`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(familyFilingSchema) }}
                />
                {children}
            </main>
        </div>
    );
}
