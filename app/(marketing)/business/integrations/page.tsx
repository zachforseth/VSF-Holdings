import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import FAQIntegrations from "@/components/faq-integrations";

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="w-full bg-[#2952E3] pt-32 pb-24 border-b border-[#2952E3]">
                <div className="max-w-[800px] mx-auto px-6 text-center flex flex-col items-center">
                    <h1 className="text-4xl lg:text-6xl font-bold font-manrope text-white leading-tight mb-8">
                        Satisfyingly simple integration
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        Connect your existing accounting and payroll systems with our platform to make monthly administration smooth and seamless.
                    </p>
                    <Link href="/book-consultation">
                        <Button className="rounded-full px-8 py-6 text-lg font-bold bg-white text-[#2952E3] hover:bg-gray-100 shadow-md transition-colors">
                            Meet with our team
                        </Button>
                    </Link>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="w-full bg-white py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold font-manrope text-[#111] mb-16 border-b border-gray-200 pb-8">
                        Your key to working smarter, not harder
                    </h2>

                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        {/* Left: Text Features */}
                        <div className="w-full lg:w-3/5 flex flex-col space-y-12">
                            <div>
                                <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Easier admin</h3>
                                <p className="text-gray-600 text-lg leading-relaxed font-light">
                                    Turn tedious tasks into effortless processes with automatic data syncing for things like new transactions, salary updates, and monthly close.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Real-time insights</h3>
                                <p className="text-gray-600 text-lg leading-relaxed font-light">
                                    With built-in analytics, your team can access real-time financial metrics without having to manually input numbers — meaning less room for error, too.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Streamlined workflow</h3>
                                <p className="text-gray-600 text-lg leading-relaxed font-light">
                                    Cut out repetitive manual tasks so your team can free up more time to focus on strategic initiatives and the bigger-impact projects that really matter.
                                </p>
                            </div>
                        </div>

                        {/* Right: Stats Grid */}
                        <div className="w-full lg:w-2/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-12 lg:border-l border-gray-100 lg:pl-16">
                            <div className="flex flex-col justify-center">
                                <h4 className="text-5xl font-bold font-manrope text-[#2952E3] mb-2">50%+</h4>
                                <p className="text-gray-600 font-medium">more time saved on admin</p>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h4 className="text-5xl font-bold font-manrope text-[#2952E3] mb-2">95%+</h4>
                                <p className="text-gray-600 font-medium">bookkeeping and payroll systems supported</p>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h4 className="text-5xl font-bold font-manrope text-[#2952E3] mb-2">99%+</h4>
                                <p className="text-gray-600 font-medium">automated filing accuracy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ADAPTABILITY SECTION */}
            <section className="w-full bg-[#FAF9F6] py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold font-manrope text-[#111] mb-16 border-b border-gray-200 pb-8">
                        Built to adapt with your business
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        <div>
                            <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Scale with ease</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                Our bespoke platform and technology is designed to seamlessly add headcount, entities, and new financial structures without adding extra hours of administrative paperwork.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Optimize cashflow</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                Boost your financial runway by utilizing precise burn rates and actionable strategic planning from an advisory team you can trust.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-manrope text-[#111] mb-3">Increase reliability</h3>
                            <p className="text-gray-600 text-lg leading-relaxed font-light">
                                With automated end-of-year reconciliations and streamlined CRA-linked filing, handling business taxes is quick, predictable, and fully compliant.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <FAQIntegrations />

            {/* FINAL CTA SECTION */}
            <section className="w-full bg-[#FAF9F6] py-24 lg:py-32">
                <div className="max-w-[1154px] mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
                    <h2 className="text-3xl lg:text-5xl font-bold font-manrope text-[#111] mb-6 leading-tight">
                        Simplify your workflow
                    </h2>
                    <p className="text-lg text-gray-500 mb-10 font-light max-w-2xl mx-auto">
                        Get in touch with our team to chat about how our integrated ecosystem can streamline your corporate reporting and eliminate manual paperwork.
                    </p>
                    <Link href="/book-consultation">
                        <Button className="rounded-full px-10 py-7 text-lg font-bold bg-[#2952E3] text-white hover:bg-blue-700 shadow-sm transition-colors">
                            Meet with our team
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
