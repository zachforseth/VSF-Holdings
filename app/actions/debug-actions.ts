'use server'
import { createClient } from '@/utils/supabase/server'
import { calculateTier } from '@/utils/google-ai'

export async function debugProfileTier(profileId: string) {
    const supabase = await createClient()
    
    // Clean ID
    const cleanId = profileId.substring(0, 36)

    const { data: profile, error } = await supabase
        .from('tax_profiles')
        .select('id, intake_responses, detected_forms, final_fee')
        console.log('Profile Search ID:', cleanId)

    if (error || !profile) {
        console.error('Debug: Profile not found', error)
        return { error: 'Profile not found' }
    }
    
    // Find the specific profile or just take the first one if listing all (dangerous, let's select specific)
    const p = await supabase.from('tax_profiles').select('*').eq('id', cleanId).single();
    
    if (p.error) {
         console.log("Could not find profile with ID:", cleanId);
         return;
    }

    const forms = p.data.detected_forms || [];
    const formTypes = forms.map((f: any) => f.type);
    
    console.log('--- DEBUG TIER CALCULATION ---');
    console.log('Profile ID:', p.data.id);
    console.log('Current Final Fee:', p.data.final_fee);
    console.log('Detected Forms (Raw):', JSON.stringify(forms, null, 2));
    console.log('Intake Responses:', JSON.stringify(p.data.intake_responses, null, 2));
    
    const calculation = calculateTier(formTypes, p.data.intake_responses);
    console.log('Re-calculated Tier:', calculation);
    console.log('------------------------------');
    
    return {
        currentFee: p.data.final_fee,
        forms: formTypes,
        calculation
    }
}
