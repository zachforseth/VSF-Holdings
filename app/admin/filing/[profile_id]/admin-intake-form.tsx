'use client'

import { useState } from 'react'
import { adminSubmitQuestionnaire } from '@/app/actions/admin-actions'
import { ChevronDown, Shield, CheckCircle2, Plus, Trash2, X } from 'lucide-react'

export default function AdminIntakeForm({ profileId, filingYear, initialData, onCancel }: { profileId: string, filingYear: number, initialData: any, onCancel: () => void }) {
    const init = initialData || {}

    const [isSelfEmployed, setIsSelfEmployed] = useState(init.self_employed === 'yes')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [maritalChanged, setMaritalChanged] = useState(init.marital_change === true)
    const [rentalIncome, setRentalIncome] = useState(init.rental_income === 'yes')
    const [rentalProperties, setRentalProperties] = useState<{ id: string, address: string, income: string }[]>(
        Array.isArray(init.rental_properties) && init.rental_properties.length > 0
            ? init.rental_properties
            : [{ id: '1', address: '', income: '' }]
    )
    const [foreignProperty, setForeignProperty] = useState(init.foreign_property === 'yes')
    const [isCertified, setIsCertified] = useState(init.certification === true)

    // Rental Property Handlers
    const addProperty = () => {
        setRentalProperties([...rentalProperties, { id: Math.random().toString(36).substr(2, 9), address: '', income: '' }])
    }
    const removeProperty = (id: string) => {
        if (rentalProperties.length > 1) setRentalProperties(rentalProperties.filter(p => p.id !== id))
    }
    const updateProperty = (id: string, field: 'address' | 'income', value: string) => {
        setRentalProperties(rentalProperties.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    // Marital Change Date States
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let initialMonth = '', initialDay = '', initialYear = '';
    if (init.marital_change_date) {
        const parts = init.marital_change_date.split('-');
        if (parts.length === 3) {
            initialYear = parts[0];
            initialMonth = months[parseInt(parts[1]) - 1];
            initialDay = parseInt(parts[2]).toString();
        }
    }
    const [changeMonth, setChangeMonth] = useState(initialMonth)
    const [changeDay, setChangeDay] = useState(initialDay)
    const [changeYear, setChangeYear] = useState(initialYear)

    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const years = Array.from({ length: 7 }, (_, i) => filingYear + 1 - i)

    const formattedChangeDate = changeYear && changeMonth && changeDay
        ? `${changeYear}-${String(months.indexOf(changeMonth) + 1).padStart(2, '0')}-${String(changeDay).padStart(2, '0')}`
        : ''

    const [hasTuition, setHasTuition] = useState(init.has_tuition === true)
    const [hasUnusedCredits, setHasUnusedCredits] = useState(init.has_unused_credits === true)
    const [wantToTransfer, setWantToTransfer] = useState(init.want_transfer_credits === true)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        const res = await adminSubmitQuestionnaire(formData)
        setIsSubmitting(false)
        if (res.success) {
            onCancel() // Close editor upon success
        } else {
            alert("Error saving: " + res.error)
        }
    }

    return (
        <form action={handleSubmit} className='space-y-6'>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Editing Questionnaire</h2>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-800 p-2"><X className="w-5 h-5" /></button>
            </div>

            <input type='hidden' name='profileId' value={profileId} />

            <Section title="1. Marital Status" color="blue">
                <h3 className="text-gray-900 font-semibold mb-2">Did your marital status change in {filingYear}?</h3>
                <div className="flex gap-4 max-w-md">
                    <label className={`flex-1 flex items-center justify-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${maritalChanged ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white border-gray-200'}`}>
                        <input type='radio' name="marital_change_radio" value='yes' checked={maritalChanged} onChange={() => setMaritalChanged(true)} className='sr-only' />
                        <span>Yes, it changed</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${!maritalChanged ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white border-gray-200'}`}>
                        <input type='radio' name="marital_change_radio" value='no' checked={!maritalChanged} onChange={() => setMaritalChanged(false)} className='sr-only' />
                        <span>No, same as last year</span>
                    </label>
                </div>
                <input type="hidden" name="marital_change" value={maritalChanged ? 'on' : 'off'} />

                {maritalChanged && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="New Status" name="new_marital_status" type="select" options={['Married', 'Common-Law', 'Divorced', 'Separated', 'Widowed']} defaultValue={init.new_marital_status} />
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Date of Change</label>
                            <div className="grid grid-cols-3 gap-2">
                                <select value={changeMonth} onChange={(e) => setChangeMonth(e.target.value)} className="h-10 px-3 border rounded-lg text-sm">
                                    <option value="">Month</option>{months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={changeDay} onChange={(e) => setChangeDay(e.target.value)} className="h-10 px-3 border rounded-lg text-sm">
                                    <option value="">Day</option>{days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={changeYear} onChange={(e) => setChangeYear(e.target.value)} className="h-10 px-3 border rounded-lg text-sm">
                                    <option value="">Year</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <input type="hidden" name="marital_change_date" value={formattedChangeDate} />
                        </div>
                    </div>
                )}
            </Section>

            <Section title="2. Income Checklist" color="violet">
                <div className="space-y-2">
                    <CheckboxGroup name="has_t4" label="T4 (Employment Income)" defaultChecked={init.has_t4 === true} />
                    <CheckboxGroup name="has_t4a" label="T4A (Pension, Retirement, Annuity)" defaultChecked={init.has_t4a === true} />
                    <CheckboxGroup name="has_t5007" label="T5007 (Workers Comp / Social Assistance)" defaultChecked={init.has_t5007 === true} />
                    <CheckboxGroup name="has_t4e" label="T4E (Employment Insurance)" defaultChecked={init.has_t4e === true} />
                </div>
            </Section>

            <Section title="3. Tuition & Education" color="blue">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-gray-900 font-semibold mb-2">Did you attend a university/college in {filingYear}?</h3>
                        <div className="flex gap-4 max-w-md">
                            <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer ${hasTuition ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white'}`}>
                                <input type='radio' checked={hasTuition} onChange={() => setHasTuition(true)} className='sr-only' /> Yes
                            </label>
                            <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer ${!hasTuition ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-white'}`}>
                                <input type='radio' checked={!hasTuition} onChange={() => setHasTuition(false)} className='sr-only' /> No
                            </label>
                        </div>
                        <input type="hidden" name="has_tuition" value={hasTuition ? 'on' : 'off'} />
                    </div>

                    {hasTuition && (
                        <>
                            <div>
                                <h3 className="text-gray-900 font-semibold mb-2">Unused credits from previous years?</h3>
                                <div className="flex gap-4 max-w-md">
                                    <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${hasUnusedCredits ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                                        <input type='radio' checked={hasUnusedCredits} onChange={() => setHasUnusedCredits(true)} className='sr-only' /> Yes
                                    </label>
                                    <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${!hasUnusedCredits ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                                        <input type='radio' checked={!hasUnusedCredits} onChange={() => setHasUnusedCredits(false)} className='sr-only' /> No
                                    </label>
                                </div>
                                <input type="hidden" name="has_unused_credits" value={hasUnusedCredits ? 'on' : 'off'} />
                                {hasUnusedCredits && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <InputGroup label="Fed Carry-forward" name="tuition_fed_carryforward" type="number" defaultValue={init.tuition_fed_carryforward} />
                                        <InputGroup label="Prov Carry-forward" name="tuition_prov_carryforward" type="number" defaultValue={init.tuition_prov_carryforward} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-gray-900 font-semibold mb-2">Transfer unused credits?</h3>
                                <div className="flex gap-4 max-w-md">
                                    <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${wantToTransfer ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                                        <input type='radio' checked={wantToTransfer} onChange={() => setWantToTransfer(true)} className='sr-only' /> Yes
                                    </label>
                                    <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${!wantToTransfer ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                                        <input type='radio' checked={!wantToTransfer} onChange={() => setWantToTransfer(false)} className='sr-only' /> No
                                    </label>
                                </div>
                                <input type="hidden" name="want_transfer_credits" value={wantToTransfer ? 'on' : 'off'} />
                                {wantToTransfer && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <InputGroup label="Relationship to you" name="tuition_transfer_rel" defaultValue={init.tuition_transfer_rel} />
                                        <InputGroup label="Transfer Amount" name="tuition_transfer_amt" type="number" defaultValue={init.tuition_transfer_amt} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Section>

            <Section title="4. Investments" color="blue">
                <div className="space-y-2">
                    <CheckboxGroup name="has_t3" label="T3 (Trust Income / Mutual Funds)" defaultChecked={init.has_t3 === true} />
                    <CheckboxGroup name="has_t5" label="T5 (Investment Income)" defaultChecked={init.has_t5 === true} />
                    <CheckboxGroup name="capital_gains" label="Sold stocks, crypto, or real estate?" defaultChecked={init.capital_gains === 'yes'} />

                    <div className="pt-2">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input type="checkbox" name="foreign_property" className="rounded text-blue-600" checked={foreignProperty} onChange={(e) => setForeignProperty(e.target.checked)} />
                            <span className="text-gray-700 font-medium">Foreign property {'>'} $100k CAD?</span>
                        </label>
                        {foreignProperty && (
                            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                                <InputGroup label="Country" name="foreign_country" defaultValue={init.foreign_country} />
                                <InputGroup label="Description" name="foreign_asset_desc" defaultValue={init.foreign_asset_desc} />
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            <Section title="5. Self-Employment" color="blue">
                <div>
                    <h3 className="text-gray-900 font-semibold mb-2">Self-employment or business income?</h3>
                    <div className="flex gap-4 max-w-md">
                        <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${isSelfEmployed ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                            <input type='radio' checked={isSelfEmployed} onChange={() => setIsSelfEmployed(true)} className='sr-only' /> Yes
                        </label>
                        <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${!isSelfEmployed ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                            <input type='radio' checked={!isSelfEmployed} onChange={() => setIsSelfEmployed(false)} className='sr-only' /> No
                        </label>
                    </div>
                    <input type="hidden" name="self_employed" value={isSelfEmployed ? 'on' : 'off'} />
                    {isSelfEmployed && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <InputGroup label="Business Name" name="business_name" defaultValue={init.business_name} />
                            <InputGroup label="Main Product/Service" name="business_industry" defaultValue={init.business_industry} />
                            <CheckboxGroup name="gst_registered" label="GST/HST Registered?" defaultChecked={init.gst_registered === true} />
                        </div>
                    )}
                </div>
            </Section>

            <Section title="6. Rental Income" color="blue">
                <div>
                    <h3 className="text-gray-900 font-semibold mb-2">Income from rental properties?</h3>
                    <div className="flex gap-4 max-w-md">
                        <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${rentalIncome ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                            <input type='radio' checked={rentalIncome} onChange={() => setRentalIncome(true)} className='sr-only' /> Yes
                        </label>
                        <label className={`flex-1 flex justify-center p-3 border rounded-xl cursor-pointer ${!rentalIncome ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-white'}`}>
                            <input type='radio' checked={!rentalIncome} onChange={() => setRentalIncome(false)} className='sr-only' /> No
                        </label>
                    </div>
                    <input type="hidden" name="rental_income" value={rentalIncome ? 'on' : 'off'} />
                    <input type="hidden" name="rental_properties_json" value={JSON.stringify(rentalProperties)} />

                    {rentalIncome && (
                        <div className="mt-4 space-y-4">
                            {rentalProperties.map((property, index) => (
                                <div key={property.id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm">Property #{index + 1}</h4>
                                        {rentalProperties.length > 1 && <button type="button" onClick={() => removeProperty(property.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Address" name={`rental_address_${index}`} value={property.address} onChange={(e: any) => updateProperty(property.id, 'address', e.target.value)} />
                                        <InputGroup label="Gross Income" name={`gross_rental_income_${index}`} type="number" value={property.income} onChange={(e: any) => updateProperty(property.id, 'income', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addProperty} className="flex items-center gap-1 text-sm font-semibold text-blue-600"><Plus className="w-4 h-4" /> Add Another Property</button>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="7. Major Credits" color="rose">
                <div className="grid grid-cols-2 gap-4">
                    <CheckboxGroup name="disability_credit" label="Disability Tax Credit (T2201)" defaultChecked={init.disability_credit === true} />
                    <CheckboxGroup name="moving_expenses" label="Moving Expenses (>40km)" defaultChecked={init.moving_expenses === true} />
                    <CheckboxGroup name="medical_expenses" label="Significant Medical Expenses" defaultChecked={init.medical_expenses === true} />
                    <CheckboxGroup name="charitable_donations" label="Charitable Donations" defaultChecked={init.charitable_donations === true} />
                    <CheckboxGroup name="support_payments" label="Support Payments Made/Received" defaultChecked={init.support_payments === true} />
                </div>
            </Section>

            <Section title="8. Certification" color="gray">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="certification" checked={isCertified} onChange={(e) => setIsCertified(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600" />
                    <span className="text-gray-700 font-medium text-sm">Yes, force certify these changes over the user's answers.</span>
                </label>
            </Section>

            <div className='pt-4 pb-8 border-t border-gray-100 flex gap-4'>
                <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting || !isCertified} className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2'>
                    {isSubmitting ? 'Saving...' : <><CheckCircle2 className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </form>
    )
}

function Section({ title, children, color = 'blue' }: { title: string, children: React.ReactNode, color?: string }) {
    return (
        <section className='bg-white border rounded-xl p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100'>{title}</h2>
            {children}
        </section>
    )
}

function InputGroup({ label, name, type = 'text', options, defaultValue, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            {type === 'select' ? (
                <div className="relative">
                    <select name={name} defaultValue={defaultValue} value={value} onChange={onChange} className="w-full h-10 px-3 border rounded-lg appearance-none text-sm">
                        {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            ) : (
                <input type={type} name={name} defaultValue={defaultValue} value={value} onChange={onChange} className="w-full h-10 px-3 border rounded-lg text-sm" />
            )}
        </div>
    )
}

function CheckboxGroup({ name, label, defaultChecked }: { name: string, label: string, defaultChecked?: boolean }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer p-1">
            <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded text-blue-600 border-gray-300" />
            <span className="text-gray-700 text-sm font-medium">{label}</span>
        </label>
    )
}
