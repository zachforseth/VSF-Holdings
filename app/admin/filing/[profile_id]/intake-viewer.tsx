'use client'

import { useState } from 'react'
import { Check, X, Eye, EyeOff, Copy, Filter, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is used, or we can use a simple alert/console for now if not installed. Let's use simple fallback if needed.
import { getDocumentUrl } from '@/app/actions/admin-actions'
import AdminIntakeForm from './admin-intake-form'

// CATEGOTY DEFINITIONS
const CATEGORIES = {
    identity: ['first_name', 'last_name', 'sin', 'date_of_birth', 'marital_status', 'residency_province'],
    banking: ['institution_number', 'transit_number', 'account_number', 'bank_name', 'void_cheque_path'],
    income: ['has_t4', 'has_t5', 'has_t3', 'has_t4a', 'has_t4e', 'has_t5007', 'self_employed', 'rental_income', 'capital_gains', 'foreign_income'],
    deductions: ['rrsp', 'charitable_donations', 'medical_expenses', 'moving_expenses', 'tuition_credits', 'disability_credit', 'support_payments', 'has_unused_credits', 'student_loan'],
    details: ['business_name', 'business_industry', 'rental_address', 'gross_rental_income', 'marital_change_date', 'new_marital_status', 'foreign_country', 'foreign_asset_desc']
}

// Helper to determine active items
const isActiveItem = (val: any) => {
    if (val === true) return true
    if (typeof val === 'string' && val.toLowerCase() !== 'no' && val.trim() !== '') return true
    if (typeof val === 'number') return true
    if (Array.isArray(val)) {
        if (val.length === 0) return false;
        // Check if any object in the array has non-empty string values (e.g. rental properties)
        return val.some(item => {
            if (typeof item !== 'object' || item === null) return true;
            // Ignore 'id' field which might have default generated values like '1' or random string
            return Object.entries(item).some(([k, v]) => k !== 'id' && typeof v === 'string' && v.trim() !== '')
        })
    }
    return false
}

export default function IntakeResponsesViewer({ data, profile }: { data: any, profile: any }) {
    const [showAll, setShowAll] = useState(false) // Defaults to FALSE (Worker-First)
    const [showSin, setShowSin] = useState(false)
    const [showAccount, setShowAccount] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // ... (rest of render logic)

    // Filter Logic
    const filterItems = (items: any[]) => {
        if (showAll) return items
        return items.filter(item => isActiveItem(item.value))
    }

    // Merge profile data and intake data for the "Identity" section if needed, 
    // or just use profile for identity and data for the rest.
    // The prompt implies a unified view.

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        // Simple visual feedback could be added here
        // toast.success(`Copied ${label}`)
    }

    const formatKey = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
    }

    const handleViewDocument = async (path: string) => {
        if (!path) return
        const { success, url, error } = await getDocumentUrl(profile.user_id, path)
        if (success && url) {
            window.open(url, '_blank')
        } else {
            alert('Failed to open document: ' + error)
        }
    }

    const renderValue = (key: string, value: any) => {
        // BOOLEANS / YES-NO
        if (value === true || value === 'true' || value === 'yes') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold border border-green-200">
                    <Check className="w-3.5 h-3.5" />
                    YES
                </span>
            )
        }
        if (value === false || value === 'false' || value === 'no') {
            return (
                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                    <X className="w-3 h-3" />
                    No
                </span>
            )
        }

        // SIN MASKING
        if (key === 'sin') {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 font-medium tracking-wide">
                        {showSin ? value : '••• ••• ' + (value?.slice(-3) || '•••')}
                    </span>
                    <button
                        onClick={() => setShowSin(!showSin)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={showSin ? "Hide SIN" : "Show SIN"}
                    >
                        {showSin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => copyToClipboard(value, 'SIN')}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy SIN"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            )
        }

        // ACCOUNT NUMBER MASKING
        if (key === 'account_number') {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 font-medium tracking-wide">
                        {showAccount ? value : '••••' + (value?.slice(-4) || '••••')}
                    </span>
                    <button
                        onClick={() => setShowAccount(!showAccount)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={showAccount ? "Hide Account Number" : "Show Account Number"}
                    >
                        {showAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => copyToClipboard(value, 'Account Number')}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy Account Number"
                    >
                        <Copy className="w-4 h-4" />
                    </button>

                </div>
            )
        }

        // VOID CHEQUE DOWNLOAD
        if (key === 'void_cheque_path') {
            return (
                <button
                    onClick={() => handleViewDocument(value)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors border border-blue-200"
                >
                    <FileText className="w-3.5 h-3.5" />
                    View Void Cheque
                </button>
            )
        }

        // RENTAL PROPERTIES (Array of objects)
        if (key === 'rental_properties' && Array.isArray(value)) {
            return (
                <div className="space-y-3 w-full mt-2 sm:mt-0 flex flex-col items-end">
                    {value.map((prop: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-sm">
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-gray-800 text-xs uppercase mb-1">Property {idx + 1}</span>
                                <div className="text-gray-700 flex items-center gap-1 font-medium">
                                    <span className="truncate max-w-[180px] block" title={prop.address || 'No address provided'}>{prop.address || 'No address provided'}</span>
                                    {prop.address && (
                                        <button
                                            onClick={() => copyToClipboard(prop.address || '', `Property ${idx + 1} Address`)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors ml-1 focus:outline-none"
                                            title="Copy Address"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end text-left">
                                <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Income</span>
                                <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold whitespace-nowrap">
                                    ${prop.income || '0'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        // TEXT FIELDS (with copy)
        if (value) {
            return (
                <div className="flex items-center gap-2 group">
                    <span className="font-medium text-gray-900 text-sm break-all">{String(value)}</span>
                    <button
                        onClick={() => copyToClipboard(String(value), formatKey(key))}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                        title="Copy"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        }

        return <span className="text-gray-300">-</span>
    }

    // Prepare Data Groups
    const identityData = CATEGORIES.identity.map(key => ({ key, value: profile[key] || data?.[key] })).filter(i => i.value !== undefined)
    const bankingData = CATEGORIES.banking.map(key => ({ key, value: profile[key] })).filter(i => i.value !== undefined && i.value !== null && i.value !== '')

    // For other categories, we look in `data` (intake_responses)
    const getCategoryData = (keys: string[]) => {
        if (!data) return []
        return keys.map(key => ({ key, value: data[key] }))
            .filter(item => item.value !== undefined)
            .filter(item => {
                if (showAll) return true
                // HIDE "NO" / FALSE values by default
                const v = item.value
                const isNo = v === false || v === 'false' || v === 'no' || v === null || v === ''
                return !isNo
            })
    }

    const incomeData = getCategoryData(CATEGORIES.income)
    const deductionData = getCategoryData(CATEGORIES.deductions)
    const detailsData = getCategoryData(CATEGORIES.details)

    // Identify "Other" keys not in our lists
    const allKnownKeys = Object.values(CATEGORIES).flat()
    const otherKeys = data ? Object.keys(data).filter(k => !allKnownKeys.includes(k) && k !== 'timestamp') : []
    const otherData = otherKeys.map(key => ({ key, value: data[key] })).filter(item => {
        if (showAll) return true
        const v = item.value
        const isNo = v === false || v === 'false' || v === 'no' || v === null || v === ''
        return !isNo
    })


    const Section = ({ title, items, defaultExpanded = true }: { title: string, items: any[], defaultExpanded?: boolean }) => {
        if (items.length === 0 && !showAll) return null

        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
                        {title}
                        <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{items.length}</span>
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {items.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 italic text-sm">No {title.toLowerCase()} found.</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.key} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors">
                                <span className="text-xs font-semibold text-gray-500 uppercase w-1/3 mb-1 sm:mb-0">
                                    {formatKey(item.key)}
                                </span>
                                <div className="flex-1 sm:text-right">
                                    {renderValue(item.key, item.value)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )
    }

    if (isEditing) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <AdminIntakeForm
                    profileId={profile.id}
                    filingYear={profile.filing_year || 2024}
                    initialData={data}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            {/* HEADER with Toggle */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <h2 className="text-md font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Intake Responses
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-md transition-colors border border-gray-200 border-b-2 active:mt-px active:border-b"
                    >
                        Edit Responses
                    </button>
                    {/* Filter Status (Optional, maybe text only) */}
                    {!showAll && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hidden sm:inline-block">
                            Worker View
                        </span>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-semibold text-gray-500 uppercase hover:text-gray-700 transition">Show All</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={showAll}
                                onChange={(e) => setShowAll(e.target.checked)}
                            />
                            <div className={`w-9 h-5 rounded-full shadow-inner transition-colors ${showAll ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showAll ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                {/* IDENTITY (Always Visible) */}
                <Section title="Personal Essentials" items={identityData} />

                {/* BANKING (Always Visible if Present) */}
                {filterItems(bankingData).length > 0 && (
                    <Section title="Direct Deposit" items={filterItems(bankingData)} />
                )}

                {/* DYNAMIC SECTIONS */}
                <Section title="Income Triggers" items={filterItems(incomeData)} />
                <Section title="Deductions & Credits" items={filterItems(deductionData)} />
                <Section title="Specific Details" items={filterItems(detailsData)} />

                {/* OTHER */}
                {filterItems(otherData).length > 0 && (
                    <Section title="Other Information" items={filterItems(otherData)} />
                )}
            </div>
        </div>
    )
}
