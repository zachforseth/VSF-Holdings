'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Bell, MessageSquare, User, ChevronDown, LogOut, Menu } from 'lucide-react';

export default function DashboardNavbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
    const [isReviewReady, setIsReviewReady] = useState(false);
    const [reviewTarget, setReviewTarget] = useState('/dashboard/review');
    const [unreadCount, setUnreadCount] = useState(0);
    const [userName, setUserName] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const supabase = React.useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    ), []);

    useEffect(() => {
        let channel: any;

        const initializeNavbar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const nameToDisplay = user.user_metadata?.full_name || user.user_metadata?.name;
            const emailPrefix = user.email ? user.email.split('@')[0] : '';
            setUserName(nameToDisplay || emailPrefix || 'Profile');

            const fetchNavbarData = async () => {
                // Fetch profiles for unread messages AND review status
                const { data: profiles } = await supabase
                    .from('tax_profiles')
                    .select('id, first_name, has_unread_admin_message, filing_status')
                    .eq('user_id', user.id);

                if (profiles) {
                    const unread = profiles.filter((p: any) => p.has_unread_admin_message).length;
                    const readyProfiles = profiles.filter((p: any) => p.filing_status?.toUpperCase() === 'IN_REVIEW');
                    const reviewReady = readyProfiles.length > 0;
                    setUnreadCount(unread);
                    setIsReviewReady(reviewReady);

                    // Smart Link: If only one profile is ready, link directly. Else link to list.
                    if (readyProfiles.length === 1) {
                        setReviewTarget(`/dashboard/review/${readyProfiles[0].id}`);
                    } else {
                        setReviewTarget('/dashboard/review');
                    }
                }
            };

            await fetchNavbarData();

            // Real-time subscription to tax_profiles
            channel = supabase
                .channel('navbar_notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'tax_profiles',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        // Refresh on modification
                        fetchNavbarData().catch(console.error);
                    }
                )
                .subscribe();
        };

        initializeNavbar();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to determine active state
    const isActive = (path: string) => pathname === path;

    // Eagerly hide the unread count when viewing the chat page
    const isChatRoute = pathname.startsWith('/dashboard/chat');
    const displayUnreadCount = isChatRoute ? 0 : unreadCount;

    return (
        <nav className="sticky top-0 z-50 bg-[#FCFCFC]/95 backdrop-blur-md h-24 flex items-center px-6 md:px-12 justify-between">

            {/* Left Group: Logo + Nav Links */}
            <div className="flex items-center gap-12">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex-shrink-0">
                        {/* Brand Logo SVG: Sharp Official Mark */}
                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 38 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                        >
                            <g clipPath="url(#clip0_VSF)">
                                <path d="M11.0787 0H0V38H11.0787V0Z" fill="#4374D4" />
                                <path d="M24.5397 0H13.4609V38H24.5397V0Z" fill="#7297DF" />
                                <path d="M37.9996 0H26.9209V38H37.9996V0Z" fill="#A0B9EA" />
                            </g>
                            <defs>
                                <clipPath id="clip0_VSF">
                                    <rect width="38" height="38" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </Link>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/dashboard"
                        className={`text-[15px] font-bold tracking-tight transition-colors ${isActive('/dashboard') ? 'text-[#333333] border-b-[3px] border-[#333333] pb-[6px]' : 'text-gray-400 hover:text-[#333333]'}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/documents"
                        className={`text-[15px] font-bold tracking-tight transition-colors ${isActive('/documents') ? 'text-[#333333] border-b-[3px] border-[#333333] pb-[6px]' : 'text-gray-400 hover:text-[#333333]'}`}
                    >
                        Documents
                    </Link>
                    <Link
                        href={reviewTarget}
                        className={`text-[15px] font-bold tracking-tight transition-colors flex items-center gap-2 ${isActive('/dashboard/review') ? 'text-[#333333] border-b-[3px] border-[#333333] pb-[6px]' : 'text-gray-400 hover:text-[#333333]'}`}
                    >
                        Review
                        {isReviewReady && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                        )}
                    </Link>
                    <Link
                        href="/dashboard/history"
                        className={`text-[15px] font-bold tracking-tight transition-colors ${isActive('/dashboard/history') ? 'text-[#333333] border-b-[3px] border-[#333333] pb-[6px]' : 'text-gray-400 hover:text-[#333333]'}`}
                    >
                        History
                    </Link>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">

                {/* Date */}
                <div className="text-sm font-medium text-gray-500 mr-2">
                    {today}
                </div>

                {/* Bell Icon */}
                <button className="hidden md:flex w-10 h-10 rounded-full border border-gray-200 items-center justify-center bg-white hover:bg-gray-50 transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-900" strokeWidth={2} />
                    {displayUnreadCount > 0 && (
                        <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    )}
                </button>

                {/* Chat Icon */}
                <Link href="/dashboard/chat" className="hidden md:flex w-10 h-10 rounded-full border border-gray-200 items-center justify-center bg-white hover:bg-gray-50 transition-colors relative">
                    <MessageSquare className="w-5 h-5 text-gray-900" strokeWidth={2} />
                    {displayUnreadCount > 0 && (
                        <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    )}
                </Link>

                {/* Profile Dropdown Wrapper */}
                <div className="relative" ref={dropdownRef}>
                    {/* Toggle Button (Desktop) */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="hidden md:flex h-10 px-2 rounded-full border border-gray-200 items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-900" strokeWidth={2} />
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Toggle Button (Mobile) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-900" strokeWidth={2} />
                    </button>

                    {/* Dropdown Menu (Desktop) */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden text-[14px]">
                            {/* User Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-900" />
                                </div>
                                <span className="font-bold text-gray-900 truncate max-w-[150px]">{userName || 'Profile'}</span>
                            </div>
                            {/* Context Switch */}
                            <div className="py-2 border-b border-gray-100">
                                <Link href="/dashboard" className="block px-4 py-2 text-gray-900 font-bold bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    Personal Tax
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                </Link>
                                <Link href="/dashboard/business" className="block px-4 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                                    Business Tax
                                </Link>
                            </div>
                            {/* Menu Items */}
                            <div className="py-2 border-b border-gray-100 text-gray-700">
                                <Link
                                    href="/dashboard/history"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-50 cursor-pointer w-full text-left"
                                >
                                    Tax History
                                </Link>
                                <Link
                                    href={reviewTarget}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-50 cursor-pointer w-full text-left flex justify-between items-center"
                                >
                                    Review my Return
                                    {isReviewReady && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    )}
                                </Link>
                                <Link
                                    href="/dashboard/chat"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="block px-4 py-2 hover:bg-gray-50 cursor-pointer w-full text-left"
                                >
                                    Chat with my Advisor
                                </Link>
                            </div>

                            {/* Footer */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    )}

                    {/* Dropdown Menu (Mobile) */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden text-[14px]">
                            {/* Pages */}
                            <div className="py-2 border-b border-gray-100">
                                <span className="block px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation</span>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">Home</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/documents" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">Documents</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href={reviewTarget} className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex justify-between items-center">
                                    Review
                                    {isReviewReady && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>}
                                </Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/history" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">History</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/chat" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex justify-between items-center">
                                    Chat with my Advisor
                                    {displayUnreadCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                                </Link>
                            </div>

                            {/* Profile Toggle */}
                            <button onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)} className="w-full flex items-center justify-between px-4 py-3 text-gray-900 border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-900" />
                                    </div>
                                    <span className="font-bold text-gray-900 truncate max-w-[150px]">{userName || 'Profile'}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown Inner */}
                            {isMobileProfileOpen && (
                                <div className="bg-white">
                                    {/* Context Switch */}
                                    <div className="py-2 border-b border-gray-100">
                                        <Link href="/dashboard" className="block px-8 py-2 text-gray-900 font-bold bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                                            Personal Tax
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        </Link>
                                        <Link href="/dashboard/business" className="block px-8 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
                                            Business Tax
                                        </Link>
                                    </div>
                                    {/* Menu Items */}
                                    <div className="py-2 border-b border-gray-100 text-gray-700">
                                        <Link
                                            href="/dashboard/history"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-8 py-2 hover:bg-gray-50 cursor-pointer w-full text-left"
                                        >
                                            Tax History
                                        </Link>
                                        <Link
                                            href={reviewTarget}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-8 py-2 hover:bg-gray-50 cursor-pointer w-full text-left flex justify-between items-center"
                                        >
                                            Review my Return
                                            {isReviewReady && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            )}
                                        </Link>
                                    </div>

                                    {/* Footer */}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-8 py-3 text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
