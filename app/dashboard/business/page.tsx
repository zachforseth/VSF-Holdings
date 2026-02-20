import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function BusinessTaxPage() {
    return (
        <div className="min-h-screen bg-[#FCFCFC] flex justify-center pt-16 lg:pt-24 px-6 pb-20">
            <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm h-fit">

                {/* Icon */}
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                    Business Tax Services
                </h1>

                {/* Message */}
                <p className="text-gray-500 leading-relaxed mb-8">
                    You currently do not have a business account enabled. To open a business account and begin filing for your corporation, please contact your advisor or call VSF Capital at <span className="text-gray-900 font-medium">(403) 923-0681</span>.
                </p>

                {/* Action Button */}
                <Link
                    href="/dashboard/chat"
                    className="block w-full bg-[#2952E3] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Contact My Advisor
                </Link>

            </div>
        </div>
    )
}
