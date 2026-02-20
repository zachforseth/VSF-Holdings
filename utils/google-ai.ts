import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';

// Initialize Vertex AI Prediction Client
// Use the local JSON key file for authentication
const client = new PredictionServiceClient({
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    keyFilename: 'google-credentials.json'
});

// Vertex AI Configuration
const PROJECT_ID = process.env.VERTEX_PROJECT_ID || 'vsf-tax-ai'; // Fallback for safety, but env var is preferred
const LOCATION = 'us-central1';
const ENDPOINT_ID = process.env.VERTEX_ENDPOINT_ID || '7274015986133499904';
const ENDPOINT_NAME = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

// LOGGING FOR DEBUGGING
console.log(`[VertexAI] Initialized. Endpoint: ${ENDPOINT_NAME}`);

// Heuristic Helper
function inferTypeFromFilename(filename: string): string | null {
    // Normalize: Replace separators with spaces so \b works
    // "WS_T5.pdf" -> "ws t5 pdf"
    const name = filename.toLowerCase().replace(/[_.-]/g, ' ');

    // Explicit Forms
    if (/\bt4a\b/.test(name)) return 'T4A';
    if (/\bt4e\b/.test(name)) return 'T4E';
    if (/\bt4\b/.test(name)) return 'T4';
    if (/\bt5008\b/.test(name)) return 'T5008';
    if (/\bt3\b/.test(name)) return 'T3'; // Added T3
    if (/\bt5\b/.test(name)) return 'T5';
    if (/\bt2202\b/.test(name)) return 'T2202';
    if (/\bt1135\b/.test(name)) return 'T1135';
    if (/\bt776\b/.test(name)) return 'T776';
    if (/\bt2125\b/.test(name)) return 'T2125';
    if (/\bt2042\b/.test(name)) return 'T2042';

    if (/\bt2200\b/.test(name)) return 'T2200'; // Added T2200

    // Common Keywords - Specific Types
    if (/(noa|assessment)/.test(name)) return 'NOA';

    // Receipt Breakdown
    if (/(medical|teeth|dental|physio|chiro)/.test(name)) return 'MEDICAL_RECEIPT';
    if (/(donation|charity|gift)/.test(name)) return 'DONATION_RECEIPT';
    if (/(rrsp|contribution|retirement)/.test(name)) return 'RRSP_RECEIPT';

    // Crypto
    if (/(crypto|trading|coins|koinly|wealthsimple crypto)/.test(name)) return 'CRYPTO_REPORT';

    // Fallback generic
    if (/(receipt)/.test(name)) return 'RECEIPT';

    return null;
}

export async function classifyDocument(fileBuffer: Buffer, mimeType: string, fileName: string) {
    // 0. HEURISTIC OVERRIDE
    // If the filename strongly suggests a type, trust it over the model (until model is retrained).
    // This fixes issues where "T5" is misclassified as "T1135".
    const inferredType = inferTypeFromFilename(fileName);
    if (inferredType) {
        console.log(`[VertexAI] Heuristic Match for '${fileName}': ${inferredType}`);
        return {
            entities: [{
                type: inferredType,
                confidence: 1.0,
                raw_text: '',
                source_file: fileName
            }],
            confidence: 1.0
        };
    }

    console.log(`[VertexAI] Classifying ${fileName} (${mimeType})...`);

    try {
        // 1. Prepare Input for Vertex AI
        // Vertex AI Custom/AutoML models typically expect:
        // { content: "base64_string" } or { image_bytes: { b64: "..." } } depending on the model.
        // For standard AutoML Vision (Image Classification), it often expects:
        // { content: "base64_string" }
        // BUT for PDFs, it might fail if treated exactly like an image without the mimeType hint 
        // or if the model only supports image/* and not application/pdf directly.

        // HOWEVER, the error "image is not valid" suggests the model is expecting an image payload 
        // and we might be sending a PDF that it can't natively decode as an "image".

        // If the model supports PDFs (e.g. Document AI models deployed to Vertex), 
        // the payload often looks like: { content: "...", mimeType: "application/pdf" }

        // 1. Convert PDF to Image (if needed)
        // Vertex AI Image models (AutoML Vision) do NOT support PDF directly.
        // We must rasterize the first page to an image.
        if (mimeType === 'application/pdf') {
            console.log(`[VertexAI] Converting PDF to Image (pdftoppm): ${fileName}`);
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            const { execFile } = require('child_process');
            const util = require('util');
            const execFilePromise = util.promisify(execFile);

            const tempDir = os.tmpdir();
            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `input-${timestamp}.pdf`);
            const outputPathPrefix = path.join(tempDir, `output-${timestamp}`);
            const outputPngPath = `${outputPathPrefix}.png`;

            try {
                // Write PDF buffer to temp file
                fs.writeFileSync(inputPath, fileBuffer);

                // Run pdftoppm (installed via brew install poppler)
                // Command: pdftoppm -png -f 1 -l 1 -singlefile input.pdf output_prefix
                await execFilePromise('pdftoppm', ['-png', '-f', '1', '-l', '1', '-singlefile', inputPath, outputPathPrefix]);

                if (fs.existsSync(outputPngPath)) {
                    // Read back the PNG
                    const imageBuffer = fs.readFileSync(outputPngPath);
                    fileBuffer = imageBuffer;
                    mimeType = 'image/png';
                    console.log(`[VertexAI] Conversion successful (Page 1). Size: ${imageBuffer.length}`);
                } else {
                    console.warn(`[VertexAI] PDF conversion failed: Output file not found.`);
                }
            } catch (convError) {
                console.error(`[VertexAI] PDF Conversion Failed (pdftoppm):`, convError);
                console.warn(`[VertexAI] Ensure 'poppler' is installed: 'brew install poppler'`);
            } finally {
                // Cleanup
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPngPath)) fs.unlinkSync(outputPngPath);
                } catch (cleanupErr) { /* ignore */ }
            }
        }

        // 2. Prepare Input for Vertex AI
        // Vertex AI Custom/AutoML models typically expect:
        // { content: "base64_string" } or { image_bytes: { b64: "..." } } depending on the model.

        // Let's try the most robust generic payload for Vertex AI Prediction:
        const instance = {
            content: fileBuffer.toString('base64'),
            mimeType: mimeType,
        };

        const instanceValue = helpers.toValue(instance);
        const instances = [instanceValue];

        // 2. Predict
        const [response] = await (client.predict({
            endpoint: ENDPOINT_NAME,
            instances: instances as any[],
        }) as any);

        console.log(`[VertexAI] Prediction received for ${fileName}`);

        if (!response.predictions || response.predictions.length === 0) {
            console.warn(`[VertexAI] No predictions returned for ${fileName}`);
            return { entities: [{ type: 'Unknown', confidence: 0, source_file: fileName }], confidence: 0 };
        }

        // 3. Parse Predictions
        const prediction = response.predictions[0];
        const predictionData = helpers.fromValue(prediction as any) as any;

        // console.log(`[VertexAI] Raw Prediction Data:`, JSON.stringify(predictionData));

        let acceptedLabel = 'Unknown';
        let confidence = 0;

        if (predictionData?.displayNames && predictionData?.confidences) {
            // AutoML Pattern
            const maxIdx = predictionData.confidences.reduce((iMax: number, x: number, i: number, arr: number[]) => x > arr[iMax] ? i : iMax, 0);
            acceptedLabel = predictionData.displayNames[maxIdx];
            confidence = predictionData.confidences[maxIdx];
        } else if (predictionData?.label) {
            acceptedLabel = predictionData.label;
            confidence = predictionData.score || predictionData.confidence || 1.0;
        } else {
            if (typeof predictionData === 'string') {
                acceptedLabel = predictionData;
                confidence = 1.0;
            }
        }

        return {
            entities: [{
                type: acceptedLabel,
                confidence: confidence,
                raw_text: '',
                source_file: fileName
            }],
            confidence: confidence
        };

    } catch (error) {
        console.error('[VertexAI] Prediction Error:', error);
        return {
            entities: [{ type: 'Error', confidence: 0, error: String(error) }],
            confidence: 0,
            error: true
        };
    }
}

// Tier Calculation Logic (Vertex AI Label Mapping)
export function calculateTier(detectedForms: any[], intakeAnswers: any) {
    // 1. Normalize Inputs
    const counts: Record<string, number> = {};

    detectedForms.forEach(form => {
        const type = (typeof form === 'string' ? form : form.type).toUpperCase();
        // Sanitize: sometimes labels might come as "T4 - Statement..." -> simplify if needed, 
        // but prompt says "Map model's output labels directly".
        counts[type] = (counts[type] || 0) + 1;
    });

    console.log(`[TierCalc] Normalized Counts (Vertex Labels):`, JSON.stringify(counts));

    // --- COUNT AGGREGATION ---
    // 1. Income Slips (Essential/Plus Logic)
    // T4, T4A, T4E, T4RSP, T4RIF, T5007, OAS, CPP
    const incomeCount =
        (counts['T4'] || 0) +
        (counts['T4A'] || 0) +
        (counts['T4E'] || 0) +
        (counts['T4RSP'] || 0) +
        (counts['T4RIF'] || 0) +
        (counts['T5007'] || 0) +
        (counts['OAS'] || 0) +
        (counts['CPP'] || 0);

    // 2. Investing Slips (Simple)
    // T3, T5
    const investingCount = (counts['T3'] || 0) + (counts['T5'] || 0);

    // 3. Complex/Pro Triggers
    const complexCount =
        (counts['T5008'] || 0) +
        (counts['T776'] || 0) +
        (counts['T2125'] || 0) +
        (counts['T1135'] || 0) +
        (counts['T2042'] || 0) +
        (counts['CRYPTO_REPORT'] || 0) +
        (counts['OTHER_COMPLEX'] || 0);

    // 4. Receipt Counts
    const medicalCount = (counts['MEDICAL_RECEIPT'] || 0);
    const donationCount = (counts['DONATION_RECEIPT'] || 0);
    const rrspCount = (counts['RRSP_RECEIPT'] || 0);
    const t2200Count = (counts['T2200'] || 0);

    let tier = 'Essential';
    let price = 150;
    let reason = 'Standard Filing';
    let alert = null;
    let needsReview = false;

    // --- TIER DETERMINATION ---

    // 1. PRO Check ($350)
    const isPro =
        complexCount > 0 ||
        investingCount > 3 ||
        incomeCount > 5 ||
        medicalCount > 15 ||
        donationCount > 10;
    // Also user mentioned "Complex work-from-home" = Pro, but we can't detect complexity easily.
    // We act on explicit triggers.

    // 2. PLUS Check ($250)
    // If not Pro, check Plus triggers
    const isPlus =
        !isPro && (
            investingCount > 0 ||       // Essential allows 0 investing slips. 1 T5 = Plus.
            incomeCount > 2 ||          // Essential allows up to 2. 3+ = Plus.
            medicalCount > 5 ||         // Essential allows 5. 6+ = Plus.
            donationCount > 2 ||        // Essential allows 2. 3+ = Plus.
            rrspCount > 2 ||            // Essential allows 2. 3+ = Plus.
            t2200Count > 0              // T2200 = Plus.
        );

    // 3. ESSENTIAL Check
    // Default if nothing else matches.

    if (isPro) {
        tier = 'Pro';
        price = 350;
        reason = 'Complex Filing (Business / Rental / Capital Gains / High Volume)';
    } else if (isPlus) {
        tier = 'Plus';
        price = 250;
        reason = 'Intermediate Filing (Investments / Multiple Slips / Deductions)';
    } else {
        tier = 'Essential';
        price = 150;
        reason = 'Standard Filing (Simple Employment / Few Deductions)';
    }

    // --- ALERTS ---
    if ((counts['UNKNOWN'] || 0) > 0 || (counts['ERROR'] || 0) > 0) {
        needsReview = true;
        alert = "Some documents could not be automatically identified. Please review.";
    }

    // --- QUIZ REMINDERS ---
    const missingDocs = [];
    if (intakeAnswers?.self_employed === 'yes' && !counts['T2125']) missingDocs.push('T2125');
    if (intakeAnswers?.rental_income === 'yes' && !counts['T776']) missingDocs.push('T776');

    if (missingDocs.length > 0) {
        const msg = `Reminder: You indicated you have ${missingDocs.join(', ')} income, but we didn't see those forms.`;
        alert = alert ? `${alert} ${msg}` : msg;
        needsReview = true;
    }

    const result = { tier, price, reason, alert, needsReview };
    console.log(`[TierCalc] Result: ${tier} ($${price}). Reason: ${reason}`);
    return result;
}

