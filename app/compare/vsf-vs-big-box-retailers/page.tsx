import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, X } from "lucide-react";

export const metadata = {
    title: "VSF vs. Big Box Retailers | Tax Preparation Comparison",
    description: "Compare VSF Capital Structuring to standard Big Box Retailers. High-end advisory powered by the VSF Clarity Engine™ vs transactional tax prep."
};

export default function ComparePage() {
    return (
        <div className="flex flex-col min-h-screen bg-white font-manrope">
            <section className="w-full bg-[#2952E3] pt-12 pb-16 lg:py-24">
                <div className="max-w-[1154px] mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-white/90 mb-4">
                        Why We're Different
                    </h2>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
                        VSF vs. Big Box Retailers
                        <br />
                        <span className="text-2xl font-light mt-4 block opacity-90">A new standard powered by the VSF Clarity Engine™</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mt-4">
                        We don't do assembly-line tax preparation. We believe that whether you're a student or a multi-entity corporation, you deserve professional advisory, secure data, and absolute accuracy.
                    </p>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-[1000px] mx-auto px-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b-2 border-gray-100 font-bold text-xl text-gray-900 w-1/3">Feature</th>
                                    <th className="p-4 border-b-2 border-gray-100 font-bold text-xl text-[#2952E3] w-1/3">VSF Capital Structuring</th>
                                    <th className="p-4 border-b-2 border-gray-100 font-bold text-xl text-gray-500 w-1/3">Big Box Retailers</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-50">
                                    <td className="p-4 font-bold text-gray-800">Review Process</td>
                                    <td className="p-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            VSF Clarity Engine™ + CPA Review
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            Seasonal Employee Review
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-50">
                                    <td className="p-4 font-bold text-gray-800">Support Network</td>
                                    <td className="p-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <Link href="https://jdcwest.com" target="_blank" className="underline text-blue-600">JDC West</Link> & <Link href="https://www.huumans.com" target="_blank" className="underline text-blue-600">Huumans</Link> Partnerships
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            Franchise Local Help
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-50">
                                    <td className="p-4 font-bold text-gray-800">Security</td>
                                    <td className="p-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Bank-grade encryption & West Tower HQ
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            Strip Mall WiFi
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/get-started">
                            <Button size="lg" className="rounded-full px-8 py-7 text-lg font-semibold bg-[#2952E3] text-white hover:bg-blue-700">
                                Experience the Difference
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
