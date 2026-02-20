import { Upload } from "lucide-react";

export default function PlusUploadPage() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Plus</span>
                <h1 className="text-3xl font-bold text-[#111] font-manrope">Document Upload</h1>
            </div>
            <p className="text-gray-500 mb-10 text-lg">
                Upload up to 5 documents, including investment slips and business expenses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((slot) => (
                    <div key={slot} className="bg-white rounded-xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-[240px] hover:border-green-500 hover:bg-green-50/10 transition group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg text-[#111] mb-1">File {slot}</h3>
                        <p className="text-sm text-gray-400">Click to upload</p>
                    </div>
                ))}
            </div>

        </div>
    );
}
