'use client'

import { useState } from 'react'
import { submitQuestionnaire } from '@/app/actions/intake-actions'
import { ChevronDown, Shield, CheckCircle2, Plus, Trash2 } from 'lucide-react'

export default function IntakeForm({ profileId, filingYear }: { profileId: string, filingYear: number }) {
    const [isSelfEmployed, setIsSelfEmployed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [maritalChanged, setMaritalChanged] = useState(false)
    const [rentalIncome, setRentalIncome] = useState(false)
    const [rentalProperties, setRentalProperties] = useState([{ id: '1', address: '', income: '' }])
    const [foreignProperty, setForeignProperty] = useState(false)
    const [isCertified, setIsCertified] = useState(false)

    // Rental Property Handlers
    const addProperty = () => {
        setRentalProperties([...rentalProperties, { id: Math.random().toString(36).substr(2, 9), address: '', income: '' }])
    }

    const removeProperty = (id: string) => {
        if (rentalProperties.length > 1) {
            setRentalProperties(rentalProperties.filter(p => p.id !== id))
        }
    }

    const updateProperty = (id: string, field: 'address' | 'income', value: string) => {
        setRentalProperties(rentalProperties.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    // Marital Change Date States
    const [changeMonth, setChangeMonth] = useState('')
    const [changeDay, setChangeDay] = useState('')
    const [changeYear, setChangeYear] = useState('')

    // Date Constants
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const years = Array.from({ length: 7 }, (_, i) => filingYear + 1 - i) // 6 years back + 1 year ahead of filing year

    const formattedChangeDate = changeYear && changeMonth && changeDay
        ? `${changeYear}-${String(months.indexOf(changeMonth) + 1).padStart(2, '0')}-${String(changeDay).padStart(2, '0')}`
        : ''

    // Tuition State
    const [hasTuition, setHasTuition] = useState(false)
    const [hasUnusedCredits, setHasUnusedCredits] = useState(false)
    const [wantToTransfer, setWantToTransfer] = useState(false)

    // Handle form submission to show loading state
    // We use the action prop on the form, but we can intercept it if we want custom validation
    // For now, simpler to use the server action directly in the form action
    // but we can't easily set state *during* the server action unless we use useFormStatus (React 18/Next 13+) 
    // or wrap in a handler. 
    // Let's use a wrapper handler to set submitting state.

    // Actually, simpler: Just use the action. The animation state is local.

    return (
        <form action={submitQuestionnaire} onSubmit={() => setIsSubmitting(true)} className='space-y-10 max-w-4xl mx-auto'>
            <input type='hidden' name='profileId' value={profileId} />

            {/* SECTION 1: Marital Status */}
            <Section title="1. Marital Status" color="blue" className={!maritalChanged ? "!pb-5 sm:!pb-7" : ""}>
                <h3 className="text-gray-900 font-semibold mb-2">Did your marital status change in {filingYear}?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Your current status is used to calculate specific credits like the Canada Child Benefit or Spousal Amount.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${maritalChanged ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <input type='radio' name="marital_change_radio" value='yes' checked={maritalChanged} onChange={() => setMaritalChanged(true)} className='sr-only' />
                        <span className={maritalChanged ? 'text-blue-700' : 'text-gray-700'}>Yes, it changed</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!maritalChanged ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <input type='radio' name="marital_change_radio" value='no' checked={!maritalChanged} onChange={() => setMaritalChanged(false)} className='sr-only' />
                        <span className={!maritalChanged ? 'text-blue-700' : 'text-gray-700'}>No, same as last year</span>
                    </label>
                </div>
                {/* Hidden input for server action logic */}
                <input type="hidden" name="marital_change" value={maritalChanged ? 'on' : 'off'} />

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${maritalChanged ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-4">
                        <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">Status Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="New Status" name="new_marital_status" type="select" options={['Married', 'Common-Law', 'Divorced', 'Separated', 'Widowed']} />
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Date of Change</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        value={changeMonth}
                                        onChange={(e) => setChangeMonth(e.target.value)}
                                        className="h-12 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer shadow-sm"
                                    >
                                        <option value="">Month</option>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select
                                        value={changeDay}
                                        onChange={(e) => setChangeDay(e.target.value)}
                                        className="h-12 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer shadow-sm"
                                    >
                                        <option value="">Day</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select
                                        value={changeYear}
                                        onChange={(e) => setChangeYear(e.target.value)}
                                        className="h-12 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer shadow-sm"
                                    >
                                        <option value="">Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <input type="hidden" name="marital_change_date" value={formattedChangeDate} />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* SECTION 2: Income Checklist */}
            <Section title="2. Income Checklist" color="violet">
                <p className="text-gray-500 mb-4 text-sm">Check all that apply to you in {filingYear}.</p>
                <div className="space-y-3">
                    <CheckboxGroup name="has_t4" label="T4 (Employment Income)" />
                    <CheckboxGroup name="has_t4a" label="T4A (Pension, Retirement, Annuity, etc.)" />
                    <CheckboxGroup name="has_t5007" label="T5007 (Workers Comp / Social Assistance)" />
                    <CheckboxGroup name="has_t4e" label="T4E (Employment Insurance)" />
                </div>
            </Section>

            {/* SECTION 3: Tuition & Education */}
            <Section title="3. Tuition & Education" color="blue" className={(!hasTuition || (hasTuition && !wantToTransfer)) ? "!pb-2 sm:!pb-4" : ""}>
                <div className="space-y-8">

                    {/* Q1: T2202 */}
                    <div className="pt-2 first:pt-0">
                        <h3 className="text-gray-900 font-semibold mb-2">Did you attend a university or college in {filingYear}?</h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${hasTuition ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type='radio' name="has_tuition_radio" value='yes' checked={hasTuition} onChange={() => setHasTuition(true)} className='sr-only' />
                                <span className={hasTuition ? 'text-blue-700' : 'text-gray-700'}>Yes</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!hasTuition ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type='radio' name="has_tuition_radio" value='no' checked={!hasTuition} onChange={() => setHasTuition(false)} className='sr-only' />
                                <span className={!hasTuition ? 'text-blue-700' : 'text-gray-700'}>No</span>
                            </label>
                        </div>
                        <input type="hidden" name="has_tuition" value={hasTuition ? 'on' : 'off'} />

                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${hasTuition ? 'max-h-[100px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                            <div className="bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-4 text-sm text-blue-900 font-medium">
                                Please ensure you have your <span className="font-bold">T2202 slip</span> ready for upload.
                            </div>
                        </div>
                    </div>

                    {hasTuition && (
                        <>
                            {/* Q2: Unused Credits */}
                            <div className="pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h3 className="text-gray-900 font-semibold mb-2">Do you have unused tuition credits from previous years?</h3>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${hasUnusedCredits ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <input type='radio' name="unused_credits_radio" value='yes' checked={hasUnusedCredits} onChange={() => setHasUnusedCredits(true)} className='sr-only' />
                                        <span className={hasUnusedCredits ? 'text-blue-700' : 'text-gray-700'}>Yes</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!hasUnusedCredits ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <input type='radio' name="unused_credits_radio" value='no' checked={!hasUnusedCredits} onChange={() => setHasUnusedCredits(false)} className='sr-only' />
                                        <span className={!hasUnusedCredits ? 'text-blue-700' : 'text-gray-700'}>No</span>
                                    </label>
                                </div>
                                <input type="hidden" name="has_unused_credits" value={hasUnusedCredits ? 'on' : 'off'} />

                                <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${hasUnusedCredits ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                    <div className="min-h-0 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="Federal Carry-forward Amount ($)" name="tuition_fed_carryforward" type="number" placeholder="0.00" />
                                            <InputGroup label="Provincial Carry-forward Amount ($)" name="tuition_prov_carryforward" type="number" placeholder="0.00" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Q3: Transfer Credits */}
                            <div className="pt-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                                <h3 className="text-gray-900 font-semibold mb-2">Would you like to transfer unused credits to someone else?</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    e.g. A parent, grandparent, or spouse.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${wantToTransfer ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <input type='radio' name="transfer_credits_radio" value='yes' checked={wantToTransfer} onChange={() => setWantToTransfer(true)} className='sr-only' />
                                        <span className={wantToTransfer ? 'text-blue-700' : 'text-gray-700'}>Yes</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!wantToTransfer ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <input type='radio' name="transfer_credits_radio" value='no' checked={!wantToTransfer} onChange={() => setWantToTransfer(false)} className='sr-only' />
                                        <span className={!wantToTransfer ? 'text-blue-700' : 'text-gray-700'}>No</span>
                                    </label>
                                </div>
                                <input type="hidden" name="want_transfer_credits" value={wantToTransfer ? 'on' : 'off'} />

                                <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${wantToTransfer ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                    <div className="min-h-0 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="Relationship to you" name="tuition_transfer_rel" placeholder="e.g. Mother" />
                                            <InputGroup label="Transfer Amount ($)" name="tuition_transfer_amt" type="number" placeholder="Max $5,000" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </Section>

            {/* SECTION 4: Investments */}
            <Section title="4. Investments" color="blue">
                <div className="space-y-3">
                    <CheckboxGroup name="has_t3" label="T3 (Trust Income / Mutual Funds)" />
                    <CheckboxGroup name="has_t5" label="T5 (Investment Income - Interest/Dividends)" />
                    <CheckboxGroup name="capital_gains" label="Did you sell stocks, crypto, or real estate for a gain/loss?" />

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                            <input
                                type="checkbox"
                                name="foreign_property"
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                checked={foreignProperty}
                                onChange={(e) => setForeignProperty(e.target.checked)}
                            />
                            <span className="text-gray-700 font-medium group-hover:text-gray-900">Did you own foreign property {'>'} $100k CAD?</span>
                        </label>

                        <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${foreignProperty ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="min-h-0 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-4 ml-6">
                                <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">Foreign Assets</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Country" name="foreign_country" placeholder="e.g. USA" />
                                    <InputGroup label="Description" name="foreign_asset_desc" placeholder="e.g. Vacation Home, Stocks" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* SECTION 5: Self-Employment (Dynamic) */}
            <Section title="5. Self-Employment" color="blue" className={!isSelfEmployed ? "!pb-2 sm:!pb-4" : ""}>
                <div className="space-y-4">
                    <h3 className="text-gray-900 font-semibold mb-2">Did you earn any self-employment or business income?</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${isSelfEmployed ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <input type='radio' name="self_employed_radio" value='yes' checked={isSelfEmployed} onChange={() => setIsSelfEmployed(true)} className='sr-only' />
                            <span className={isSelfEmployed ? 'text-blue-700' : 'text-gray-700'}>Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!isSelfEmployed ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <input type='radio' name="self_employed_radio" value='no' checked={!isSelfEmployed} onChange={() => setIsSelfEmployed(false)} className='sr-only' />
                            <span className={!isSelfEmployed ? 'text-blue-700' : 'text-gray-700'}>No</span>
                        </label>
                    </div>
                    {/* Hidden input for server action logic */}
                    <input type="hidden" name="self_employed" value={isSelfEmployed ? 'on' : 'off'} />

                    {/* Slide Down Animation Wrapper */}
                    <div
                        className={`grid transition-all duration-500 ease-in-out overflow-hidden ${isSelfEmployed ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                    >
                        <div className="min-h-0 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-4">
                            <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">Business Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Business Name" name="business_name" placeholder="e.g. Acme Consulting" />
                                <InputGroup label="Main Product/Service" name="business_industry" placeholder="e.g. Graphic Design" />
                                <CheckboxGroup name="gst_registered" label="Are you GST/HST Registered?" />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* SECTION 6: Rental Income */}
            <Section title="6. Rental Income" color="blue" className={!rentalIncome ? "!pb-2 sm:!pb-4" : ""}>
                <div className="space-y-4">
                    <h3 className="text-gray-900 font-semibold mb-2">Did you earn income from rental properties?</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${rentalIncome ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <input type='radio' name="rental_income_radio" value='yes' checked={rentalIncome} onChange={() => setRentalIncome(true)} className='sr-only' />
                            <span className={rentalIncome ? 'text-blue-700' : 'text-gray-700'}>Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!rentalIncome ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <input type='radio' name="rental_income_radio" value='no' checked={!rentalIncome} onChange={() => setRentalIncome(false)} className='sr-only' />
                            <span className={!rentalIncome ? 'text-blue-700' : 'text-gray-700'}>No</span>
                        </label>
                    </div>
                    {/* Hidden input for server action logic */}
                    <input type="hidden" name="rental_income" value={rentalIncome ? 'on' : 'off'} />
                    <input type="hidden" name="rental_properties_json" value={JSON.stringify(rentalProperties)} />

                    <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${rentalIncome ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                        <div className="min-h-0 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 p-6 space-y-6">

                            {rentalProperties.map((property, index) => (
                                <div key={property.id} className="relative pb-6 border-b border-blue-200 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">Property #{index + 1}</h4>
                                        {rentalProperties.length > 1 && (
                                            <button type="button" onClick={() => removeProperty(property.id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputGroup
                                            label="Property Address"
                                            name={`rental_address_${index}`}
                                            placeholder="123 Main St..."
                                            value={property.address}
                                            onChange={(e) => updateProperty(property.id, 'address', e.target.value)}
                                        />
                                        <InputGroup
                                            label="Gross Rental Income (Annual)"
                                            name={`gross_rental_income_${index}`}
                                            type="number"
                                            placeholder="$0.00"
                                            value={property.income}
                                            onChange={(e) => updateProperty(property.id, 'income', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addProperty}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Property
                            </button>

                        </div>
                    </div>
                </div>
            </Section>

            {/* SECTION 7: Credits & Deductions */}
            <Section title="7. Major Credits" color="rose">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CheckboxGroup name="disability_credit" label="Disability Tax Credit (T2201)" />
                    <CheckboxGroup name="moving_expenses" label="Moving Expenses (>40km)" />
                    {/* Tuition removed from here since it has its own section now */}
                    <CheckboxGroup name="medical_expenses" label="Significant Medical Expenses" />
                    <CheckboxGroup name="charitable_donations" label="Charitable Donations" />
                    <CheckboxGroup name="support_payments" label="Support Payments Made/Received" />
                </div>
            </Section>

            {/* SECTION 8: CRA Access */}
            <Section title="8. CRA Slip Retrieval (Optional)" color="orange">
                <p className="text-gray-900 font-semibold mb-2">Would you like VSF to retrieve any missing tax slips from CRA after you upload your documents?</p>
                <p className="text-sm text-gray-600 mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 shadow-sm">
                    <span className="font-bold text-orange-600">Important:</span> You must still upload documents for deductions, self-employment, rental income, crypto, and receipts. CRA access is used only to retrieve missing slips and verify completeness.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <label className='flex-1 flex items-center justify-center gap-3 p-4 bg-white border rounded-xl cursor-pointer hover:bg-gray-50 transition-all border-gray-200 has-[:checked]:border-orange-500 has-[:checked]:ring-1 has-[:checked]:ring-orange-500 has-[:checked]:text-orange-700 shadow-sm'>
                        <input type='radio' name="cra_auth" value='yes' defaultChecked className='h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300' />
                        <span className='font-medium'>Yes — retrieve missing slips from CRA if needed</span>
                    </label>
                    <label className='flex-1 flex items-center justify-center gap-3 p-4 bg-white border rounded-xl cursor-pointer hover:bg-gray-50 transition-all border-gray-200 shadow-sm'>
                        <input type='radio' name="cra_auth" value='no' className='h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300' />
                        <span className='text-gray-700 font-medium'>No — I will upload all slips manually</span>
                    </label>
                </div>
            </Section>

            {/* SECTION 8: Legal & Certification */}
            <section className='bg-gray-50 rounded-3xl p-8 border border-gray-200 space-y-6'>
                <h3 className='font-bold text-gray-900 flex items-center gap-2 text-lg'>
                    <Shield className="w-5 h-5 text-gray-400" /> Professional Certification
                </h3>

                <div className='bg-gray-100/50 rounded-xl p-6 text-sm text-gray-500 space-y-4 leading-relaxed border border-gray-200'>
                    <p>
                        <strong>Professional Liability Protection Clause:</strong> I understand that VSF Capital Structuring prepares returns based solely on the information and documentation provided by me. I accept full responsibility for the accuracy and completeness of the data submitted. VSF is not liable for any interest, penalties, or tax reassessments resulting from omitted or incorrect information provided by the client.
                    </p>
                    <p>
                        <strong>Fee Acknowledgement:</strong> I understand that the final preparation fee is determined by the complexity of my return and may differ from initial estimates if additional work is required.
                    </p>
                </div>

                <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-200">
                        <input
                            type="checkbox"
                            required
                            name="certification"
                            checked={isCertified}
                            onChange={(e) => setIsCertified(e.target.checked)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
                            I certify that the information provided above is correct and complete to the best of my knowledge, and I agree to the terms above.
                        </span>
                    </label>
                </div>
            </section>

            <div className='pt-8 pb-12 mt-8 border-t border-gray-100'>
                <button
                    disabled={isSubmitting || !isCertified}
                    className='w-full bg-blue-600 text-white text-lg px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none'
                >
                    {isSubmitting ? 'Saving...' : (
                        <>
                            Save & Continue <CheckCircle2 className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

        </form>
    )
}

// --- HELPER COMPONENTS ---

function Section({ title, children, color = 'blue', className = '' }: { title: string, children: React.ReactNode, color?: string, className?: string }) {
    const isOrange = color === 'orange'
    return (
        <section className='space-y-6'>
            <div className='flex items-center gap-2'>
                <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
            </div>
            <div className={`${isOrange ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-200'} rounded-3xl border p-5 sm:p-8 shadow-sm ${className}`}>
                {children}
            </div>
        </section>
    )
}

function InputGroup({ label, name, placeholder, type = 'text', required = false, options, value, onChange }: { label: string, name: string, placeholder?: string, type?: string, required?: boolean, options?: string[], value?: string | number, onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <div className="relative">
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer text-gray-700 shadow-sm"
                    >
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400 shadow-sm"
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
    )
}

function CheckboxGroup({ name, label }: { name: string, label: string }) {
    return (
        <label className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <input
                type="checkbox"
                name={name}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700 font-medium group-hover:text-gray-900">{label}</span>
        </label>
    )
}
