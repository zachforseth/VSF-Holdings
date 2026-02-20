'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { getClientFinalReturnUrl } from '@/app/actions/filing-actions'

export default function DownloadReturnButton({ profileId, fileName }: { profileId: string, fileName: string }) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        const url = await getClientFinalReturnUrl(profileId)
        setIsDownloading(false)

        if (url) {
            // Create a temporary link to force the browser download
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            alert('Document is not available for download at this time.')
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all disabled:opacity-50"
            title="Download PDF"
        >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        </button>
    )
}
