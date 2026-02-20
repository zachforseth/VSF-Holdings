'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { getSignedDocumentUrl } from '@/app/actions/document-actions'

interface DocumentThumbnailProps {
    fileName: string
    filePath: string
}

export default function DocumentThumbnail({ fileName, filePath }: DocumentThumbnailProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
    const isPdf = /\.pdf$/i.test(fileName)
    const canPreview = isImage || isPdf

    useEffect(() => {
        let mounted = true

        async function fetchPreview() {
            if (!canPreview) {
                setLoading(false)
                return
            }

            try {
                const url = await getSignedDocumentUrl(filePath)
                if (mounted && url) {
                    setImageUrl(url)
                }
            } catch (error) {
                console.error('Thumbnail error:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchPreview()

        return () => { mounted = false }
    }, [filePath, canPreview])

    if (!canPreview || !imageUrl) {
        return (
            <div className='h-10 w-10 bg-blue-50 text-[#635BFF] rounded-lg flex items-center justify-center shrink-0'>
                <FileText className='w-5 h-5' />
            </div>
        )
    }

    return (
        <div className='h-10 w-10 rounded-lg shrink-0 overflow-hidden bg-gray-100 relative group'>
            {loading && (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                    <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                </div>
            )}

            {isImage && (
                <img
                    src={imageUrl}
                    alt={fileName}
                    className='h-full w-full object-cover'
                    onError={() => setImageUrl(null)} // Fallback on error
                />
            )}

            {isPdf && (
                <div className='w-full h-full bg-white relative'>
                    {/* Overlay to block interaction but allow clicking row */}
                    <div className="absolute inset-0 z-10 bg-transparent" />
                    <iframe
                        src={`${imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                        className="w-full h-full border-0 pointer-events-none scale-[2.0] origin-top-left opacity-80"
                        title={`Preview of ${fileName}`}
                        tabIndex={-1}
                    />
                </div>
            )}
        </div>
    )
}
