import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperItemProps {
    label: string;
    status: 'done' | 'active' | 'upcoming';
    isLast?: boolean;
}

function StepperItem({ label, status, isLast }: StepperItemProps) {
    return (
        <div className="flex flex-col relative">
            <div className="flex items-center gap-4">
                {/* Circle / Icon */}
                <div
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors z-10",
                        status === 'done' && "bg-[#E0E7FF] border-[#E0E7FF] text-[#2952E3]",
                        status === 'active' && "bg-[#2952E3] border-[#2952E3] text-white shadow-md",
                        status === 'upcoming' && "bg-white border-gray-200 text-gray-400"
                    )}
                >
                    {status === 'done' ? <Check className="w-4 h-4" /> : null}
                    {status !== 'done' && (
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'active' ? "bg-white" : "bg-gray-300"
                        )} />
                    )}
                </div>

                {/* Label */}
                <span
                    className={cn(
                        "font-manrope text-base font-medium",
                        status === 'done' && "text-gray-400",
                        status === 'active' && "text-[#111] font-bold",
                        status === 'upcoming' && "text-gray-300"
                    )}
                >
                    {label}
                </span>
            </div>

            {/* Connecting Line */}
            {!isLast && (
                <div className={cn(
                    "w-[1px] h-8 ml-4 my-1",
                    status === 'done' ? "bg-[#E0E7FF]" : "bg-gray-100"
                )} />
            )}
        </div>
    );
}

export default function FilingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#FAF9F6]">
            {/* --- LEFT SIDEBAR (FIXED) --- */}
            <aside className="hidden md:block w-80 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-20">
                <div className="p-8 h-full flex flex-col">
                    {/* Logo / Brand */}
                    <div className="mb-12 font-manrope font-bold text-xl tracking-tight text-[#111]">
                        VSF Portal
                    </div>

                    {/* Stepper */}
                    <div className="space-y-0.5">
                        {/* 
                User Prompt Spec: 
                Profile (Done) -> Identity (Done) -> Upload (Done*) -> Review (Active) -> Payment 
                *User said 'Upload (Active)' in prompt description but 'Review Page' is the content. 
                I set Review to Active for logical consistency with the page content.
             */}
                        <StepperItem label="Profile" status="done" />
                        <StepperItem label="Identity" status="done" />
                        <StepperItem label="Upload" status="done" />
                        <StepperItem label="Review" status="active" />
                        <StepperItem label="Payment" status="upcoming" isLast />
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                ?
                            </div>
                            <span className="text-sm font-medium text-gray-500">Need help?</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- RIGHT CONTENT (SCROLLABLE) --- */}
            <main className="flex-1 md:ml-80 relative flex flex-col min-h-screen">
                {children}
            </main>
        </div>
    );
}
