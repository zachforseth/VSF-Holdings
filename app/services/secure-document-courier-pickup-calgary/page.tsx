import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
    title: "Secure Document Courier Pickup Calgary | VSF Capital",
    description: "Don't want to upload? Benefit from our Secure Document Courier Pickup in Calgary for a $50 flat fee. Powered by the VSF Clarity Engine™."
};

export default function CourierPickupPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <section className="w-full bg-[#2952E3] pt-12 pb-16 lg:py-24">
                <div className="max-w-[1154px] mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-white/90 mb-4">
                        Calgary Local Service
                    </h2>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white font-manrope">
                        Secure Document Courier Pickup Calgary
                        <br />
                        <span className="text-2xl font-light mt-4 block opacity-90">Powered by the VSF Clarity Engine™</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mt-6">
                        We know that organizing years of physical tax documents can be stressful. Let our secure courier service come to you, collect your files, and safely transport them to our West Tower, Bankers Hall office.
                    </p>
                    <div className="pt-8">
                        <div className="inline-flex flex-col items-center">
                            <span className="text-white text-5xl font-bold font-manrope mb-2">$50</span>
                            <span className="text-white/80 uppercase tracking-widest text-sm font-semibold">Flat Fee Calgary Wide</span>
                        </div>
                    </div>
                    <div className="pt-8 w-full max-w-sm">
                        <Link href="/get-started" className="w-full">
                            <Button size="lg" className="w-full rounded-full px-8 py-7 text-lg font-semibold bg-white text-[#2952E3] hover:bg-white/90">
                                Schedule a Pickup
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-[800px] mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[#111] font-manrope mb-12 text-center">
                        Why choose our secure courier?
                    </h2>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">Chain of Custody Guarantee</h3>
                                <p className="text-gray-600 mt-2">Your documents are tracked and secured from the moment they leave your hands until they reach our secure scanning facility.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">Direct to Bankers Hall</h3>
                                <p className="text-gray-600 mt-2">We process all local Calgary pickups directly at our West Tower, Bankers Hall location for maximum security.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <Check className="w-6 h-6 text-[#2952E3]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#111]">AI-Verified Digitization</h3>
                                <p className="text-gray-600 mt-2">Once received, your files are digitized using the highly advanced VSF Clarity Engine™ for flawless accuracy.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
