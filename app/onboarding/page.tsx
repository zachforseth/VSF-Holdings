"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import { ArrowRight, X, MapPin, ChevronLeft, ChevronRight, Loader2, AlertCircle, Bitcoin, CreditCard } from "lucide-react";
import Link from "next/link";


// ----------------------------------------------------------------------
// Constants & Logic
// ----------------------------------------------------------------------
const CALGARY_ANCHOR = { lat: 51.0447, lng: -114.0719 }; // Calgary Tower
const MAX_RADIUS_KM = 50;

function getRolling3Days(startDate: Date | null) {
    const days = [];
    let current = startDate ? new Date(startDate) : new Date();

    if (!startDate) {
        current.setDate(current.getDate() + 1);
    }

    while (days.length < 3) {
        if (current.getDay() !== 0) {
            days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

const TIME_SLOTS = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

// ----------------------------------------------------------------------
// Native Places Autocomplete Component
// ----------------------------------------------------------------------
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

const PlacesAutocomplete = ({
    onSelect,
    defaultValue,
}: {
    onSelect: (val: { address: string, lat: number, lng: number, error?: string } | null) => void,
    defaultValue?: string,
}) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
        init
    } = usePlacesAutocomplete({
        initOnMount: false,
        requestOptions: {
            componentRestrictions: { country: "ca" },
        },
        debounce: 300,
    });

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

    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue, false);
        }
    }, [defaultValue, setValue]);

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const place = results[0];
            const { lat, lng } = await getLatLng(place);

            // Geofence checking logic
            if (window.google && window.google.maps && window.google.maps.DistanceMatrixService) {
                const service = new window.google.maps.DistanceMatrixService();
                service.getDistanceMatrix(
                    {
                        origins: [CALGARY_ANCHOR],
                        destinations: [{ lat, lng }],
                        travelMode: window.google.maps.TravelMode.DRIVING,
                        unitSystem: window.google.maps.UnitSystem.METRIC,
                    },
                    (response, status) => {
                        if (status === "OK" && response?.rows[0]?.elements[0]?.status === "OK") {
                            const distanceInMeters = response.rows[0].elements[0].distance.value;
                            const distanceInKm = distanceInMeters / 1000;

                            if (distanceInKm > MAX_RADIUS_KM) {
                                setIsShaking(true);
                                setTimeout(() => setIsShaking(false), 400);

                                onSelect({
                                    address: place.formatted_address || address,
                                    lat,
                                    lng,
                                    error: "Our automated courier service is currently limited to the Greater Calgary Area. Please contact VSF directly to arrange a custom pickup."
                                });
                            } else {
                                onSelect({ address: place.formatted_address || address, lat, lng });
                            }
                        } else {
                            console.warn("Distance Matrix failed");
                            onSelect({ address: place.formatted_address || address, lat, lng });
                        }
                    }
                );
            } else {
                onSelect({ address: place.formatted_address || address, lat, lng });
            }
        } catch (error) {
            console.error("Error fetching geocode:", error);
        }
    };

    return (
        <div className="relative w-full">
            <input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (e.target.value === "") {
                        onSelect(null);
                    }
                }}
                disabled={!ready}
                className={`w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#111] transition-all placeholder:text-gray-400 text-base pr-10 bg-white ${isShaking ? "shake-trigger" : ""}`}
                placeholder="Pickup Address"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            {status === "OK" && (
                <ul className="absolute z-10 w-full bg-white mt-1 rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#111] border-b border-gray-50 last:border-0"
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// Custom Calendar Component
// ----------------------------------------------------------------------
function SimpleCalendar({ onSelect, onClose }: { onSelect: (date: Date) => void, onClose: () => void }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return (
        <div className="p-8 bg-[#FAF9F6] rounded-[24px] border border-gray-100 shadow-xl relative w-[360px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6 w-full justify-center pl-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-manrope font-bold text-lg text-[#111] min-w-[120px] text-center">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-400 hover:text-[#111]"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-7 mb-4 mt-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <span key={d} className={`text-xs font-bold uppercase tracking-wider ${d === 'Su' ? 'text-gray-300' : 'text-gray-400'}`}>{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                {days.map((date, idx) => {
                    if (!date) return <div key={idx} />;

                    const isSunday = date.getDay() === 0;
                    const isPast = date < today;
                    const isDisabled = isSunday || isPast;

                    return (
                        <button
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => {
                                onSelect(date);
                                onClose();
                            }}
                            className={`
                                h-10 w-10 rounded-full text-sm font-medium flex items-center justify-center transition-all mx-auto
                                font-manrope
                                ${isDisabled
                                    ? 'text-gray-200 cursor-default pointer-events-none'
                                    : 'text-[#111] hover:bg-[#2952E3] hover:text-white hover:shadow-md hover:font-bold'}
                            `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div >
    );
}

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------

function CourierScheduler() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || "pro";

    const [loadingAuth, setLoadingAuth] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [paymentUrls, setPaymentUrls] = useState<{ stripe: string, coinbase: string } | null>(null);

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    // Address State
    const [address, setAddress] = useState("");
    const [addressCoords, setAddressCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [addressError, setAddressError] = useState<string | null>(null);

    // Validation State
    const [emailError, setEmailError] = useState<boolean>(false);
    const [phoneError, setPhoneError] = useState<boolean>(false);

    // Helpers
    const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const validatePhone = (val: string) => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 10;
    };

    // Selection State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customDate, setCustomDate] = useState<Date | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [draftJobId, setDraftJobId] = useState<number | null>(null);
    const [packageTier, setPackageTier] = useState<string>("Standard");

    // --- BRUTE FORCE: LOAD PACKAGE FROM URL ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pkg = params.get('package') || params.get('plan');
            if (pkg) {
                console.log("Found package:", pkg);
                // Capitalize first letter
                const tier = pkg.charAt(0).toUpperCase() + pkg.slice(1);
                setPackageTier(tier);
                // Also force it into local storage immediately to persist against reloads
                const saved = localStorage.getItem('vsf_courier_draft');
                let data = saved ? JSON.parse(saved) : {};
                data.packageTier = tier;
                localStorage.setItem('vsf_courier_draft', JSON.stringify(data));
            }
        }
    }, []);

    // --- AUTOSAVE & RESTORE ---
    useEffect(() => {
        // Hydration: Load data on mount
        const saved = localStorage.getItem('vsf_courier_draft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setFullName(data.fullName || "");
                setEmail(data.email || "");
                setPhone(data.phone || "");
                setNotes(data.notes || "");
                setAddress(data.address || "");
                setAddressCoords(data.addressCoords || null);
                setDraftJobId(data.draftJobId || null); // Restore draft ID
                // Only overwrite if not already set by URL param
                setPackageTier(prev => prev !== "Standard" ? prev : (data.packageTier || "Standard"));
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // Autosave: Save on change (only after hydration)
        if (isHydrated) {
            const formData = { fullName, email, phone, notes, address, addressCoords, draftJobId, packageTier };
            localStorage.setItem('vsf_courier_draft', JSON.stringify(formData));
        }
    }, [fullName, email, phone, notes, address, addressCoords, isHydrated, draftJobId, packageTier]);

    // Computed Validation State
    const isFormValid =
        fullName.trim().length >= 2 &&
        validateEmail(email) &&
        validatePhone(phone) &&
        address.trim() !== "" &&
        addressError === null &&
        selectedDate !== null &&
        selectedTime !== null &&
        addressCoords !== null;

    const availableDays = getRolling3Days(customDate);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user) {
                const metaName = session.user.user_metadata?.full_name || "";
                setFullName(metaName);
                setEmail(session.user.email || "");
            }
            setLoadingAuth(false);
        };
        checkAuth();
    }, []);

    const formatDateObj = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCustomDateSelect = (date: Date) => {
        setCustomDate(date);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsCalendarOpen(false);
    };

    const handleAddressSelect = (data: { address: string; lat: number; lng: number, error?: string } | null) => {
        if (!data) {
            setAddress("");
            setAddressCoords(null);
            setAddressError(null);
            return;
        }

        setAddress(data.address);
        setAddressCoords({ lat: data.lat, lng: data.lng });

        if (data.error) {
            setAddressError(data.error);
        } else {
            setAddressError(null);
        }
    };

    const handleProceed = async () => {
        if (!isFormValid) return;
        setSubmitting(true);

        try {
            console.log("Submitting to API...");

            // Format time for backend (Brute Force: Local ISO String)
            const scheduledTime = selectedDate && selectedTime
                ? (() => {
                    const d = new Date(selectedDate);
                    const [timeStr, modifier] = selectedTime.split(' ');
                    let [hours, minutes] = timeStr.split(':');
                    if (hours === '12') hours = '00';
                    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);

                    // Create Local Date components manually to avoid UTC conversion
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const hh = String(hours).padStart(2, '0');
                    const mm = String(minutes).padStart(2, '0');

                    // Return strict local string: "2026-01-27T16:00:00"
                    return `${year}-${month}-${day}T${hh}:${mm}:00`;
                })()
                : null;

            // --- HARD LOCK: ENSURE PACKAGE TIER ---
            // Force-read from URL again just to be absolutely sure
            const currentParams = new URLSearchParams(window.location.search);
            const urlPkg = currentParams.get('package') || currentParams.get('plan');
            const finalTier = packageTier !== "Standard"
                ? packageTier
                : (urlPkg ? (urlPkg.charAt(0).toUpperCase() + urlPkg.slice(1)) : "Standard");

            console.log("Submitting Package Tier:", finalTier);

            // --- CALL API (UPSERT) ---
            // We NO LONGER call Supabase here. The API handles it.
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    draftJobId,
                    fullName,
                    email,
                    phone,
                    notes,
                    address,
                    addressCoords,
                    scheduledTime,
                    packageTier: finalTier // Pass the tier explicitly
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                // ... same error handling ...
                throw new Error(`API Error: ${text}`);
            }

            const { stripeUrl, coinbaseUrl, jobId } = await response.json();

            // Save the ID for future updates (The "Upsert" Magic)
            if (jobId) {
                setDraftJobId(jobId);
            }

            if (!stripeUrl) throw new Error("Payment Error: No stripeUrl returned");

            // Success: Update state to trigger Gateway
            setPaymentUrls({ stripe: stripeUrl, coinbase: coinbaseUrl });

        } catch (err: any) {
            console.error("Proceed Error:", err);
            alert(err.message); // Show exact error to user
            setSubmitting(false);
        }
    };

    return (
        <div className="md:h-screen md:overflow-hidden min-h-screen bg-white font-manrope text-[#111] flex flex-col relative">

            {/* --- LAYER 1: THE FORM (Keep alive in background) --- */}
            <div className={`flex flex-col h-full w-full ${paymentUrls ? "hidden" : "flex"}`}>

                {/* Header (Compact) */}
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex-shrink-0 flex items-center justify-end">
                    <Link href="/">
                        <X className="w-6 h-6 hover:opacity-70 transition cursor-pointer text-[#111]" />
                    </Link>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 pb-6 md:pb-0 flex flex-col md:overflow-hidden">

                    <div className="flex flex-col md:flex-row gap-12 lg:gap-20 flex-1 md:overflow-hidden md:mt-12">

                        {/* LEFT PANEL: Form */}
                        <div className="flex-1 md:overflow-y-auto md:pr-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111] mb-12">
                                Schedule your pick up
                            </h1>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#111] transition-all placeholder:text-gray-400 text-base bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError(false);
                                        }}
                                        onBlur={() => {
                                            if (email && !validateEmail(email)) setEmailError(true);
                                        }}
                                        className={`w-full p-3 rounded-lg border outline-none transition-all placeholder:text-gray-400 text-base bg-white ${emailError ? "border-[#EF4444] text-[#EF4444]" : "border-gray-200 focus:border-[#111]"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (phoneError) setPhoneError(false);
                                        }}
                                        onBlur={() => {
                                            if (phone && !validatePhone(phone)) setPhoneError(true);
                                        }}
                                        className={`w-full p-3 rounded-lg border outline-none transition-all placeholder:text-gray-400 text-base bg-white ${phoneError ? "border-[#EF4444] text-[#EF4444]" : "border-gray-200 focus:border-[#111]"}`}
                                    />
                                </div>

                                {/* GOOGLE PLACES AUTOCOMPLETE */}
                                <div className="space-y-1 relative">
                                    {isHydrated && (
                                        <PlacesAutocomplete
                                            onSelect={handleAddressSelect}
                                            defaultValue={address}
                                        />
                                    )}
                                    {/* Geofence Error */}
                                    {addressError && (
                                        <p className="text-[#EF4444] text-[13px] font-medium mt-2 animate-fadeIn">
                                            {addressError}
                                        </p>
                                    )}
                                </div>

                                <textarea
                                    placeholder="Gate code / Courier Notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#111] transition-all placeholder:text-[#111] text-base min-h-[100px] md:min-h-[120px] resize-none bg-white"
                                />
                            </div>
                        </div>

                        {/* RIGHT PANEL: Calendar */}
                        <div className="flex-1 md:border-l border-gray-100 md:pl-12 lg:pl-20 flex flex-col md:overflow-y-auto">
                            <h3 className="text-[15px] font-medium mb-6 max-w-sm flex-shrink-0">
                                Select a date and time when you’d like to have VSF pick up your documents.
                            </h3>

                            <div className="space-y-6 flex-1">
                                {availableDays.map((day, dayIndex) => (
                                    <div key={dayIndex}>
                                        <h4 className="text-sm font-bold mb-2 text-[#111]">
                                            {formatDateObj(day)}
                                        </h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {TIME_SLOTS.map((time, timeIndex) => {
                                                const isSelected = selectedDate?.getDate() === day.getDate() && selectedTime === time;
                                                return (
                                                    <button
                                                        key={timeIndex}
                                                        onClick={() => {
                                                            setSelectedDate(day);
                                                            setSelectedTime(time);
                                                        }}
                                                        className={`
                                                        py-2 px-1 rounded-full text-[10px] font-bold border transition-all truncate
                                                        ${isSelected
                                                                ? 'bg-[#111] border-[#111] text-white'
                                                                : 'bg-white border-gray-200 text-[#111] hover:bg-gray-50'}
                                                    `}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2 pb-6 text-left">
                                    <h4 className="text-sm font-bold mb-2 text-[#111]">Need another time?</h4>

                                    <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <DialogTrigger asChild>
                                            <button
                                                className={`
                                                flex items-center gap-2 py-2 px-4 rounded-full text-[11px] font-bold border transition-colors cursor-pointer w-auto select-none
                                                bg-white border-gray-200 text-[#111] 
                                                hover:bg-gray-50
                                                active:bg-gray-100
                                                focus:outline-none focus:ring-2 focus:ring-gray-200
                                                group
                                            `}
                                            >
                                                <span>Select another date</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-gray-400 group-hover:text-[#111]" />
                                            </button>
                                        </DialogTrigger>

                                        <DialogContent className="p-0 border-0 bg-transparent shadow-none w-auto max-w-xs focus:outline-none [&>button]:hidden">
                                            <SimpleCalendar
                                                onSelect={handleCustomDateSelect}
                                                onClose={() => setIsCalendarOpen(false)}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    {customDate && (
                                        <button
                                            onClick={() => {
                                                setCustomDate(null);
                                                setSelectedDate(null);
                                            }}
                                            className="block text-[10px] text-gray-400 underline mt-2 hover:text-[#111] transition"
                                        >
                                            Reset to standard schedule
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section: Payment (Centered below both panels) */}
                    <div className="mt-8 mb-12 py-8 flex flex-col items-center justify-center flex-shrink-0 w-full">
                        <div className="flex flex-row items-center gap-4 mb-6">
                            <span className="text-base font-medium text-[#111]">Courier Fee:</span>
                            <span className="text-xl font-medium text-[#111]">$50.00</span>
                        </div>

                        <Button
                            onClick={handleProceed}
                            disabled={submitting || !isFormValid}
                            className={`
                                rounded-full px-12 py-6 text-[15px] font-medium transition-all duration-300
                                ${isFormValid
                                    ? "bg-[#4270f2] text-white hover:bg-blue-600 shadow-sm"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"}
                            `}
                        >
                            {submitting ? "Processing..." : "Proceed to payment"}
                        </Button>
                    </div>

                </main>
            </div>

            {/* --- LAYER 2: THE PAYMENT GATEWAY (The Blanket) --- */}
            <div className={`${paymentUrls ? "flex" : "hidden"} fixed inset-0 z-50 bg-white animate-in fade-in duration-300 overflow-y-auto flex-col`}>

                {/* Header */}
                <div className="w-full flex justify-between items-center px-8 py-6 relative">
                    {/* Top Left: Back */}
                    <button
                        onClick={() => {
                            setPaymentUrls(null);
                            setSubmitting(false);
                        }}
                        className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-700 transition-colors"
                    >
                        Back
                    </button>

                    {/* Top Right: Close */}
                    <button
                        onClick={() => {
                            if (confirm("Cancel payment process?")) {
                                setPaymentUrls(null);
                                setSubmitting(false);
                            }
                        }}
                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl font-bold tracking-tight text-center text-black mt-8 mb-24">
                    Select Payment Method
                </h1 >

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[750px] mx-auto px-4 w-full">

                    {/* LEFT COLUMN: PAY BY CARD */}
                    <div className="flex flex-col items-center">
                        {/* Visual Card */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[340px] w-[340px]">
                            <h2 className="text-2xl font-bold text-black mb-2">Pay by Card</h2>
                            <p className="text-gray-500 text-[13px] leading-relaxed mb-5 px-1 max-w-[300px] mx-auto">
                                Pay securely using your credit or debit card, Apple Pay, Google Pay, or Klarna.
                            </p>

                            {/* Logo Cluster */}
                            <img
                                src="/logos/fiat-cluster.png"
                                alt="Payment Methods"
                                className="w-52 h-auto mb-5 mt-2 object-contain"
                            />

                            <button
                                onClick={() => paymentUrls?.stripe && (window.location.href = paymentUrls.stripe)}
                                className="w-full bg-[#4F62D6] text-[13px] font-semibold text-white py-3 rounded-xl hover:opacity-90 transition-opacity mt-auto shadow-sm"
                            >
                                Continue with secure checkout
                            </button>
                        </div>

                        {/* Powered By Footer (Outside) */}
                        <div className="mt-5 flex items-center justify-center gap-1.5">
                            <span className="text-xs text-gray-500 font-medium">Powered by</span>
                            <img src="/logos/stripe.png" alt="Stripe" className="h-5 opacity-90 relative top-[1px]" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PAY WITH CRYPTO */}
                    <div className="flex flex-col items-center">
                        {/* Visual Card */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[340px] w-[340px]">
                            <h2 className="text-2xl font-bold text-black mb-2">Pay with Crypto</h2>
                            <p className="text-gray-500 text-[13px] leading-relaxed mb-5 px-1">
                                Pay securely using Bitcoin, Ethereum,<br /> or other supported cryptocurrencies.
                            </p>

                            {/* Logo Cluster */}
                            <img
                                src="/logos/crypto-cluster.png"
                                alt="Crypto Tokens"
                                className="w-52 h-auto mb-5 -mt-1 object-contain"
                            />

                            <button
                                onClick={() => paymentUrls?.coinbase && (window.location.href = paymentUrls.coinbase)}
                                className="w-full bg-[#4F62D6] text-[13px] font-semibold text-white py-3 rounded-xl hover:opacity-90 transition-opacity mt-auto shadow-sm"
                            >
                                Continue with secure checkout
                            </button>
                        </div>

                        {/* Powered By Footer (Outside) */}
                        <div className="mt-5 flex items-baseline justify-center gap-1.5">
                            <span className="text-xs text-gray-500 font-medium">Powered by</span>
                            <img src="/logos/coinbase.png" alt="Coinbase" className="h-3 opacity-90" />
                        </div>
                    </div>

                </div>

                {/* Global Footer */}
                <div className="w-full text-center mt-auto mb-10 px-6">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal max-w-md mx-auto">
                        All payments are encrypted and processed securely by <span className="font-semibold text-gray-900">Stripe</span> or <span className="font-semibold text-gray-900">Coinbase</span>.
                        <br />
                        <span className="italic font-light text-gray-400 opacity-80 block mt-2">
                            *Note: The $50.00 fee covers the secure document courier and intake process only.
                            Tax filing and structuring services will be quoted and invoiced separately after assessment.*
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CourierScheduler />
        </Suspense>
    );
}
