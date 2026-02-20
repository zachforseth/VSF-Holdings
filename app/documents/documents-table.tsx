'use client'

import { FileText, Download, Eye } from 'lucide-react'
import { getSignedDocumentUrl } from '@/app/actions/document-actions'
import { useEffect } from 'react'
import { toast } from 'sonner'
import DocumentThumbnail from './document-thumbnail'

interface Document {
    id: string
    file_name: string
    file_path: string
    created_at: string
    profile_id: string
}

interface Profile {
    id: string
    first_name: string
}

interface DocumentsTableProps {
    documents: Document[] | null
    profiles: Profile[] | null
    selectedYear?: string
}

export default function DocumentsTable({ documents, profiles, selectedYear }: DocumentsTableProps) {


    return (
        <div className='bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm'>
            {/* DESKTOP TABLE VIEW */}
            <table className='hidden md:table w-full text-left'>
                <thead>
                    <tr className='border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest'>
                        <th className='px-8 py-4'>File Name</th>
                        <th className='px-8 py-4'>Profile</th>
                        <th className='px-8 py-4'>Date Uploaded</th>
                        <th className='px-8 py-4 text-right'>Action</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                    {documents?.map((doc) => (
                        <tr key={doc.id} className='hover:bg-gray-50 transition-colors group'>
                            <td className='px-8 py-6'>
                                <div className='flex items-center gap-4'>
                                    <DocumentThumbnail fileName={doc.file_name} filePath={doc.file_path} />
                                    <span className='font-bold text-gray-900'>{doc.file_name}</span>
                                </div>
                            </td>
                            <td className='px-8 py-6 text-sm text-gray-500 font-medium'>
                                {profiles?.find(p => p.id === doc.profile_id)?.first_name}
                            </td>
                            <td className='px-8 py-6 text-sm text-gray-400 font-medium'>
                                {new Date(doc.created_at).toLocaleDateString()}
                            </td>
                            <td className='px-8 py-6 text-right'>
                                <div className='flex items-center justify-end gap-2'>
                                    {/* View Button */}
                                    <button
                                        onClick={async () => {
                                            const url = await getSignedDocumentUrl(doc.file_path)
                                            if (url) window.open(url, '_blank')
                                            else alert('Could not retrieve document URL.')
                                        }}
                                        className='p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50'
                                        title="View"
                                    >
                                        <Eye className='w-5 h-5' />
                                    </button>

                                    {/* Download Button (Keep existing) */}
                                    <button className='p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50' title="Download">
                                        <Download className='w-5 h-5' />
                                    </button>

                                    {/* Delete Button (Removed) */}
                                    {/* <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this document?')) {
                                                await deleteDocument(doc.id, doc.file_path)
                                            }
                                        }}
                                        className='p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50'
                                        title="Delete"
                                    >
                                        <Trash2 className='w-5 h-5' />
                                    </button> */}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!documents || documents.length === 0) && (
                        <tr>
                            <td colSpan={4} className='px-8 py-20 text-center'>
                                <div className='flex flex-col items-center gap-4'>
                                    <p className='text-gray-400 italic'>No documents found for this selection.</p>
                                    {selectedYear && selectedYear !== '2025' && (
                                        <a href="?year=2025" className='text-blue-600 hover:text-blue-700 font-medium text-sm'>
                                            Switch back to 2025
                                        </a>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* MOBILE LIST VIEW */}
            <div className='block md:hidden divide-y divide-gray-100'>
                {documents?.map((doc) => (
                    <div key={doc.id} className='p-5 space-y-4 hover:bg-gray-50 transition-colors'>
                        {/* File Name & Thumbnail */}
                        <div className='flex items-start gap-4'>
                            <div className='mt-1'>
                                <DocumentThumbnail fileName={doc.file_name} filePath={doc.file_path} />
                            </div>
                            <span className='font-bold text-gray-900 text-sm break-words flex-1 leading-snug'>
                                {doc.file_name}
                            </span>
                        </div>

                        {/* Meta Detail Row */}
                        <div className='flex items-center justify-between text-xs'>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-400 font-medium uppercase tracking-wider text-[10px]'>Profile</span>
                                <span className='text-gray-600 font-medium'>
                                    {profiles?.find(p => p.id === doc.profile_id)?.first_name}
                                </span>
                            </div>
                            <div className='flex flex-col gap-1 text-right'>
                                <span className='text-gray-400 font-medium uppercase tracking-wider text-[10px]'>Date</span>
                                <span className='text-gray-600 font-medium'>
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-50'>
                            <button
                                onClick={async () => {
                                    const url = await getSignedDocumentUrl(doc.file_path)
                                    if (url) window.open(url, '_blank')
                                    else alert('Could not retrieve document URL.')
                                }}
                                className='flex items-center justify-center py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded-xl text-xs font-bold w-full'
                            >
                                <Eye className='w-4 h-4 mr-2' /> View
                            </button>
                            <button className='flex items-center justify-center p-2.5 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-xl'>
                                <Download className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                ))}
                {(!documents || documents.length === 0) && (
                    <div className='p-12 text-center text-sm text-gray-400 italic flex flex-col items-center gap-3'>
                        No documents found for this selection.
                        {selectedYear && selectedYear !== '2025' && (
                            <a href="?year=2025" className='text-blue-600 hover:text-blue-700 font-medium not-italic'>
                                Switch back to 2025
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
