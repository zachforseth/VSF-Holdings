'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProfile } from '@/app/actions/settings-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteProfileButtonProps {
    profileId: string
    voidChequePath?: string | null
    profileName: string
}

export default function DeleteProfileButton({ profileId, voidChequePath, profileName }: DeleteProfileButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation if inside a link
        e.stopPropagation()

        if (!confirm(`Are you sure you want to delete ${profileName}'s profile? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        const result = await deleteProfile(profileId, voidChequePath)

        if (result.success) {
            toast.success('Profile and associated data permanently removed')
            router.refresh()
        } else {
            toast.error(result.message || 'Failed to delete profile')
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Profile"
        >
            {isDeleting ? (
                <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </button>
    )
}
