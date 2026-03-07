import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { encryptSIN, hashSIN, extractSINLast4, validateSIN } from "../utils/encryption";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Did you set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env?");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("Starting SIN Encryption Migration...");

    // Fetch all profiles that have a SIN but haven't been migrated yet
    // A simple heuristic for unmigrated is looking for plaintext (e.g., no colons)
    // Or just fetch all and check if they contain ':' which is our delimiter

    const { data: profiles, error } = await supabase
        .from("tax_profiles")
        .select("id, sin")
        .not("sin", "is", null)
        .not("sin", "eq", "");

    if (error) {
        console.error("Error fetching profiles:", error);
        process.exit(1);
    }

    console.log(`Found ${profiles.length} profiles to check.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
        const rawSin = (profile.sin || "").trim();
        if (!rawSin) {
            skippedCount++;
            continue;
        }

        // Check if it's already encrypted (ivHex:cipherHex:tagHex)
        if (rawSin.includes(":")) {
            const parts = rawSin.split(":");
            if (parts.length === 3) {
                // Looks encrypted, skip
                skippedCount++;
                continue;
            }
        }

        // Attempt to migrate this plaintext SIN
        try {
            // We log warnings for invalid SINs but still encrypt them so they aren't left plaintext
            if (!validateSIN(rawSin)) {
                console.warn(`[WARNING] Profile ${profile.id} has an invalid SIN format. Migrating anyway.`);
            }

            const encryptedSin = encryptSIN(rawSin);
            const sinLast4 = extractSINLast4(rawSin);
            const sinHash = hashSIN(rawSin);

            const { error: updateError } = await supabase
                .from("tax_profiles")
                .update({
                    sin: encryptedSin,
                    sin_last4: sinLast4,
                    sin_hash: sinHash,
                })
                .eq("id", profile.id);

            if (updateError) {
                console.error(`Error updating profile ${profile.id}:`, updateError);
                errorCount++;
            } else {
                migratedCount++;
                console.log(`Migrated profile ${profile.id}`);
            }
        } catch (e) {
            console.error(`Exception migrating profile ${profile.id}:`, e);
            errorCount++;
        }
    }

    console.log("\nMigration Complete.");
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (Already encrypted or empty): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
}

migrate();
