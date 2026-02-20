'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Link2, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface ReviewLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reviewLink: string, file: File | null, refundAmount: number, amountOwing: number) => Promise<void>;
    isSubmitting: boolean;
    initialRefund?: number | null;
    initialOwing?: number | null;
    finalReturnPath?: string | null;
}

export default function ReviewLinkModal({ isOpen, onClose, onSubmit, isSubmitting, initialRefund, initialOwing, finalReturnPath }: ReviewLinkModalProps) {
    const [reviewLink, setReviewLink] = useState('');
    const [resultType, setResultType] = useState<'refund' | 'owing' | 'zero'>('refund');
    const [amount, setAmount] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            const hasRefund = initialRefund && initialRefund > 0;
            const hasOwing = initialOwing && initialOwing > 0;
            setResultType(hasOwing ? 'owing' : hasRefund ? 'refund' : 'zero');
            setAmount(hasOwing ? initialOwing.toString() : hasRefund ? initialRefund.toString() : '');
            setFile(null);
            setReviewLink('');
        }
    }, [isOpen, initialRefund, initialOwing]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalRefund = resultType === 'refund' ? (parseFloat(amount) || 0) : 0;
        const finalOwing = resultType === 'owing' ? (parseFloat(amount) || 0) : 0;
        onSubmit(reviewLink, file, finalRefund, finalOwing);
    };

    const hasFile = !!file || !!finalReturnPath;
    const hasAmounts = resultType === 'zero' || (amount !== '' && parseFloat(amount) >= 0);
    const canSubmit = !isSubmitting && reviewLink.trim() && hasFile && hasAmounts;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Send for Review</h3>
                            <p className="text-sm text-purple-700">Attach final documents and provide review URL.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 1. Review URL */}
                    <div>
                        <label htmlFor="review-link" className="block text-sm font-bold text-gray-700 mb-2">
                            Review URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="review-link"
                            type="url"
                            required
                            value={reviewLink}
                            onChange={(e) => setReviewLink(e.target.value)}
                            placeholder="https://docusign.com/..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>

                    {/* 2. Final Tax Return */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Final Tax Return <span className="text-red-500">*</span>
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-purple-300 bg-purple-50 hover:bg-purple-100' :
                                finalReturnPath ? 'border-green-300 bg-green-50 hover:bg-green-100' :
                                    'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            {file ? (
                                <div className="flex flex-col items-center gap-1 text-purple-700">
                                    <FileText className="w-6 h-6" />
                                    <span className="text-sm font-bold break-all text-center">{file.name}</span>
                                    <span className="text-xs opacity-80">Click to change</span>
                                </div>
                            ) : finalReturnPath ? (
                                <div className="flex flex-col items-center gap-1 text-green-700">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="text-sm font-bold break-all text-center">Already Attached</span>
                                    <span className="text-xs opacity-80">Click to upload a replacement</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-gray-500">
                                    <UploadCloud className="w-6 h-6" />
                                    <span className="text-sm font-bold">Select PDF File</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                                if (e.target.files?.[0]) setFile(e.target.files[0]);
                            }}
                        />
                    </div>

                    {/* 3. Amounts */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">
                            Filing Result <span className="text-red-500">*</span>
                        </label>

                        {/* Segmented Control */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setResultType('refund')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${resultType === 'refund' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Refund
                            </button>
                            <button
                                type="button"
                                onClick={() => setResultType('owing')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${resultType === 'owing' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Balance Owing
                            </button>
                            <button
                                type="button"
                                onClick={() => { setResultType('zero'); setAmount(''); }}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${resultType === 'zero' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Zero Balance
                            </button>
                        </div>

                        {/* Conditional Amount Input */}
                        {resultType !== 'zero' && (
                            <div className="pt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {resultType === 'refund' ? 'Refund Amount' : 'Amount Owing'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="px-5 py-2.5 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Sending...' : 'Send for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
