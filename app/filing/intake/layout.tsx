'use client'

import Link from 'next/link'
import { CheckCircle2, FileText, UploadCloud, Search, CreditCard, Check } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const steps = [
        {
            name: 'Identity',
            status: 'complete',
            icon: CheckCircle2
        },
        {
            name: 'Questionnaire',
            status: pathname.includes('/questionnaire') ? 'current' : 'complete',
            icon: FileText
        },
        {
            name: 'Documents',
            status: (pathname.includes('/documents') || pathname.includes('/processing')) ? 'current' : (pathname.includes('/questionnaire') ? 'upcoming' : 'complete'),
            icon: UploadCloud
        },
        {
            name: 'Review',
            status: pathname.includes('/review') ? 'current' : (pathname.includes('/payment') ? 'complete' : 'upcoming'),
            icon: Search
        },
        {
            name: 'Payment',
            status: pathname.includes('/payment') ? 'current' : 'upcoming',
            icon: CreditCard
        },
    ]

    return (
        // H-SCREEN + OVERFLOW-HIDDEN = The Page Body never scrolls.
        <div className='flex flex-col md:flex-row h-screen overflow-hidden bg-white'>

            {/* LEFT COLUMN: Fixed Logo + Nav (Top Bar on Mobile, Sidebar on Desktop) */}
            <aside className='w-full md:w-80 flex-shrink-0 flex flex-col px-5 py-4 md:px-8 md:py-8 h-auto md:h-full relative z-20 bg-white border-b border-gray-100 md:border-b-0'>

                <div className='flex items-center justify-between md:block'>
                    {/* 1. THE LOGO */}
                    <div className='md:mb-12 pl-1'>
                        <div className='flex h-8 w-8 md:h-12 md:w-12' style={{ gap: '6.2%' }}>
                            <div className='h-full bg-[#3b82f6]' style={{ width: '29.15%' }}></div>
                            <div className='h-full bg-[#60a5fa]' style={{ width: '29.15%' }}></div>
                            <div className='h-full bg-[#93c5fd]' style={{ width: '29.15%' }}></div>
                        </div>
                    </div>

                    {/* MOBILE HORIZONTAL PROGRESS BAR */}
                    <div className='flex md:hidden items-center gap-1.5 sm:gap-2 mr-2'>
                        {steps.map((step, stepIdx) => (
                            <div key={step.name} className='flex items-center'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 flex flex-shrink-0 items-center justify-center rounded-full ${step.status === 'complete' ? 'bg-blue-600' : step.status === 'current' ? 'bg-white border-[2px] border-blue-600' : 'bg-white border-[2px] border-gray-200'}`}>
                                    {step.status === 'complete' && <Check className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-white' strokeWidth={3} />}
                                    {step.status === 'current' && <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 rounded-full' />}
                                </div>
                                {stepIdx !== steps.length - 1 && (
                                    <div className={`w-3 sm:w-5 h-[2px] ml-1.5 sm:ml-2 rounded-full ${step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. THE TIMELINE CARD (Desktop Only) */}
                <div className='hidden md:flex bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex-1 max-h-[600px] flex-col'>
                    <h2 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-8'>Your Progress</h2>

                    <nav aria-label='Progress'>
                        <ol role='list' className='overflow-hidden'>
                            {steps.map((step, stepIdx) => (
                                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-10' : ''}`}>

                                    {/* Connector Line */}
                                    {stepIdx !== steps.length - 1 ? (
                                        <div className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                    ) : null}

                                    <div className='relative flex items-center group'>
                                        <span className='h-9 flex items-center'>
                                            {step.status === 'complete' ? (
                                                <span className='relative z-10 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full shadow-sm'>
                                                    <Check className='w-5 h-5 text-white' />
                                                </span>
                                            ) : step.status === 'current' ? (
                                                <span className='relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full shadow-sm'>
                                                    <span className='h-2.5 w-2.5 bg-blue-600 rounded-full' />
                                                </span>
                                            ) : (
                                                <span className='relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full'>
                                                    <div className='h-2.5 w-2.5 rounded-full bg-transparent' />
                                                </span>
                                            )}
                                        </span>
                                        <span className='ml-4 min-w-0 flex flex-col'>
                                            <span className={`text-sm font-bold tracking-tight ${step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {step.name}
                                            </span>
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </aside>

            {/* RIGHT COLUMN: The Scrollable Workspace */}
            <main className='flex-1 h-full overflow-y-auto relative p-5 pb-20 sm:p-8 lg:p-12'>
                <div className='max-w-4xl mx-auto'>
                    {children}
                </div>
            </main>
        </div>
    )
}
