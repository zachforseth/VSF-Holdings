import { redirect } from 'next/navigation'

export default async function FinalApprovalPage() {
    redirect('/dashboard/review')
}
