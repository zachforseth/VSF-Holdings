import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FileType, RotateCcw } from 'lucide-react'
import ReviewForm from './review-form'

// Force dynamic because we read searchParams. Also fetching profile.
export const dynamic = 'force-dynamic'

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const params = await searchParams;
    const profileId = params.profileId?.substring(0, 36);

    if (!profileId) redirect('/filing/select-profile');

    // FETCH PROFILE
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('id', profileId)
        .single()

    if (!profile) {
        console.error(`[ReviewPage] Profile lookup failed for ID: ${profileId}`);
        redirect('/filing/select-profile');
    }

    // STATELESS DATA SOURCE
    // We prefer data from URL params (the "Scan Result").
    // If param is missing (e.g. refresh), we force a re-scan by redirecting to processing.
    if (!params.tier || !params.price || !params.detectedForms) {
        redirect(`/filing/intake/processing?profileId=${profileId}`);
    }

    const tier = params.tier;
    const price = parseFloat(params.price);
    const alert = params.alert;
    const needsReview = params.needsReview === 'true';

    // Parse the detected forms JSON
    let detectedForms: any[] = [];
    try {
        detectedForms = JSON.parse(params.detectedForms);
    } catch (e) {
        console.error("Failed to parse detectedForms", e);
    }

    // Generate Scanner Summary
    // Group forms by type for clean display (e.g. "2 x T4")
    const formCounts: { [key: string]: number } = {};
    detectedForms.forEach(f => {
        const type = f.type || 'Unknown';
        formCounts[type] = (formCounts[type] || 0) + 1;
    });

    const summaryItems = Object.entries(formCounts).map(([type, count]) => ({
        type,
        count, // We could map 'T4' -> 'Employment Income (T4)' if desired
    }));

    return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] text-center w-full animate-in fade-in zoom-in duration-500'>

            <div className='max-w-2xl w-full space-y-8'>

                <div>
                    <h1 className='text-[32px] sm:text-4xl font-semibold text-gray-900 tracking-tight leading-tight mb-4'>
                        We found <span className='text-[#3b82f6]'>{detectedForms.length} documents</span>.
                    </h1>
                </div>

                {/* SCANNER SUMMARY BOX */}
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left space-y-4'>
                    <div className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1'>
                        AI DETECTED DOCUMENTS
                    </div>
                    {summaryItems.length === 0 ? (
                        <div className='text-gray-500 italic'>No standard tax forms detected.</div>
                    ) : (
                        <div className='grid grid-cols-1 gap-3'>
                            {summaryItems.map((item, i) => (
                                <div key={i} className='flex items-center justify-between group py-1'>
                                    <div className='flex items-center gap-3'>
                                        <div className='bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0'>
                                            <FileType className='w-5 h-5' />
                                        </div>
                                        <span className='font-normal text-gray-900 text-base leading-relaxed'>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className='bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-base font-medium tabular-nums'>
                                        x{item.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Alert / Transparency Banner */}
                {alert && (
                    <div className='bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm flex items-start gap-3 text-left w-full'>
                        <div className='bg-amber-200 rounded-full p-1 mt-0.5 shrink-0'>
                            <RotateCcw className='w-3 h-3' />
                        </div>
                        <p>{alert}</p>
                    </div>
                )}

                {/* Interactive Form Component */}
                <ReviewForm
                    profileId={profileId}
                    detectedTierName={tier}
                    detectedPrice={price}
                    detectedFormsJson={params.detectedForms}
                    needsReview={needsReview}
                />

            </div>
        </div>
    )
}

