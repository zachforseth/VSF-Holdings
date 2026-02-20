'use client'

import { useState, useEffect, useRef } from 'react'
import { sendAdminMessage } from '@/app/actions/admin-actions'
import { Send, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AdminChatInterface({
    profileId,
    initialMessages,
    userEmail
}: {
    profileId: string
    initialMessages: any[]
    userEmail: string
}) {
    const [messages, setMessages] = useState<any[]>(Array.isArray(initialMessages) ? initialMessages : [])
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on load and new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Sync with server revalidation
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setMessages(current => {
                const newMessages = [...initialMessages];
                const pendingTemps = current.filter(m => String(m.id).startsWith('temp-') && !newMessages.find(nm => nm.content === m.content));
                return [...newMessages, ...pendingTemps].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
        }
    }, [initialMessages]);

    // Realtime Listener
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel(`chat:${profileId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `profile_id=eq.${profileId}`
                },
                (payload) => {
                    setMessages((current) => {
                        const exists = current.find(m => m.id === payload.new.id || (m.content === payload.new.content && m.is_from_advisor === payload.new.is_from_advisor && Math.abs(new Date(m.created_at || Date.now()).getTime() - new Date(payload.new.created_at).getTime()) < 10000));
                        if (exists) {
                            const tempMsgIndex = current.findIndex(m => String(m.id).startsWith('temp-') && m.content === payload.new.content);
                            if (tempMsgIndex >= 0) {
                                const newArr = [...current];
                                newArr[tempMsgIndex] = payload.new;
                                return newArr;
                            }
                            return current;
                        }
                        return [...current, payload.new]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [profileId])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage.trim();
        setIsSending(true)
        setNewMessage('')

        // Optimistic UI
        const tempId = `temp-${Date.now()}`;
        setMessages(current => [...current, {
            id: tempId,
            profile_id: profileId,
            is_from_advisor: true,
            content: content,
            created_at: new Date().toISOString()
        }]);

        const result = await sendAdminMessage(profileId, content)

        if (!result.success) {
            alert("Failed to send message")
            setMessages(current => current.filter(m => m.id !== tempId))
            setNewMessage(content)
        }

        setIsSending(false)
    }



    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Chat with {userEmail}
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Start the conversation.
                    </div>
                )}

                {messages.map((msg) => {
                    // Start with simple check:
                    // If sender is explicit 'admin', it's admin.
                    // If user_id is null/missing, it's likely admin (system).
                    // If user_id exists, it's the client.
                    const isMe = msg.is_from_advisor === true

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}


            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
                <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}
