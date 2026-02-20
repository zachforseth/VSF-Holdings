'use strict';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RequestInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (missingInfo: any) => Promise<void>;
    isSubmitting: boolean;
}

const COMMON_DOCUMENTS = [
    "T4 Slip (Employment Income)",
    "T5 Slip (Investment Income)",
    "T3 Slip (Trust Income)",
    "T4A (Pension/Other Income)",
    "RRSP Contribution Receipt",
    "Charitable Donation Receipt",
    "Medical Expense Receipts",
    "Void Cheque / Direct Deposit Info",
    "Notice of Assessment (Previous Year)",
    "Government ID (Driver's License / Passport)"
];

const COMMON_QUESTIONS = [
    "Current Marital Status",
    "Spouse's Income Info",
    "Dependents Info",
    "Foreign Property > $100k",
    "Sale of Principal Residence"
];

export default function RequestInfoModal({ isOpen, onClose, onSubmit, isSubmitting }: RequestInfoModalProps) {
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [customNote, setCustomNote] = useState('');

    if (!isOpen) return null;

    const toggleDoc = (doc: string) => {
        setSelectedDocs(prev =>
            prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
        );
    };

    const toggleQuestion = (q: string) => {
        setSelectedQuestions(prev =>
            prev.includes(q) ? prev.filter(item => item !== q) : [...prev, q]
        );
    };

    const handleSubmit = () => {
        const missingInfo = {
            documents: selectedDocs,
            questions: selectedQuestions,
            note: customNote
        };
        onSubmit(missingInfo);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-yellow-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Request Missing Information</h3>
                            <p className="text-sm text-yellow-700">Select items the client needs to provide.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-yellow-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Documents Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Missing Documents</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {COMMON_DOCUMENTS.map(doc => (
                                <label key={doc} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedDocs.includes(doc) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc)}
                                        onChange={() => toggleDoc(doc)}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{doc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Clarification Needed</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {COMMON_QUESTIONS.map(q => (
                                <label key={q} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedQuestions.includes(q) ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedQuestions.includes(q)}
                                        onChange={() => toggleQuestion(q)}
                                        className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{q}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custom Note */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Custom Note to Client</h4>
                        <textarea
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            placeholder="Add any specific details or instructions here..."
                            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none text-sm"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (selectedDocs.length === 0 && selectedQuestions.length === 0 && !customNote)}
                        className="px-5 py-2.5 font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Sending Request...' : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
