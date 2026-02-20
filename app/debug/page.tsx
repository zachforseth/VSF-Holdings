import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Only allow you to see this if logged in
    if (!user) redirect('/login')

    const { data: profiles, error } = await supabase
        .from('tax_profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace' }}>
            <h1 style={{ marginBottom: '20px' }}>Database Debugger (Raw View)</h1>
            <p style={{ color: '#666' }}>Logged in as: {user.email}</p>

            {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '12px' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f4f4f4' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>First Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Year</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Payment ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Profile ID</th>
                    </tr>
                </thead>
                <tbody>
                    {profiles?.map((p) => (
                        <tr key={p.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.first_name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: p.filing_status === 'paid' ? 'green' : 'orange' }}>
                                {p.filing_status}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.filing_year}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>${p.quoted_price}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.payment_id || 'NULL'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: '#888' }}>{p.id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
