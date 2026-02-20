'use client'

import { useState, useEffect, useRef } from 'react'
import { createTaxProfile } from '@/app/actions/profile-actions'
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete"

interface Props {
    userEmail: string
    year?: number
    onboarding?: boolean
    returnTo?: string
    actionOverride?: (formData: FormData) => void
}

export default function NewProfileForm({ userEmail, year, onboarding, returnTo, actionOverride }: Props) {
    const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear())
    const [sin, setSin] = useState('')
    const [sinTouched, setSinTouched] = useState(false)
    const [phone, setPhone] = useState('')
    const [phoneTouched, setPhoneTouched] = useState(false)
    const [postalCode, setPostalCode] = useState('')

    // Address Sub-fields (for hidden inputs)
    const [city, setCity] = useState('')
    const [province, setProvince] = useState('AB')

    // Address ref for Google Maps
    const addressInputRef = useRef<HTMLInputElement>(null)

    const {
        ready,
        value: addressValue,
        suggestions: { status, data },
        setValue: setAddressValue,
        clearSuggestions,
        init
    } = usePlacesAutocomplete({
        initOnMount: false,
        requestOptions: {
            componentRestrictions: { country: "ca" },
        },
        debounce: 300,
    })

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                init();
                if (interval) clearInterval(interval);
            }
        };
        checkGoogleMaps();
        interval = setInterval(checkGoogleMaps, 100);
        return () => clearInterval(interval);
    }, [init]);

    // DOB States
    const [birthMonth, setBirthMonth] = useState('')
    const [birthDay, setBirthDay] = useState('')
    const [birthYear, setBirthYear] = useState('')

    const handleSinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Block non-numbers and limit to 9 digits
        const val = e.target.value.replace(/\D/g, '').slice(0, 9)
        setSin(val)
        if (val.length > 0) setSinTouched(true)
    }

    const isSinInvalid = sinTouched && sin.length > 0 && sin.length < 9

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clean non-numbers
        let val = e.target.value.replace(/\D/g, '').slice(0, 10)

        if (val.length > 0) setPhoneTouched(true)

        // Apply masking XXX-XXX-XXXX
        if (val.length > 6) {
            val = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`
        } else if (val.length > 3) {
            val = `${val.slice(0, 3)}-${val.slice(3)}`
        }

        setPhone(val)
    }

    const isPhoneInvalid = phoneTouched && phone.length > 0 && phone.replace(/\D/g, '').length < 10

    const handleAddressSelect = async (val: string) => {
        setAddressValue(val, false)
        clearSuggestions()

        try {
            const results = await getGeocode({ address: val })
            const place = results[0]

            if (!place.address_components) return

            let streetNum = ''
            let streetName = ''
            let cityValue = ''
            let provValue = ''
            let postValue = ''

            place.address_components.forEach((comp) => {
                const types = comp.types
                if (types.includes('street_number')) streetNum = comp.long_name
                if (types.includes('route')) streetName = comp.long_name
                if (types.includes('locality')) cityValue = comp.long_name
                if (types.includes('administrative_area_level_1')) provValue = comp.short_name
                if (types.includes('postal_code')) postValue = comp.long_name
            })

            if (streetNum && streetName) {
                setAddressValue(`${streetNum} ${streetName}`, false)
            }

            setCity(cityValue)
            setProvince(provValue)
            setPostalCode(postValue)
        } catch (error) {
            console.error("Error fetching geocode:", error)
        }
    }

    const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Uppercase and limit to 7 chars (A1B 2C3)
        const val = e.target.value.toUpperCase().slice(0, 7)
        setPostalCode(val)
    }

    // Constants for DOB dropdowns
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    // Calculate the date 16 years ago for the year range
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - 16) - i)

    // Formatted DOB string for the hidden input (YYYY-MM-DD)
    const formattedDob = birthYear && birthMonth && birthDay
        ? `${birthYear}-${String(months.indexOf(birthMonth) + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
        : ''

    return (
        <form action={actionOverride || createTaxProfile} className='space-y-6'>
            {/* Hidden DOB Input for server action */}
            <input type="hidden" name="dob" value={formattedDob} />



            {/* ROW 1: Name */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>First Name</label>
                    <input required name='firstName' minLength={2} className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='Legal first name' />
                </div>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Last Name</label>
                    <input required name='lastName' minLength={2} className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='Legal last name' />
                </div>
            </div>

            {/* ROW 2: ID Numbers & DOB */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Social Insurance Number</label>
                    <input
                        required
                        name='sin'
                        value={sin}
                        onChange={handleSinChange}
                        onBlur={() => setSinTouched(true)}
                        placeholder='000 000 000'
                        className={`block w-full rounded-xl shadow-sm py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white focus:ring-2 focus:outline-none ${isSinInvalid
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                    />
                    <p className={`mt-1 text-xs ${isSinInvalid ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {isSinInvalid ? "Please make sure there's 9 digits" : "9 digits (numbers only)"}
                    </p>
                </div>

                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Date of Birth</label>
                    <div className='grid grid-cols-3 gap-2'>
                        <select
                            required
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-2 bg-gray-50 border transition-all hover:bg-white text-sm'
                        >
                            <option value="">Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            required
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-2 bg-gray-50 border transition-all hover:bg-white text-sm'
                        >
                            <option value="">Day</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            required
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-2 bg-gray-50 border transition-all hover:bg-white text-sm'
                        >
                            <option value="">Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <p className='mt-1 text-xs text-gray-400'>Must be 16 or older</p>
                </div>
            </div>

            {/* ROW 3: Status, Phone, Citizenship */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Marital Status</label>
                    <select required name='maritalStatus' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white'>
                        <option value=''>Select...</option>
                        <option value='Single'>Single</option>
                        <option value='Married'>Married</option>
                        <option value='Common-Law'>Common-Law</option>
                        <option value='Separated'>Separated</option>
                        <option value='Divorced'>Divorced</option>
                        <option value='Widowed'>Widowed</option>
                    </select>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Phone Number</label>
                    <input
                        required
                        name='phone'
                        type='tel'
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder='000-000-0000'
                        className={`block w-full rounded-xl shadow-sm py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white focus:ring-2 focus:outline-none ${isPhoneInvalid
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                    />
                    <p className={`mt-1 text-xs ${isPhoneInvalid ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {isPhoneInvalid ? "Please enter a full 10-digit number" : "10 digits (numbers only)"}
                    </p>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Citizenship Status</label>
                    <select required name='isCitizen' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white'>
                        <option value=''>Select...</option>
                        <option value='on'>Canadian Citizen</option>
                        <option value='false'>Not a Canadian Citizen</option>
                    </select>
                </div>
            </div>

            {/* ROW 4: Address */}
            <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Home Address</label>
                <div className='relative'>
                    <input
                        required
                        name='address'
                        value={addressValue}
                        onChange={(e) => {
                            setAddressValue(e.target.value)
                            if (e.target.value === "") {
                                setCity("")
                                setProvince("AB")
                                setPostalCode("")
                            }
                        }}
                        disabled={!ready}
                        minLength={5}
                        placeholder='Start typing your address...'
                        className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white text-lg pr-10'
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    {status === "OK" && (
                        <ul className="absolute z-10 w-full bg-white mt-1 rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                            {data.map(({ place_id, description }) => (
                                <li
                                    key={place_id}
                                    onClick={() => handleAddressSelect(description)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#111] border-b border-gray-50 last:border-0"
                                >
                                    {description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Address Sub-fields (Auto-filled by Google, but editable) */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1.5'>City</label>
                        <input required name='city' value={city} onChange={e => setCity(e.target.value)} className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='City' />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Province</label>
                        <select required name='province' value={province} onChange={e => setProvince(e.target.value)} className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white'>
                            <option value='AB'>AB</option>
                            <option value='BC'>BC</option>
                            <option value='MB'>MB</option>
                            <option value='NB'>NB</option>
                            <option value='NL'>NL</option>
                            <option value='NS'>NS</option>
                            <option value='ON'>ON</option>
                            <option value='PE'>PE</option>
                            <option value='QC'>QC</option>
                            <option value='SK'>SK</option>
                            <option value='NT'>NT</option>
                            <option value='NU'>NU</option>
                            <option value='YT'>YT</option>
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Postal Code</label>
                        <input required name='postalCode' value={postalCode} onChange={e => setPostalCode(e.target.value.toUpperCase().slice(0, 7))} pattern="^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$" title="Please use a valid Canadian format (ex. A1A 1A1)" className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='A1A 1A1' />
                    </div>
                </div>
            </div>

            {/* ROW 5: Footer Actions */}
            <div className='flex items-center justify-end pt-6'>
                <input type='hidden' name='email' value={userEmail} />
                {year && <input type='hidden' name='year' value={year} />}
                {onboarding && <input type='hidden' name='onboarding' value='true' />}
                {returnTo && <input type='hidden' name='returnTo' value={returnTo} />}
                <input type='hidden' name='residencyProvince' value='AB' />

                <button
                    type='submit'
                    className='bg-[#4374D4] text-white text-base font-semibold py-3.5 px-10 rounded-full hover:bg-[#3460b5] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto'
                >
                    Save & Continue
                </button>
            </div>
        </form>
    )
}
