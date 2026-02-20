'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowUp, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { sendClientMessage } from '@/app/actions/chat-actions';
import { useRouter, useSearchParams } from 'next/navigation';

type Message = {
    id: number | string;
    content: string;
    created_at: string;
    user_id: string | null;
    profile_id?: string;
    is_from_advisor?: boolean;
};

import { Suspense } from 'react';

function ChatContent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();

    // Sidebar State
    const [profiles, setProfiles] = useState<any[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Auto-fill inquiry if parameter present
    useEffect(() => {
        const inquiryType = searchParams.get('inquiry');
        if (inquiryType === 'business') {
            setInputText("I would like to inquire about opening a business account to file for my corporation.");
        }
    }, [searchParams]);

    // 1. Fetch User & Profiles
    useEffect(() => {
        const initChat = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch Profiles
            const { data: userProfiles } = await supabase
                .from('tax_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (userProfiles) {
                setProfiles(userProfiles);
                // Set active to first one if none selected
                if (userProfiles.length > 0 && !activeProfileId) {
                    setActiveProfileId(userProfiles[0].id);
                }
            }
        };

        initChat();
    }, []);

    // 2. Fetch Messages when activeProfileId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!userId || !activeProfileId) return;

            setMessages([]); // Clear previous messages to avoid bleeding

            const { data: profileMessages, error } = await supabase
                .from('messages')
                .select('*')
                // .eq('user_id', userId) // REMOVE: Admin messages don't have user_id
                .eq('profile_id', activeProfileId) // STRICT FILTER
                .order('created_at', { ascending: true });

            if (profileMessages) {
                setMessages(profileMessages as any);
            }

            // MARK AS READ for this profile
            await supabase
                .from('messages')
                .update({ is_read: true })
                // .eq('user_id', userId) // REMOVE: Admin messages don't have user_id
                .eq('profile_id', activeProfileId)
                .eq('is_from_advisor', true)
                .eq('is_read', false);

            // MARK PROFILE AS READ (Clear Notification)
            await supabase
                .from('tax_profiles')
                .update({ has_unread_admin_message: false })
                .eq('id', activeProfileId)
                .eq('has_unread_admin_message', true);
        };

        fetchMessages();

        // 3. Real-time Subscription scoped to Profile
        const channel = supabase
            .channel(`chat_${activeProfileId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `profile_id=eq.${activeProfileId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    if (newMsg.profile_id === activeProfileId) {
                        setMessages((prev) => {
                            const exists = prev.find(m => m.id === newMsg.id || (m.content === newMsg.content && Math.abs(new Date(m.created_at || Date.now()).getTime() - new Date(newMsg.created_at).getTime()) < 10000));
                            if (exists) {
                                const tempMsgIndex = prev.findIndex(m => String(m.id).startsWith('temp-') && m.content === newMsg.content);
                                if (tempMsgIndex >= 0) {
                                    const newArr = [...prev];
                                    newArr[tempMsgIndex] = newMsg;
                                    return newArr;
                                }
                                return prev;
                            }
                            return [...prev, newMsg];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, activeProfileId]); // Re-run when profile changes

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !userId || !activeProfileId) return;

        const content = inputText.trim();
        setInputText('');

        // Optimistic UI
        const tempId = `temp-${Date.now()}`;
        setMessages(current => [...current, {
            id: tempId,
            profile_id: activeProfileId,
            user_id: userId,
            is_from_advisor: false,
            content: content,
            created_at: new Date().toISOString()
        }]);

        const result = await sendClientMessage(activeProfileId, content);

        if (!result.success) {
            console.error('Error sending message:', result.error);
            alert('Failed to send message');
            setMessages(current => current.filter(m => m.id !== tempId));
            setInputText(content);
        }
    };

    // Helper to format time
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-[#FCFCFC] h-[calc(100vh-6rem)] px-4 md:px-8 py-4">
            <div className="max-w-7xl mx-auto h-full flex gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* --- LEFT SIDEBAR (THREADS) --- */}
                {/* Simplified for Initial Version: Just one main thread context */}
                <div className="w-80 border-r border-gray-100 flex flex-col hidden md:flex bg-gray-50/30">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100 flex-none">
                        <div className="flex items-center justify-between pb-2">
                            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* Always show "General Inquiry" or "All Messages" if needed, but per request showing Profiles */}
                        {profiles.length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-sm">No profiles found.</div>
                        )}
                        {profiles.map((profile) => {
                            // Logic to find last message for this profile (if we link messages to profile_id in future)
                            // For now, we arguably just show the global last message or specific if available.
                            // The user said: "Preview: Display the most recent message content... for each profile."
                            // Since we assume messages *might* have profile_id, we filter. If not, we show generic?
                            // Current Schema Check for profile_id failed. I'll filter by user_id for now for ALL profiles as a fallback?
                            // OR better: Just show the same last message for all, or filter if profile_id is present in message.

                            // Let's TRY to filter messages by profile.id if profile_id exists in message.
                            const profileMessages = messages.filter(m => m.profile_id === profile.id);
                            const lastMsg = profileMessages.length > 0 ? profileMessages[profileMessages.length - 1] : null;

                            // If no profile_id in messages, this might be empty. 
                            // Fallback: If no generic messages, maybe show "Start chat..."

                            const isActive = activeProfileId === profile.id;

                            return (
                                <button
                                    key={profile.id}
                                    onClick={() => setActiveProfileId(profile.id)}
                                    className={`w-full text-left p-3 rounded-xl transition-all shadow-sm mb-2 ${isActive
                                        ? 'bg-blue-50 border border-blue-100'
                                        : 'bg-white border border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-semibold text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {profile.first_name} {profile.last_name}
                                        </span>
                                        {lastMsg && (
                                            <span className="text-xs text-gray-400">{formatTime(lastMsg.created_at)}</span>
                                        )}
                                    </div>
                                    <p className={`text-xs line-clamp-1 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                                        {lastMsg ? lastMsg.content : 'Start a conversation...'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- RIGHT AREA (CHAT) --- */}
                <div className="flex-1 flex flex-col h-full bg-white">

                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-none bg-white">
                        <div className="flex items-center gap-4">
                            <div className="md:hidden">
                                <Link href="/dashboard" className="p-2 -ml-2 text-gray-500">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="relative flex-none">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 text-sm">
                                    {activeProfileId
                                        ? profiles.find(p => p.id === activeProfileId)?.first_name?.charAt(0) || '?'
                                        : '?'
                                    }
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-bold text-gray-900 text-base leading-tight">
                                    {activeProfileId
                                        ? `Chatting about ${profiles.find(p => p.id === activeProfileId)?.first_name || 'Profile'}`
                                        : 'Select a Profile'
                                    }
                                </h3>
                                {/* <span className="text-xs text-green-600 font-medium">Online</span> */}
                            </div>
                        </div>
                        {/* <div className="flex items-center gap-4 text-gray-400">
                            <button className="hover:text-gray-600 transition-colors"><Phone className="w-5 h-5" /></button>
                            <button className="hover:text-gray-600 transition-colors"><Video className="w-5 h-5" /></button>
                        </div> */}
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FCFCFC]/30">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 py-10 space-y-2">
                                <p>No messages yet. Start the conversation below!</p>
                                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <p className="text-xs text-blue-700 font-bold uppercase tracking-widest">Protected by Human-Verified AI Audit</p>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, index) => {
                            // Logic: If is_from_advisor is true, it's NOT the user.
                            // If is_from_advisor is missing/false, assume it IS the user (legacy/default).
                            const isUser = !msg.is_from_advisor;
                            return (
                                <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isUser
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
                                        }`}>
                                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-gray-100 flex-none bg-[#FCFCFC]">
                        <form onSubmit={handleSendMessage} className="flex gap-3 items-center max-w-4xl mx-auto py-2">
                            {/* <button type="button" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                                <Paperclip className="w-5 h-5" />
                            </button> */}
                            <div className="flex-1 bg-gray-50 rounded-full px-5 py-3 flex items-center gap-2 transition-all border border-gray-100 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-blue-50/50">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    // Handle Enter to send
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder="Message your advisory team (Human-Verified AI Audit active)"
                                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex-none flex items-center justify-center transform active:scale-95"
                            >
                                <ArrowUp className="w-5 h-5 stroke-[3px]" />
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    )
}
