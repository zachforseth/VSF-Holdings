import React from 'react';
import { FileText, AlertCircle, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

const filings = [
    {
        id: 1,
        year: '2025',
        type: 'Personal Tax Return',
        status: 'Needs Attention',
        date: 'Due Apr 30, 2026',
    },
    {
        id: 2,
        year: '2025',
        type: 'Business Tax Return (T2)',
        status: 'In Progress',
        date: 'Started Jan 15, 2026',
    },
];

export function FilingsSection() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Filings</h2>
                <Link
                    href="/filings"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {filings.map((filing) => {
                    const isNeedsAttention = filing.status === 'Needs Attention';
                    return (
                        <div
                            key={filing.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                {/* Icon - Charcoal, no background circle */}
                                <FileText className="h-6 w-6 text-gray-800" strokeWidth={1.5} />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {filing.year} {filing.type}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{filing.date}</p>
                                </div>
                            </div>

                            <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isNeedsAttention
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}
                            >
                                {isNeedsAttention ? (
                                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                                ) : (
                                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                {filing.status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
