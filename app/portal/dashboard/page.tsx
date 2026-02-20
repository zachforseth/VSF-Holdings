"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Settings, Upload, MapPin, Truck, AlertCircle, Clock, CheckCircle, ArrowRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type ServiceMode = 'online' | 'dropoff' | 'pickup';
type PaymentStatus = 'unpaid' | 'paid';

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [plan, setPlan] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    // New functionality state
    const [serviceMode, setServiceMode] = useState<ServiceMode>('online');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
    const [dropoffStatus, setDropoffStatus] = useState<'pending' | 'received'>('pending');
    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupError, setPickupError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContext = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setPlan(session.user.user_metadata?.plan || 'essential');
                setUserEmail(session.user.email || null);
            }
            setLoading(false);
        };
        fetchContext();
    }, []);

    const handlePlanSwitch = async (newPlan: string) => {
        setIsSwitching(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('users').update({ plan: newPlan }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { plan: newPlan } });
            setPlan(newPlan);
            setIsSwitching(false);
        }
    };

    const handlePickupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickupAddress.toLowerCase().includes("calgary")) {
            setPickupError("Pickup service is currently only available in Calgary.");
            return;
        }
        setPickupError(null);
        alert("Pickup Scheduled! (Simulation)");
    };

    const scrollToUploads = () => {
        const element = document.getElementById('upload-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const isPro = plan === 'pro';
    const isPlus = plan === 'plus';
    const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Essential';

    // ----------------------------------------------------------------------
    // View Components
    // ----------------------------------------------------------------------

    /** Render Welcome Hero (Minimalist) */
    const renderWelcomeHero = () => (
        <div className="mb-24">
            <h1 className="text-5xl md:text-6xl font-bold font-manrope text-[#111] mb-8 tracking-tight">
                Welcome,<br />
                <span className="text-gray-400">{userEmail?.split('@')[0] || 'Client'}.</span>
            </h1>

            <div className="flex flex-col items-start gap-6">
                <Button
                    onClick={scrollToUploads}
                    className="bg-[#111] text-white hover:bg-gray-800 rounded-full px-8 py-7 text-lg font-medium transition-all"
                >
                    Continue your {planName} Filing
                </Button>

                {/* Subtle Plan Switcher */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-sm font-medium text-gray-400 hover:text-[#111] transition-colors flex items-center gap-2">
                            Switch to a different plan
                        </button>
                    </DialogTrigger>
                    {/* Reuse Dialog Content Logic */}
                    <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white text-black p-6 rounded-xl max-w-md w-full z-[100]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold mb-4">Select Plan Tier</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3">
                            <Button
                                variant={plan === 'essential' ? "secondary" : "outline"}
                                onClick={() => handlePlanSwitch('essential')}
                                disabled={isSwitching}
                                className="justify-between h-auto py-4 w-full"
                            >
                                <span>Essential ($150)</span>
                                {plan === 'essential' && <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant={plan === 'plus' ? "secondary" : "outline"}
                                onClick={() => handlePlanSwitch('plus')}
                                disabled={isSwitching}
                                className="justify-between h-auto py-4 w-full"
                            >
                                <span>Plus ($250)</span>
                                {plan === 'plus' && <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant={plan === 'pro' ? "secondary" : "outline"}
                                onClick={() => handlePlanSwitch('pro')}
                                disabled={isSwitching}
                                className="justify-between h-auto py-4 w-full"
                            >
                                <span>Pro ($350)</span>
                                {plan === 'pro' && <CheckCircle className="w-4 h-4" />}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );

    /** Render Minimalist Mode Switcher */
    const renderModeSwitcher = () => (
        <div className="flex items-center gap-8 border-b border-gray-100 pb-px mb-12 overflow-x-auto">
            <button
                onClick={() => setServiceMode('online')}
                className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${serviceMode === 'online' ? 'text-[#111] border-b-2 border-[#111]' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Online Upload
            </button>
            <button
                onClick={() => setServiceMode('dropoff')}
                className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${serviceMode === 'dropoff' ? 'text-[#111] border-b-2 border-[#111]' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Office Drop-off
            </button>
            <button
                onClick={() => setServiceMode('pickup')}
                className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${serviceMode === 'pickup' ? 'text-[#111] border-b-2 border-[#111]' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Courier Pickup
            </button>
        </div>
    );

    /** Render Content based on Mode */
    const renderModeContent = () => {
        // 1. ONLINE UPLOAD MODE
        if (serviceMode === 'online') {
            if (isPro) {
                return (
                    <div id="upload-section" className="w-full bg-white rounded-xl border border-gray-200 p-12 md:p-24 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-300 transition duration-300">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-4" />
                        <h3 className="text-lg font-bold text-[#111] mb-2">Bulk Upload</h3>
                        <p className="text-gray-500 text-sm mb-6">Drag corporate files here.</p>
                        <Button variant="outline" className="rounded-full px-6">Select Files</Button>
                    </div>
                );
            }
            if (isPlus) {
                return (
                    <div id="upload-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5].map((slot) => (
                            <div key={slot} className="bg-white rounded-lg p-8 border border-gray-200 flex flex-col items-center justify-center text-center h-[200px] hover:border-gray-400 transition cursor-pointer">
                                <span className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-widest">Receipt {slot}</span>
                                <Upload className="w-5 h-5 text-gray-400" />
                            </div>
                        ))}
                    </div>
                );
            }
            // Essential
            return (
                <div id="upload-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                    <div className="bg-white rounded-lg p-10 border border-gray-200 flex flex-col items-center justify-center text-center h-[240px] hover:border-gray-400 transition cursor-pointer">
                        <span className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-widest">Primary</span>
                        <h3 className="font-bold text-[#111] mb-2 text-lg">Upload T4</h3>
                        <p className="text-sm text-gray-400">PDF or Image</p>
                    </div>
                    <div className="bg-white rounded-lg p-10 border border-gray-200 flex flex-col items-center justify-center text-center h-[240px] hover:border-gray-400 transition cursor-pointer">
                        <span className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-widest">Supporting</span>
                        <h3 className="font-bold text-[#111] mb-2 text-lg">Receipt</h3>
                        <p className="text-sm text-gray-400">One additional file</p>
                    </div>
                </div>
            );
        }

        // 2. DROP-OFF MODE
        if (serviceMode === 'dropoff') {
            return (
                <div className="p-8 border border-gray-200 rounded-lg max-w-xl">
                    <div className="flex items-start gap-4 mb-8">
                        <MapPin className="w-5 h-5 text-[#111] mt-1" />
                        <div>
                            <h3 className="font-bold text-[#111] mb-2">Calgary Office</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                VSF Capital Holdings<br />
                                888 3rd Street SW, Suite 1000<br />
                                Calgary, AB T2P 5C5
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Status</span>
                        <span className={`text-sm font-bold ${dropoffStatus === 'received' ? 'text-green-600' : 'text-amber-600'}`}>
                            {dropoffStatus === 'received' ? 'Received' : 'Pending Drop-off'}
                        </span>
                    </div>
                    {/* Sim Toggle */}
                    <button onClick={() => setDropoffStatus(dropoffStatus === 'pending' ? 'received' : 'pending')} className="mt-4 text-xs text-gray-300 hover:text-gray-500">
                        Toggle Status
                    </button>
                </div>
            );
        }

        // 3. PICKUP MODE
        if (serviceMode === 'pickup') {
            return (
                <div className="max-w-lg">
                    <form onSubmit={handlePickupSubmit}>
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pickup Address</label>
                            <input
                                type="text"
                                placeholder="Enter your full address"
                                className="w-full py-4 bg-transparent border-b border-gray-200 text-lg outline-none focus:border-[#111] placeholder:text-gray-300 transition-colors"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                required
                            />
                        </div>
                        {pickupError && (
                            <p className="text-red-500 text-sm mb-6">{pickupError}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-500">
                                Courier Fee: <span className="text-[#111]">$50.00</span>
                            </div>
                            <Button type="submit" className="bg-[#111] text-white rounded-full px-8 py-6 font-bold hover:bg-gray-800">
                                Schedule
                            </Button>
                        </div>
                    </form>
                </div>
            );
        }
    };

    return (
        <div className="w-full">
            {renderWelcomeHero()}

            {/* Payment / Retention Banner */}
            {paymentStatus === 'unpaid' && (
                <div className="bg-[#FAF9F6] border-l-2 border-amber-500 p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#111]">Payment Action Required</p>
                        <p className="text-sm text-gray-500">Documents retained for 7 days. Pay now to lock filling.</p>
                    </div>
                    <Button variant="ghost" onClick={() => setPaymentStatus('paid')} className="text-amber-600 font-bold hover:bg-amber-50">
                        Pay Now
                    </Button>
                </div>
            )}

            {renderModeSwitcher()}

            <div className={`transition-opacity duration-500 ${paymentStatus === 'unpaid' && serviceMode === 'online' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                {renderModeContent()}
            </div>

        </div>
    );
}
