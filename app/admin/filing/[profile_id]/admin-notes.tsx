"use client"

import { useState, useEffect, useRef } from 'react'
import { StickyNote, CheckCircle2, Loader2 } from 'lucide-react'
import { updateAdminNotes } from '@/app/actions/admin-actions'

interface AdminNotesProps {
    profileId: string
    initialNotes: string | null
}

export default function AdminNotes({ profileId, initialNotes }: AdminNotesProps) {
    const [notes, setNotes] = useState(initialNotes || '')
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        }
    }, [])

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setNotes(newValue)
        setSaveStatus("saving")

        // Debounce save (auto-save 1 second after user stops typing)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true)
            const res = await updateAdminNotes(profileId, newValue)
            setIsSaving(false)
            if (res.success) {
                setSaveStatus("saved")
                // Reset back to idle after 2 seconds
                setTimeout(() => setSaveStatus("idle"), 2000)
            } else {
                setSaveStatus("idle")
                alert("Failed to save notes: " + res.error)
            }
        }, 1000)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col h-64 overflow-hidden relative">
            <div className="px-4 py-3 border-b border-blue-50 bg-blue-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-blue-500" />
                    Notes
                </h3>
                <div className="text-xs transition-opacity duration-300 flex items-center gap-1 font-medium">
                    {saveStatus === 'saving' && (
                        <span className="text-blue-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="text-green-600 flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                    )}
                    {saveStatus === 'idle' && (
                        <span className="text-gray-400 opacity-0 relative">Idle</span>
                    )}
                </div>
            </div>

            <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Jot down internal notes here! They auto-save and are never seen by the client. Useful for coordinating with other accountants."
                className="flex-1 w-full resize-none p-4 text-sm text-gray-700 focus:outline-none focus:ring-0 border-none bg-blue-50/10 placeholder:text-gray-300"
            />
        </div>
    )
}
