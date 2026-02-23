'use client'

import { useState, useCallback, useEffect } from 'react'
import { UploadCloud, FileText, X, ShieldCheck, CheckCircle2, Loader2, Trash2, ArrowRight } from 'lucide-react'
import { uploadTaxDocuments, deleteDocument, getDocuments } from '@/app/actions/document-actions'
import { useRouter } from 'next/navigation'

interface DocumentsClientProps {
    profileId: string
    initialIntakeData: any
    initialDocuments: any[]
}

export default function DocumentsClient({
    profileId,
    initialIntakeData,
    initialDocuments
}: DocumentsClientProps) {
    const [isDragging, setIsDragging] = useState(false)

    // State for files waiting to be uploaded
    const [newFiles, setNewFiles] = useState<File[]>([])

    // State for files already in database (Sync with Prop)
    const [existingFiles, setExistingFiles] = useState<any[]>(initialDocuments)

    const [isUploading, setIsUploading] = useState(false)
    // No longer loading on mount since we have data
    const [isLoadingDocs, setIsLoadingDocs] = useState(false)

    const router = useRouter()

    // Intake Data (Sync with Prop)
    const [intakeData, setIntakeData] = useState<any>(initialIntakeData)

    // Sync Props to State (Crucial for revalidatePath to update UI)
    useEffect(() => {
        setExistingFiles(initialDocuments)
    }, [initialDocuments])

    useEffect(() => {
        setIntakeData(initialIntakeData)
    }, [initialIntakeData])

    // --- DRAG & DROP HANDLERS ---
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processNewFiles(Array.from(e.dataTransfer.files))
        }
    }, [existingFiles, newFiles])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processNewFiles(Array.from(e.target.files))
        }
    }

    // DEDUPLICATION LOGIC
    const processNewFiles = (incomingFiles: File[]) => {
        const uniqueFiles = incomingFiles.filter(file => {
            // Check against existing DB files
            const existsInDB = existingFiles.some(
                dbFile => dbFile.file_name === file.name // Could add check by size if we had it stored
            );
            // Check against currently staged files
            const existsInStaging = newFiles.some(
                staged => staged.name === file.name && staged.size === file.size
            );

            return !existsInDB && !existsInStaging;
        });

        if (uniqueFiles.length < incomingFiles.length) {
            alert(`Skipped ${incomingFiles.length - uniqueFiles.length} duplicate files.`);
        }

        if (uniqueFiles.length > 0) {
            setNewFiles(prev => [...prev, ...uniqueFiles]);
        }
    }

    const removeNewFile = (index: number) => {
        setNewFiles(newFiles.filter((_, i) => i !== index))
    }

    // --- MODAL STATE ---
    const [fileToDelete, setFileToDelete] = useState<{ id: string, path: string, name: string } | null>(null);

    // ACTIVE DELETION (DB) - Trigger Modal
    const removeExistingFile = (docId: string, filePath: string, fileName: string) => {
        setFileToDelete({ id: docId, path: filePath, name: fileName });
    }

    // Confirm Deletion Logic
    const confirmDelete = async () => {
        if (!fileToDelete) return;

        // Optimistic UI update
        const previousDocs = [...existingFiles];
        setExistingFiles(prev => prev.filter(d => d.id !== fileToDelete.id));

        const prevTarget = fileToDelete;
        setFileToDelete(null); // Close modal

        const result = await deleteDocument(prevTarget.id, prevTarget.path);

        if (!result.success) {
            alert("Failed to delete document.");
            setExistingFiles(previousDocs); // Revert
        }
    }

    // --- UPLOAD SUBMISSION ---
    const handleUpload = async () => {
        // If no new files, just proceed to processing/review
        if (newFiles.length === 0 && existingFiles.length > 0) {
            router.push(`/filing/intake/processing?profileId=${profileId}`)
            return;
        }

        if (newFiles.length === 0 || !profileId) return
        setIsUploading(true)

        const formData = new FormData()
        formData.append('profileId', profileId)
        newFiles.forEach((file) => formData.append('files', file))

        const result = await uploadTaxDocuments(formData)

        if (result.success) {
            // Re-fetch explicitly to update client state immediately (Hybrid approach)
            const docs = await getDocuments(profileId);
            setExistingFiles(docs);

            setNewFiles([]); // Clear staging
            setIsUploading(false);

            router.push(`/filing/intake/processing?profileId=${profileId}`)
        } else {
            setIsUploading(false)
            alert('Upload failed. Please try again.')
        }
    }

    if (!profileId) return <div>Loading...</div>
    if (isLoadingDocs) return <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin w-8 h-8 text-[#635BFF]" /> Loading your workspace...</div>

    return (
        <div className='max-w-4xl relative'>

            {/* DELETE MODAL */}
            {fileToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-red-50 rounded-full text-red-500">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Document?</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Are you sure you want to delete <span className="font-semibold text-gray-700">"{fileToDelete.name}"</span>?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <button
                                    onClick={() => setFileToDelete(null)}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className='mb-10'>
                <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                    Upload your documents
                </h1>
                <p className='mt-2 text-gray-500 text-lg'>
                    Based on your answers, here is what we need from you.
                </p>
                {/* CONDITIONAL REMINDERS */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {/* Always Needed */}
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-tight shadow-sm">
                        T4 Slips / ID
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-tight shadow-sm">
                        Notice of Assessment from the prior year
                    </div>

                    {/* Conditional Tags based on Boolean checks */}
                    {intakeData?.has_t4 === 'true' && <Tag label="T4 Slip(s)" />}
                    {intakeData?.has_t4a === 'true' && <Tag label="T4A Slip(s) (Pension/Annuity)" />}
                    {intakeData?.has_t5007 === 'true' && <Tag label="T5007 Slip(s) (Workers Comp)" />}
                    {intakeData?.has_t4e === 'true' && <Tag label="T4E Slip(s) (EI)" />}
                    {intakeData?.has_tuition === 'on' && <Tag label="T2202 Slip (Tuition)" />}
                    {intakeData?.has_t3 === 'true' && <Tag label="T3 Slip(s) (Trusts)" />}
                    {intakeData?.has_t5 === 'true' && <Tag label="T5 Slip(s) (Investments)" />}

                    {(intakeData?.capital_gains === 'true' || intakeData?.capital_gains === 'yes' || intakeData?.capital_gains === true) && (
                        <Tag label="Capital Gains Reports (Crypto/Stock)" />
                    )}
                    {(intakeData?.foreign_property === 'true' || intakeData?.foreign_property === true) && (
                        <Tag label="Foreign Asset Declarations (T1135 Info)" />
                    )}
                    {(intakeData?.self_employed === 'on' || intakeData?.self_employed === 'yes' || intakeData?.self_employed === true) && (
                        <Tag label="Business Income & Expense Summary" />
                    )}
                    {(intakeData?.rental_income === 'on' || intakeData?.rental_income === 'yes' || intakeData?.rental_income === true) && (
                        <Tag label="Rental Income & Expense Summary" />
                    )}

                    {intakeData?.disability_credit === 'true' && <Tag label="T2201 Disability Certificate" />}
                    {intakeData?.moving_expenses === 'true' && <Tag label="Moving Expense Receipts" />}
                    {intakeData?.medical_expenses === 'true' && <Tag label="Medical Expense Receipts" />}
                    {intakeData?.charitable_donations === 'true' && <Tag label="Charitable Donation Receipts" />}
                    {intakeData?.support_payments === 'true' && <Tag label="Support Payment Records" />}
                </div>
            </div>

            {/* 1. THE DROP ZONE */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-[#635BFF] bg-blue-50/50 scale-[1.02]' : 'border-gray-200 hover:border-gray-300 bg-white'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input
                    type='file'
                    multiple
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    onChange={handleFileInput}
                    disabled={isUploading}
                />

                <div className='flex flex-col items-center justify-center space-y-4 pointer-events-none'>
                    <div className={`p-5 rounded-full ${isDragging ? 'bg-[#635BFF]/10 text-[#635BFF]' : 'bg-gray-50 text-gray-400'}`}>
                        {isUploading ? <Loader2 className='w-10 h-10 animate-spin text-[#635BFF]' /> : <UploadCloud className='w-10 h-10' />}
                    </div>
                    <div>
                        <p className='text-xl font-bold text-gray-900'>
                            {isUploading ? 'Uploading Documents...' : 'Click or drag files to upload'}
                        </p>
                        <p className='text-sm text-gray-500 mt-2'>
                            PDF, JPG, PNG, Excel supported
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. PERSISTENT GALLERY (EXISTING FILES) */}
            {existingFiles.length > 0 && (
                <div className='mt-12 space-y-4'>
                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                        <CheckCircle2 className='w-3 h-3 text-green-500' /> Uploaded Documents ({existingFiles.length})
                    </h3>
                    <div className='grid grid-cols-1 gap-3'>
                        {existingFiles.map((file) => (
                            <div key={file.id} className='flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-colors'>
                                <div className='flex items-center gap-4'>
                                    <div className='h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600'>
                                        <FileText className='w-5 h-5' />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-gray-700 truncate'>{file.file_name}</p>
                                        <p className='text-[10px] text-gray-400 font-medium uppercase'>Received {new Date(file.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeExistingFile(file.id, file.file_path, file.file_name)}
                                    className='p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all'
                                    disabled={isUploading}
                                >
                                    <Trash2 className='w-5 h-5' />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. STAGING AREA (NEW FILES) */}
            {newFiles.length > 0 && (
                <div className='mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-[10px] font-bold text-[#635BFF] uppercase tracking-widest'>
                            Queue for Analysis ({newFiles.length})
                        </h3>
                        {/* Clear All New Files */}
                        {!isUploading && (
                            <button
                                onClick={() => setNewFiles([])}
                                className='text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-tight'
                            >
                                Clear Queue
                            </button>
                        )}
                    </div>

                    <div className='grid grid-cols-1 gap-3'>
                        {newFiles.map((file, i) => (
                            <div key={i} className='flex items-center justify-between p-4 bg-[#F8F9FF] border-2 border-[#635BFF]/10 rounded-2xl'>
                                <div className='flex items-center gap-4'>
                                    <div className='h-10 w-10 bg-white rounded-xl flex items-center justify-center text-[#635BFF] shadow-sm'>
                                        <FileText className='w-5 h-5' />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-gray-900 truncate'>{file.name}</p>
                                        <p className='text-[10px] text-[#635BFF] font-bold uppercase'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={() => removeNewFile(i)}
                                        className='p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all'
                                    >
                                        <X className='w-5 h-5' />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. FOOTER ACTIONS */}
            <div className='mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-8'>
                <div className='flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
                    <ShieldCheck className='w-4 h-4 text-green-600' />
                    <span>Secure End-to-End Encryption</span>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={isUploading || (newFiles.length === 0 && existingFiles.length === 0)}
                    className={`
                bg-blue-600 text-white text-base font-bold py-4 px-10 rounded-full shadow-lg transition-all flex items-center gap-3
                ${isUploading || (newFiles.length === 0 && existingFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95'}
              `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <span>{newFiles.length > 0 ? "Save & Continue" : "Continue"}</span>
                            <ArrowRight className='w-5 h-5' />
                        </>
                    )}
                </button>
            </div>

        </div>
    )
}

function Tag({ label }: { label: string }) {
    return (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            {label}
        </div>
    )
}
