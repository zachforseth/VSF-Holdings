'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Landmark, ShieldCheck, Camera, CreditCard, ExternalLink, CheckCircle2, ChevronDown, UploadCloud, Building2, Lock, ChevronRight, X, FileText, ArrowRight } from 'lucide-react'
import { updateBankingInfo, getVoidChequeUrl } from '@/app/actions/settings-actions'
import { uploadVoidCheque } from '@/app/actions/upload-banking-actions'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

interface Profile {
    id: string
    first_name: string
    bank_name: string | null
    transit_number: string | null
    institution_number: string | null
    account_number: string | null
    void_cheque_path?: string | null
    filing_status?: string | null
}

const isValidBanking = (transit: string, inst: string, account: string) => {
    return (
        transit?.length === 5 &&
        inst?.length === 3 &&
        account?.length >= 7 &&
        account?.length <= 12
    )
}

const INSTITUTIONS: Record<string, string> = {
    '001': 'Bank of Montreal (BMO)',
    '002': 'Scotiabank',
    '003': 'Royal Bank of Canada (RBC)',
    '004': 'Toronto-Dominion Bank (TD)',
    '006': 'National Bank of Canada',
    '010': 'CIBC',
    '016': 'HSBC Canada',
    '308': 'Desjardins',
    '815': 'Desjardins',
    '540': 'Manulife Bank',
    '614': 'Tangerine',
    '320': 'Simplii Financial',
    '260': 'EQ Bank'
}

type BankingMethod = 'upload' | 'manual' | 'cra_direct' | null

export default function BankingForm({ profile }: { profile: Profile }) {
    // Locked State Logic
    const isLocked = ['review', 'filed'].includes(profile.filing_status || '')

    // Mode Logic: If banking exists, show 'view' mode (Locked UI), else 'edit' mode (Form)
    const hasBanking = !!(profile.bank_name || profile.void_cheque_path)
    const [mode, setMode] = useState<'view' | 'edit'>(hasBanking ? 'view' : 'edit')

    const [selectedMethod, setSelectedMethod] = useState<BankingMethod>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formBankName, setFormBankName] = useState('')
    const router = useRouter()
    const [confirmed, setConfirmed] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Check if locked for filing
    // State for Manual Entry Validation
    const [transitNumber, setTransitNumber] = useState(profile.transit_number || '')
    const [institutionNumber, setInstitutionNumber] = useState(profile.institution_number || '')
    const [accountNumber, setAccountNumber] = useState(profile.account_number || '')

    // Derived Validation State
    const transitNumberValid = transitNumber.length === 5
    const institutionNumberValid = institutionNumber.length === 3
    const accountNumberValid = accountNumber.length >= 7 && accountNumber.length <= 12

    // Error Messages (only show if not empty or if user tried to submit, but for now just simple valid logic)
    // Actually, prompt asked to show error if length < X. So let's track if user has typed.
    const [transitTouched, setTransitTouched] = useState(false)
    const [institutionTouched, setInstitutionTouched] = useState(false)
    const [accountTouched, setAccountTouched] = useState(false)

    const transitError = transitTouched && !transitNumberValid ? 'Must be 5 digits' : null
    const institutionError = institutionTouched && !institutionNumberValid ? 'Must be 3 digits' : null
    const accountError = accountTouched && !accountNumberValid ? 'Must be 7-12 digits' : null

    const handleTransitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setTransitNumber(val)
        setTransitTouched(true)
    }

    const handleInstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setInstitutionNumber(val)
        setInstitutionTouched(true)

        if (val.length === 3 && INSTITUTIONS[val]) {
            setFormBankName(INSTITUTIONS[val])
        } else {
            setFormBankName('')
        }
    }

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setAccountNumber(val)
        setAccountTouched(true)
    }




    // Clear state when switching methods to prevent duplicates/confusion
    useEffect(() => {
        setConfirmed(false)
        setMessage(null)
        if (selectedMethod !== 'upload') {
            setSelectedFile(null)
        }
    }, [selectedMethod])

    const handleFileChange = (file: File) => {
        if (!file) return
        setSelectedFile(file)
        setMessage(null)
    }

    const handleUploadSubmit = async () => {
        if (!selectedFile) return

        if (!confirmed) {
            setMessage({ type: 'error', text: 'Please check the box to confirm this document belongs to you.' })
            return
        }

        setIsSaving(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('profileId', profile.id)
        formData.append('file', selectedFile)
        formData.append('method', 'upload')

        try {
            const result = await uploadVoidCheque(profile.id, formData)

            if (result.success) {
                toast.success('Voide cheque uploaded successfully!')
                // Reload to show the verified state on this page
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            } else {
                toast.error((result as any).message || 'Failed to upload.')
                setIsSaving(false)
            }
        } catch (error) {
            console.error('Upload failed:', error)
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
            setIsSaving(false)
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0])
        }
    }

    const handleManualSubmit = async (formData: FormData) => {
        if (!confirmed) {
            setMessage({ type: 'error', text: 'Please check the box to confirm this account is yours.' })
            return
        }
        setIsSaving(true)
        setMessage(null)
        formData.append('method', 'manual')

        const result = await updateBankingInfo(formData)

        setIsSaving(false)
        setIsSaving(false)
        if (result.success) {
            toast.success('Banking details updated successfully!')
            window.location.reload()
        } else {
            toast.error(result.message)
        }
    }



    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
    }

    // VIEW MODE (LOCKED STATE)
    if (mode === 'view') {
        const isUpload = profile.bank_name === 'VOID_CHEQUE_UPLOADED' || !!profile.void_cheque_path
        const fileName = profile.void_cheque_path ? profile.void_cheque_path.split('/').pop()?.split('-').slice(1).join('-') : 'Document'

        return (
            <div className='bg-white border border-gray-200 p-8 rounded-3xl flex flex-col gap-6 animate-in zoom-in duration-300 max-w-xl mx-auto shadow-sm'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <h3 className='text-xl font-bold text-gray-900'>Direct Deposit</h3>
                        <div className='bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5'>
                            <CheckCircle2 className='w-3 h-3' />
                            VERIFIED
                        </div>
                    </div>
                </div>

                {/* Data Card */}
                <div className='bg-gray-50 rounded-2xl p-4 border border-gray-100'>
                    {isUpload ? (
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shrink-0 text-red-500'>
                                <FileText className='w-5 h-5' />
                            </div>
                            <div className='min-w-0'>
                                <p className='font-medium text-gray-900 text-sm truncate'>{fileName}</p>
                                <p className='text-xs text-gray-500'>Uploaded Document</p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shrink-0 text-gray-900'>
                                <Landmark className='w-5 h-5' />
                            </div>
                            <div>
                                <p className='font-medium text-gray-900 text-sm'>
                                    {profile.bank_name || 'Bank Account'}
                                </p>
                                <p className='text-xs text-gray-500 font-mono'>
                                    •••• {profile.account_number ? profile.account_number.slice(-4) : '••••'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className='pt-6 border-t border-gray-100 flex flex-col gap-4'>
                    {isLocked ? (
                        <div className="flex flex-col gap-2">
                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Locked for Filing</p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                This information is locked because we have started your filing process. Contact support to make changes.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMode('edit')}
                                    className='text-gray-500 font-medium text-sm hover:text-gray-900 transition-colors flex items-center gap-2 group'
                                >
                                    Change banking information
                                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                                </button>

                                {profile.void_cheque_path && (
                                    <button
                                        onClick={async () => {
                                            const res = await getVoidChequeUrl(profile.void_cheque_path!)
                                            if (res.success && res.url) {
                                                window.open(res.url, '_blank')
                                            } else {
                                                toast.error('Could not retrieve document.')
                                            }
                                        }}
                                        className='text-[#4374D4] font-medium text-sm hover:underline flex items-center gap-2'
                                    >
                                        <ExternalLink className='w-4 h-4' />
                                        View Document
                                    </button>
                                )}
                            </div>


                        </>
                    )}
                </div>
            </div>
        )
    }

    // EDIT MODE
    return (
        <div className='max-w-xl mx-auto pb-24'>
            <div className="mb-8">
                <span className="text-gray-400 font-medium text-sm">Choose a Method</span>
            </div>

            <div className='space-y-4'>


                {/* OPTION 2: UPLOAD VOID CHEQUE (Secondary) */}
                <div className={`bg-white border transition-all duration-300 overflow-hidden ${selectedMethod === 'upload' ? 'border-gray-200 rounded-2xl' : 'border-gray-200 rounded-2xl hover:border-gray-300'}`}>
                    <button
                        onClick={() => setSelectedMethod('upload')}
                        className='w-full p-6 flex items-center justify-between text-left outline-none focus:outline-none focus:ring-0'
                    >
                        <span className="font-bold text-gray-900 text-lg">
                            Upload a void cheque <span className="text-[#3b82f6]">(recommended)</span>
                        </span>
                    </button>

                    {selectedMethod === 'upload' && (
                        <div className='p-8 pt-2 flex flex-col items-center justify-between gap-6 animate-in slide-in-from-top-2 duration-300'>

                            {!selectedFile ? (
                                <>
                                    <p className='text-lg font-medium text-gray-900 w-full text-left'>Select file to upload</p>
                                    <label
                                        className={`relative w-full h-32 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all cursor-pointer group ${isDragging ? 'border-[#4374D4] bg-[#4374D4]/5' : 'border-gray-200 hover:border-[#4374D4] hover:bg-[#4374D4]/5'}`}
                                        onDragOver={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsDragging(true)
                                        }}
                                        onDragEnter={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsDragging(true)
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsDragging(false)
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsDragging(false)
                                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                handleFileChange(e.dataTransfer.files[0])
                                            }
                                        }}
                                    >
                                        <input
                                            type='file'
                                            className='hidden'
                                            accept="image/*,.pdf"
                                            onChange={onFileChange}
                                        />
                                        <div className='text-center pointer-events-none'>
                                            <div className='w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-white transition-colors'>
                                                <UploadCloud className='w-5 h-5 text-gray-400 group-hover:text-[#4374D4]' />
                                            </div>
                                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#4374D4] transition-colors'>Drop or Click</p>
                                        </div>
                                    </label>
                                </>
                            ) : (
                                <div className='w-full space-y-6'>
                                    {/* Selected File Preview Card */}
                                    <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100'>
                                        <div className='flex items-center gap-3 overflow-hidden'>
                                            <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shrink-0'>
                                                <div className='text-[#4374D4] font-bold text-xs uppercase'>{selectedFile.name.split('.').pop()}</div>
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='font-medium text-gray-900 truncate max-w-[200px]'>{selectedFile.name}</p>
                                                <p className='text-xs text-gray-500'>{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className='text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center'
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Confirmation Checkbox */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={confirmed}
                                                onChange={(e) => setConfirmed(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#4374D4] focus:ring-[#4374D4]"
                                            />
                                            <span className="text-sm text-gray-600 leading-relaxed">
                                                I confirm this document belongs to me.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Error Message Display */}
                                    {message && message.type === 'error' && (
                                        <div className='bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2'>
                                            <ShieldCheck className="w-4 h-4 shrink-0" />
                                            {message.text}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={isSaving}
                                        className='w-full bg-[#4374D4] text-white font-bold py-4 rounded-xl hover:bg-[#2952E3] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                        {isSaving ? 'Uploading...' : 'Upload Void Cheque'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* OPTION 3: MANUAL ENTRY (Tertiary) */}
                <div>
                    <button
                        onClick={() => setSelectedMethod('manual')}
                        className={`w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-gray-300 transition-colors duration-200 text-left outline-none focus:outline-none focus:ring-0 group ${selectedMethod === 'manual' ? 'rounded-b-none border-b-0 border-gray-200' : ''}`}
                    >
                        <span className="font-bold text-gray-900 text-lg">
                            Enter your banking details manually
                        </span>
                    </button>

                    {selectedMethod === 'manual' && (
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-2xl p-6 pt-0 animate-in slide-in-from-top-2">
                            {isLocked && (
                                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                                    <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">Banking details are locked while your return is under review or filed.</p>
                                </div>
                            )}
                            <form key={profile.id} action={handleManualSubmit} className='space-y-6'>
                                <input type="hidden" name="profileId" value={profile.id} />

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <div className="flex justify-between">
                                            <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Transit (5)</label>
                                            {/* Validation Indicator could go here, but using simple disabled button logic for now */}
                                        </div>
                                        <input
                                            type='text'
                                            name="transitNumber"
                                            value={transitNumber}
                                            maxLength={5}
                                            minLength={5}
                                            pattern="\d{5}"
                                            placeholder='00000'
                                            className={`w-full border ${!transitError ? 'border-gray-300 hover:border-gray-400 focus:border-gray-500' : 'border-red-500'} rounded-xl px-4 py-3 outline-none font-mono text-gray-900 bg-white transition-all disabled:bg-gray-50 disabled:text-gray-400`}
                                            onInput={handleNumericInput}
                                            onChange={handleTransitChange}
                                            onBlur={() => setTransitTouched(true)}
                                            disabled={isLocked}
                                            inputMode="numeric"
                                            required
                                        />
                                        {transitError && <p className="text-xs text-red-500 ml-1">{transitError}</p>}
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Inst. (3)</label>
                                        <input
                                            type='text'
                                            name="institutionNumber"
                                            value={institutionNumber}
                                            maxLength={3}
                                            minLength={3}
                                            pattern="\d{3}"
                                            placeholder='000'
                                            className={`w-full border ${!institutionError ? 'border-gray-300 hover:border-gray-400 focus:border-gray-500' : 'border-red-500'} rounded-xl px-4 py-3 outline-none font-mono text-gray-900 bg-white transition-all disabled:bg-gray-50 disabled:text-gray-400`}
                                            onChange={handleInstChange}
                                            onBlur={() => setInstitutionTouched(true)}
                                            disabled={isLocked}
                                            inputMode="numeric"
                                            required
                                        />
                                        {institutionError && <p className="text-xs text-red-500 ml-1">{institutionError}</p>}
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Financial Institution</label>
                                    <input
                                        type='text'
                                        name="bankName"
                                        value={formBankName || profile.bank_name || ''}
                                        placeholder='Auto-filled from Inst. number'
                                        className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50 text-gray-500 font-medium'
                                        readOnly
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Account Number</label>
                                    <input
                                        type='text'
                                        name="accountNumber"
                                        value={accountNumber}
                                        placeholder='Enter account number'
                                        className={`w-full border ${!accountError ? 'border-gray-300 hover:border-gray-400 focus:border-gray-500' : 'border-red-500'} rounded-xl px-4 py-3 outline-none font-mono text-gray-900 bg-white transition-all disabled:bg-gray-50 disabled:text-gray-400`}
                                        onInput={handleNumericInput}
                                        onChange={handleAccountNumberChange}
                                        onBlur={() => setAccountTouched(true)}
                                        disabled={isLocked}
                                        inputMode="numeric"
                                        pattern="\d{7,12}"
                                        minLength={7}
                                        maxLength={12}
                                        required
                                    />
                                    {accountError && <p className="text-xs text-red-500 ml-1">{accountError}</p>}
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                                    <label className={`flex items-start gap-3 ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(e) => setConfirmed(e.target.checked)}
                                            disabled={isLocked}
                                            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#4374D4] focus:ring-[#4374D4]"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed">
                                            I confirm this account is mine and should be used for CRA refunds.
                                        </span>
                                    </label>
                                </div>

                                {/* Error Message Display */}
                                {message && message.type === 'error' && (
                                    <div className='bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2'>
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving || isLocked || (selectedMethod === 'manual' && (!transitNumberValid || !institutionNumberValid || !accountNumberValid || !confirmed))}
                                    className='w-full bg-[#4374D4] text-white font-bold py-4 rounded-xl hover:bg-[#2952E3] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                >
                                    {isSaving ? 'Saving...' : isLocked ? 'Locked' : 'Save Banking Details'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* MESSAGE TOAST SUCCESS ONLY */}
            {message && message.type === 'success' && (
                <div className={`fixed bottom-8 right-8 p-4 px-6 rounded-2xl animate-in slide-in-from-bottom-8 duration-500 flex items-center gap-3 z-50 bg-[#059669] text-white`}>
                    <CheckCircle2 className="w-6 h-6" />
                    <p className="font-bold text-sm tracking-wide">{message.text}</p>
                </div>
            )}
        </div>
    )
}
