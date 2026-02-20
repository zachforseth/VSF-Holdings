import { Upload } from "lucide-react";

export default function EssentialUploadPage() {
    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-[#111] mb-2 font-manrope">Essential Plan</h1>
            <p className="text-gray-500 mb-10 text-lg">
                Please upload your primary T4 and one supporting receipt.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {/* Slot 1: Primary T4 */}
                <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-[300px] hover:border-[#2952E3] hover:bg-blue-50/10 transition group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Upload className="w-8 h-8 text-[#2952E3]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#111] mb-2">Upload T4</h3>
                    <p className="text-sm text-gray-400">Primary Tax Document</p>
                </div>

                {/* Slot 2: Supporting Receipt */}
                <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-[300px] hover:border-[#2952E3] hover:bg-blue-50/10 transition group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Upload className="w-8 h-8 text-[#2952E3]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#111] mb-2">Supporting Receipt</h3>
                    <p className="text-sm text-gray-400">One additional file</p>
                </div>
            </div>

        </div>
    );
}
