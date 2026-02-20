"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { Suspense } from "react";

function PortalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planFromUrl = searchParams.get("plan");
    const [message, setMessage] = useState("Authenticating...");

    useEffect(() => {
        const handleDispatch = async () => {
            try {
                // 1. Check Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    // Not logged in, send back to login
                    router.replace(`/login?plan=${planFromUrl || 'essential'}`);
                    return;
                }

                const user = session.user;
                setMessage(`Welcome, ${user.email}. Setting up your portal...`);

                // 2. Profile Sync / Check
                // We check if a profile exists. The trigger *should* handle creation on INSERT to auth.users,
                // but we might need to update the plan if it was a Google Sign In that didn't pass metadata correctly
                // or if we just want to ensure consistency.

                // Fetch profile
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('role') // users table has 'role', maybe not 'plan' yet, but we want to check existence
                    .eq('id', user.id)
                    .single();

                let finalPlan = planFromUrl || 'essential';

                if (profile) {
                    // Profile exists.
                    // If the user already has metadata, we trust that for plan.
                    if (user.user_metadata?.plan) {
                        finalPlan = user.user_metadata.plan;
                    }
                } else {
                    // Profile doesn't exist (Trigger failed or strictly client-side handling needed)
                    // Insert safety net into public.users
                    console.log('--- PORTAL: CREATING SAFETY NET PROFILE IN users TABLE ---');
                    const { error: insertError } = await supabase.from('users').insert([
                        {
                            id: user.id,
                            email: user.email,
                            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                            avatar_url: user.user_metadata?.avatar_url || '',
                            role: 'client'
                        }
                    ]);
                    if (insertError) {
                        console.error("Profile creation error in public.users:", insertError);
                    }
                }

                // Ensure metadata is consistent too (optional but good for our Route Guard)
                if (user.user_metadata?.plan !== finalPlan) {
                    await supabase.auth.updateUser({
                        data: { plan: finalPlan }
                    });
                }

                // 3. Final Routing
                // Redirect to the Dashboard "Home" context instead of direct upload
                router.replace(`/portal/dashboard`);

            } catch (err) {
                console.error("Dispatch error:", err);
                setMessage("An error occurred. Redirecting...");
                setTimeout(() => router.replace("/login"), 2000);
            }
        };

        handleDispatch();
    }, [router, planFromUrl]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
            <div className="animate-pulse flex flex-col items-center">
                {/* VSF Logo or Loader */}
                <div className="h-8 w-8 bg-[#2952E3] rounded-full mb-4 animate-bounce"></div>
                <p className="text-[#111] font-medium text-lg font-manrope">{message}</p>
            </div>

        </div>
    );
}

export default function PortalDispatcher() {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
            <PortalContent />
        </Suspense>
    )
}
