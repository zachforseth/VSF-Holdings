'use client'

import { Plus, Loader2 } from 'lucide-react'
import { uploadTaxDocuments } from '@/app/actions/document-actions'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadButton({ profileId, profileName }: { profileId: string, profileName: string }) {
    const formRef = useRef<HTMLFormElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [status, setStatus] = useState<'uploading' | 'analyzing'>('uploading')
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            formRef.current?.requestSubmit()
        }
    }

    const handleUploadAction = async (formData: FormData) => {
        setIsUploading(true)
        setStatus('uploading')

        // After 1.5s, switch to "Analyzing" to give that AI feel
        // (Most uploads are fast, processing takes the time)
        const timer = setTimeout(() => {
            setStatus('analyzing')
        }, 1500)

        const result = await uploadTaxDocuments(formData)
        clearTimeout(timer)

        setIsUploading(false)
        if (result.success) {
            router.refresh()
        }
    }

    return (
        <form ref={formRef} action={handleUploadAction}>
            {/* Hidden input to tell the server WHICH profile owns this PDF */}
            <input type="hidden" name="profileId" value={profileId} />
            <input type="hidden" name="profileName" value={profileName} />

            <label className={`cursor-pointer bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all hover:border-gray-300 h-32 w-full group relative overflow-hidden ${isUploading ? 'pointer-events-none' : ''}`}>
                <div className={`absolute inset-0 bg-blue-50 transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                {isUploading ? (
                    <>
                        <Loader2 className='w-6 h-6 text-[#4F62D6] animate-spin relative z-10' />
                        <span className='text-[10px] font-bold text-gray-900 leading-tight relative z-10 uppercase tracking-tight'>
                            {status === 'uploading' ? 'Uploading Documents...' : 'AI is analyzing your files...'}
                        </span>
                    </>
                ) : (
                    <>
                        <Plus className='w-6 h-6 text-gray-900 relative z-10' />
                        <span className='text-xs font-bold text-gray-900 leading-tight relative z-10'>Upload<br />Documents</span>
                    </>
                )}

                <input
                    type="file"
                    name="files"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </label>
        </form>
    )
}
