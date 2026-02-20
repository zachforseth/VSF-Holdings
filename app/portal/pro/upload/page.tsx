import { UploadCloud } from "lucide-react";

export default function ProUploadPage() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pro</span>
                <h1 className="text-3xl font-bold text-[#111] font-manrope">Professional Workspace</h1>
            </div>
            <p className="text-gray-500 mb-10 text-lg">
                Drag and drop all corporate and personal files here for your dedicated professional.
            </p>

            {/* Bulk Upload Zone */}
            <div className="w-full bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 md:p-24 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#111] hover:bg-gray-50 transition duration-300">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <UploadCloud className="w-12 h-12 text-[#111]" />
                </div>
                <h3 className="text-2xl font-bold text-[#111] mb-2">Bulk Upload Files</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Drag & drop your files here, or click to browse. Supports PDF, DOCX, XLSX, and images.
                </p>
                <button className="bg-[#111] text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition">
                    Browse Files
                </button>
            </div>

        </div>
    );
}
