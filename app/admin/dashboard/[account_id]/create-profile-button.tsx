import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function CreateProfileButton({ userId }: { userId: string }) {
    return (
        <Link
            href={`/admin/dashboard/${userId}/new-profile`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
            <Plus className="w-4 h-4" />
            Setup Tax Profile
        </Link>
    )
}
