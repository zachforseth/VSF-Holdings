"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export function NavbarAuth() {
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const plan = session.user.user_metadata?.plan || 'essential';
                setUserPlan(plan);
            }
            setLoading(false);
        };
        checkSession();

        // Optional: Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUserPlan(session.user.user_metadata?.plan || 'essential');
            } else {
                setUserPlan(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null; // Or a skeleton

    if (userPlan) {
        return (
            <Link
                href={`/portal/${userPlan}/upload`}
                className="text-[#111] font-semibold text-sm hover:text-gray-600 transition-colors"
            >
                Dashboard
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className="text-[#111] font-semibold text-sm hover:text-gray-600 transition-colors"
        >
            Log in
        </Link>
    );
}
