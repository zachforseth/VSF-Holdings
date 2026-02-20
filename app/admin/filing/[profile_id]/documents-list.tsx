"use client"

import { useState, useRef } from 'react'
import { FileText, Download, X, Eye, ExternalLink, UploadCloud, CheckCircle2 } from 'lucide-react'
import { getDocumentUrl, adminUploadClientDocument } from '@/app/actions/admin-actions'

interface Document {
    id: string
    file_name: string
    file_type: string
    file_path: string
    created_at: string
}

interface DocumentsListProps {
    documents: Document[];
    userId: string;
    profileId: string;
    finalReturnPath?: string | null;
}

export default function DocumentsList({ documents, userId, profileId, finalReturnPath }: DocumentsListProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewType, setPreviewType] = useState<string>('')
    const [previewName, setPreviewName] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showDropZone, setShowDropZone] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [skipAI, setSkipAI] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFilesAdded = (files: FileList | File[]) => {
        setPendingFiles(prev => [...prev, ...Array.from(files)])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const removePendingFile = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
    }

    const processPendingFiles = async () => {
        if (pendingFiles.length === 0) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('profileId', profileId)
        formData.append('skipAI', skipAI.toString())
        pendingFiles.forEach(file => {
            formData.append('files', file)
        })

        const res = await adminUploadClientDocument(formData)
        setIsUploading(false)
        if (res.success) {
            setPendingFiles([])
            setShowDropZone(false)
        } else {
            alert('Upload failed: ' + res.error)
        }
    }

    const handleUploadSource = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        handleFilesAdded(e.target.files)
    }

    const handleViewDocument = async (doc: Document) => {
        setIsLoading(true)
        const { success, url, error } = await getDocumentUrl(userId, doc.file_path)
        setIsLoading(false)

        if (success && url) {
            setPreviewUrl(url)
            setPreviewType(doc.file_type)
            setPreviewName(doc.file_name)
        } else {
            alert('Failed to load document: ' + error)
        }
    }

    const handleDownload = async (e: React.MouseEvent, doc: Document) => {
        e.stopPropagation()
        const { success, url, error } = await getDocumentUrl(userId, doc.file_path)
        if (success && url) {
            // Force download by creating a temporary link
            const link = document.createElement('a')
            link.href = url
            link.download = doc.file_name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            alert('Failed to download: ' + error)
        }
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-md font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        Documents ({documents?.length || 0}) / AI Analysis
                    </h2>

                    <button
                        onClick={() => setShowDropZone(!showDropZone)}
                        disabled={isUploading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${showDropZone ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-200'} hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors border disabled:opacity-50`}
                    >
                        {isUploading ? <span className="animate-pulse">Uploading...</span> : <><UploadCloud className="w-3.5 h-3.5" /> {showDropZone ? 'Cancel' : 'Upload'}</>}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleUploadSource} className="hidden" multiple accept=".pdf,image/*" />
                </div>

                <div className="space-y-3">
                    {showDropZone && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Persistent Drop Zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files) }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed border-gray-300 rounded-2xl text-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer ${(!documents || documents.length === 0) && pendingFiles.length === 0 ? 'p-12' : 'p-6'}`}
                            >
                                <UploadCloud className={`${(!documents || documents.length === 0) && pendingFiles.length === 0 ? 'w-10 h-10' : 'w-6 h-6'} text-gray-400 mx-auto mb-2`} />
                                <h3 className="text-sm font-bold text-gray-900">Upload Documents</h3>
                                <p className="text-xs text-gray-500 mt-1">Drag and drop files here or click to browse</p>
                            </div>

                            {pendingFiles.length > 0 && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-3 flex items-center justify-between">
                                        Ready to Upload ({pendingFiles.length})
                                        <button onClick={() => setPendingFiles([])} className="text-blue-500 hover:text-blue-700 text-xs font-medium normal-case">Clear All</button>
                                    </h3>
                                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                        {pendingFiles.map((file, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-blue-50 text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <span className="truncate text-gray-700">{file.name}</span>
                                                </div>
                                                <button onClick={(e) => removePendingFile(e, i)} className="text-gray-400 hover:text-red-500 p-1">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 items-center mb-4 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="skipAI"
                                            checked={skipAI}
                                            onChange={(e) => setSkipAI(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="skipAI" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            Skip AI Analysis (Just upload document to storage, do not change tier/price)
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 py-2 bg-white border border-blue-200 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            + Add More
                                        </button>
                                        <button
                                            onClick={processPendingFiles}
                                            disabled={isUploading}
                                            className="flex-[2] py-2 bg-blue-600 border border-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                                        >
                                            {isUploading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : (skipAI ? 'Upload Document Only' : 'Run AI Analysis & Upload')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {documents && documents.length > 0 && (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => handleViewDocument(doc)}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs uppercase shadow-sm">
                                        {doc.file_type?.includes('image') ? 'IMG' : 'PDF'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate" title={doc.file_name}>
                                            {doc.file_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDownload(e, doc)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-100 rounded-full"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4" />
                                {previewName}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            {previewType.includes('image') ? (
                                <img
                                    src={previewUrl}
                                    alt="Document Preview"
                                    className="max-w-full max-h-full object-contain shadow-lg"
                                />
                            ) : (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full"
                                    title="Document Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
