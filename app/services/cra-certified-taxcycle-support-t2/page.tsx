import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
    title: "CRA-Certified TaxCycle Support for Corporate T2 | VSF Capital",
    description: "Expert CRA-Certified TaxCycle Support for Corporate T2 returns. Experience absolute accuracy powered by the VSF Clarity Engine™."
};

export default function TaxCycleSupportPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <section className="w-full bg-[#2952E3] pt-12 pb-16 lg:py-24">
                <div className="max-w-[1154px] mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-white/90 mb-4">
                        Corporate T2 Tax Services
                    </h2>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white font-manrope">
                        CRA-Certified TaxCycle Support for Corporate T2
                        <br />
                        <span className="text-2xl font-light mt-4 block opacity-90">Powered by the VSF Clarity Engine™</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mt-6">
                        Navigating Canadian corporate taxes requires precision. Our dedicated team utilizes CRA-Certified TaxCycle software enhanced by our proprietary technology to guarantee compliance and maximize your corporate standing.
                    </p>
                    <div className="pt-8 w-full max-w-sm">
                        <Link href="/book-consultation" className="w-full">
                            <Button size="lg" className="w-full rounded-full px-8 py-7 text-lg font-semibold bg-white text-[#2952E3] hover:bg-white/90">
                                Talk to an Expert
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-[800px] mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[#111] font-manrope mb-12 text-center">
                        Why trust us with your Corporate T2?
                    </h2>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">CRA-Certified TaxCycle</h3>
                                <p className="text-gray-600 mt-2">We build exclusively on TaxCycle, the industry standard for professional Canadian tax preparers, to ensure 100% accurate T2 filings.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">VSF Clarity Engine™ Accuracy</h3>
                                <p className="text-gray-600 mt-2">Our internal AI agent reviews all incoming financial documents, validating mapping to GIFI codes long before submission.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">Year-Round Advisory</h3>
                                <p className="text-gray-600 mt-2">More than compliance. We offer rolling support to identify corporate tax planning opportunities throughout your fiscal year.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
