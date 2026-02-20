import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import FAQBusiness from "@/components/faq-business";
import { Check } from "lucide-react";

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function BusinessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="w-full bg-[#2952E3] pt-12 pb-16 lg:py-24">
                <div className="max-w-[1154px] mx-auto px-4 flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-[59px]">
                    {/* Left: Text */}
                    <div className="w-full xl:w-1/2 flex flex-col space-y-6">
                        <h2 className="text-sm font-medium uppercase tracking-wide text-white/90">
                            Strategic Business Solutions.
                        </h2>
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white font-manrope">
                            The corporate tax partner your team actually wants
                        </h1>
                        <p className="text-lg text-white/90 max-w-lg">
                            We’ve changed the way Canadians do personal tax. Now we’re doing the same for corporate tax filing and business returns, too.
                        </p>
                        <div className="pt-6">
                            <Link href="/book-consultation">
                                <Button size="lg" className="rounded-full px-8 py-7 text-lg font-semibold bg-white text-[#2952E3] hover:bg-white/90 transition-all shadow-md">
                                    Meet with our team
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* Right: Image Component */}
                    <div className="w-full xl:w-1/2 flex justify-end">
                        <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-transparent flex items-center justify-center p-0">
                            <Image
                                src="/images/business-hero-dashboard.png"
                                alt="VSF Corporate Dashboard"
                                fill
                                className="object-cover object-center scale-110"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="w-full bg-white py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold font-manrope text-[#111]">
                            Get the VSF experience for your business
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        <div>
                            <h3 className="text-xl font-bold text-[#111] mb-3">Fully transparent</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                Honest, hourly pricing with zero hidden fees. We provide clear, itemized invoices so you only pay for the exact corporate tax expertise your business actually uses.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#111] mb-3">Strategic planning</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                Our CPAs don&apos;t just file your paperwork; they build optimized corporate structures designed to reduce your overall tax burden throughout the entire fiscal year.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#111] mb-3">Effortless automation</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                Our technology integrates directly with your existing bookkeeping software, delivering efficient administration and a seamless year-end filing experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL BLOCK */}
            <section className="w-full bg-[#FAF9F6] py-24 shrink-0">
                <div className="max-w-[800px] mx-auto px-6 text-center flex flex-col items-center">
                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">What our clients are saying</p>
                    <h2 className="text-3xl lg:text-5xl font-medium font-manrope text-[#111] leading-tight mb-8">
                        "Switching our corporate taxes to VSF was the best financial decision we made this year. Fast, transparent, and significantly less stressful than our previous firm."
                    </h2>
                    <div className="flex flex-col items-center justify-center">
                        <p className="font-bold text-[#111]">Eason Serreo</p>
                        <p className="text-sm text-gray-500 mt-1">CEO of Moosetracks Framing LTD.</p>
                    </div>
                </div>
            </section>

            {/* INTEGRATIONS SECTION - SPLIT LAYOUT */}
            <section className="w-full bg-[#FAF9F6] py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Left: Image Card */}
                        <div className="w-full lg:w-1/2">
                            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-sm">
                                <Image
                                    src="/images/business-hero-dashboard.png" // Placeholder image
                                    alt="VSF Integrations Dashboard"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Right: Text content */}
                        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center">
                            <h2 className="text-3xl lg:text-4xl font-bold font-manrope text-[#111] mb-12">
                                Save time with<br />easy integrations
                            </h2>

                            <div className="space-y-10 mb-12">
                                <div>
                                    <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Seamless and secure</h3>
                                    <p className="text-lg text-gray-600 font-light leading-relaxed">
                                        We fit right into most current accounting systems to streamline your reporting process, while keeping your financial data fully secured and up to date.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Supports your major platforms</h3>
                                    <p className="text-lg text-gray-600 font-light leading-relaxed">
                                        We offer integrations with QuickBooks, Xero, Stripe, Shopify, Square, and more.
                                    </p>
                                </div>
                            </div>

                            <Link href="/business/integrations">
                                <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-gray-300 hover:bg-gray-50 text-[#111] transition-colors">
                                    Learn more
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <FAQBusiness />

            {/* FINAL CTA SECTION */}
            <section className="w-full bg-[#FAF9F6] py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8">
                    <div className="text-center flex flex-col items-center">
                        <h2 className="text-3xl lg:text-5xl font-bold font-manrope text-[#111] mb-6 leading-tight">
                            Set your business up for financial success
                        </h2>
                        <p className="text-lg text-gray-500 mb-10 font-light max-w-2xl mx-auto">
                            Share a few details about your company structure and revenue, and we&apos;ll match you with the exact service package you need. Have a complex corporate structure? Someone from our senior team would love to talk to you directly to evaluate your needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/book-consultation">
                                <Button className="rounded-full px-10 py-7 text-lg font-bold bg-[#2952E3] text-white hover:bg-blue-700 shadow-sm transition-colors">
                                    Meet with our team
                                </Button>
                            </Link>
                            <Link href="/book-consultation">
                                <Button variant="outline" className="rounded-full px-10 py-7 text-lg font-bold border-gray-300 text-[#111] hover:bg-gray-50 transition-colors bg-white">
                                    Partner with us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
