import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const plaidClientId = process.env.PLAID_CLIENT_ID;
        const plaidSecret = process.env.PLAID_SECRET;

        if (!plaidClientId || !plaidSecret) {
            console.error("Missing Plaid Environment Variables");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const configuration = new Configuration({
            basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': plaidClientId,
                    'PLAID-SECRET': plaidSecret,
                },
            },
        });

        const plaidClient = new PlaidApi(configuration);

        // Get the User ID to pass to Plaid (for their internal logging/identity)
        const clientUserId = user.id

        const requestData = {
            user: { client_user_id: clientUserId },
            client_name: 'VSF Capital',
            products: [Products.Auth], // Auth only as requested
            country_codes: [CountryCode.Ca], // Canada only
            language: 'en',
        }

        const createTokenResponse = await plaidClient.linkTokenCreate(requestData)

        return NextResponse.json(createTokenResponse.data)
    } catch (error: any) {
        console.error('Error creating Plaid Link Token:', error.response?.data || error.message)
        return NextResponse.json(
            { error: error.response?.data?.error_message || 'Failed to create link token' },
            { status: 500 }
        )
    }
}
