import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';

// The AI client will be dynamically initialized at runtime inside the classifyDocument function

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
        const projectId = process.env.VERTEX_PROJECT_ID || 'vsf-tax-ai';
        const endpointId = process.env.VERTEX_ENDPOINT_ID || '7274015986133499904';
        const location = 'us-central1';

        const fs = require('fs');
        const clientOptions: any = {
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
        };

        // If local file exists, use it (for local dev without GOOGLE_APPLICATION_CREDENTIALS)
        if (fs.existsSync('google-credentials.json')) {
            clientOptions.keyFilename = 'google-credentials.json';
        }

        const client = new PredictionServiceClient(clientOptions);

        const endpointName = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`;
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
            endpoint: endpointName,
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
    const unrecogTypes = new Set(['UNKNOWN', 'ERROR']);
    let hasUnrecognized = false;
    let lowConfidenceCount = 0;

    // Receipt list
    const receiptTypes = ['MEDICAL_RECEIPT', 'DONATION_RECEIPT', 'RECEIPT', 'RRSP_RECEIPT', 'CHILDCARE_RECEIPT'];
    let totalReceipts = 0;

    // Crypto/trading count
    let cryptoCount = 0;

    // Corrupted docs / unreadable
    let hasCorrupted = false;

    // Detailed tracking for precise logic
    let simpleCount = 0;
    let moderateCount = 0;
    let highCount = 0;

    let needsReview = false;
    let reasonsForReview: string[] = [];

    // Check total uploaded files > 15
    if (detectedForms.length > 15) {
        reasonsForReview.push('Total uploaded files exceeds 15');
    }

    detectedForms.forEach(form => {
        const typeObj = typeof form === 'string' ? form : form.type;
        const type = typeObj ? typeObj.toUpperCase() : 'UNKNOWN';

        // Form confidence, default 1.0 if not provided
        const conf = (typeof form === 'object' && form.confidence !== undefined) ? form.confidence : 1.0;

        // Source file
        const sourceFile = (typeof form === 'object' && form.source_file) ? form.source_file.toLowerCase() : '';

        // Classification confidence < 90%
        if (conf < 0.90) {
            lowConfidenceCount++;
        }

        if (unrecogTypes.has(type)) {
            hasUnrecognized = true;
        } else if (!type || type.trim() === '') {
            hasUnrecognized = true;
        }

        counts[type] = (counts[type] || 0) + 1;

        // Receipt counter
        if (receiptTypes.includes(type) || type === 'T2200') {
            totalReceipts++;
        }

        if (type === 'CRYPTO_REPORT') cryptoCount++;

        // CSV or export check
        if (sourceFile.endsWith('.csv') || sourceFile.includes('export') || sourceFile.includes('report') || sourceFile.includes('transaction')) {
            // Brokerage Export / Trade History Detection
            reasonsForReview.push('Brokerage export or trade history detected');
        }
    });

    console.log(`[TierCalc] Normalized Counts (Vertex Labels):`, JSON.stringify(counts));

    // A. Simple Documents
    const simpleDocTypes = [
        'T4', 'T4A', 'T4E', 'T5007', 'T4AP', 'T4A(P)', 'T4AOAS', 'T4A(OAS)', 'CPP', 'OAS',
        'T4RSP', 'T4RIF', 'T5', 'T3', 'T2202', 'RRSP_RECEIPT', 'DONATION_RECEIPT',
        'MEDICAL_RECEIPT', 'CHILDCARE_RECEIPT', 'STUDENT_LOAN_INTEREST', 'FHSA', 'RECEIPT'
    ];
    simpleDocTypes.forEach(t => { simpleCount += (counts[t] || 0); });

    // B. Moderate Triggers
    let t5008Count = counts['T5008'] || 0;

    if (t5008Count === 1) moderateCount += 1;
    if (counts['T2200']) moderateCount += 1; // Work from home
    if (counts['MOVING_EXPENSES']) moderateCount += 1;
    if ((counts['T3'] || 0) + (counts['T5'] || 0) > 1) moderateCount += 1; // multiple T3/T5
    if (counts['OTHER_MODERATE']) moderateCount += 1; // specific generic mappings if any
    if (counts['CAPITAL_GAIN_SUMMARY'] === 1) moderateCount += 1; // one simple capital gain summary

    // C. High Triggers
    if (cryptoCount > 0) highCount += 1;
    if (counts['T776']) highCount += 1;
    if (counts['T2125']) highCount += 1;
    if (t5008Count > 1) highCount += 1;
    if (counts['T1135'] || counts['FOREIGN_REPORTING']) highCount += 1;
    if (counts['NON_RESIDENT'] || counts['EMIGRANT']) highCount += 1;
    if (counts['PRIOR_YEAR_AMENDMENT']) highCount += 1;
    if (counts['TRUST_ESTATE'] || counts['TRUST']) highCount += 1;
    if (counts['BUSINESS_USE_OF_HOME']) highCount += 1;
    if (counts['MANUAL_ACB']) highCount += 1;
    if (counts['LARGE_VOLUME_INVESTMENT']) highCount += 1;
    if ((counts['CAPITAL_GAIN_SUMMARY'] || 0) > 1) highCount += 1;

    // --- MANUAL REVIEW TRIGGERS ---
    if (lowConfidenceCount > 0) reasonsForReview.push('Document classification confidence < 90%');
    if (hasUnrecognized) reasonsForReview.push('Unrecognized document type detected');
    if (t5008Count > 1) reasonsForReview.push('Multiple T5008 bundles detected');
    if (cryptoCount > 0) reasonsForReview.push('Crypto transaction summaries detected');
    if (counts['T2125']) reasonsForReview.push('Self-employment indicators detected');
    if (counts['T776']) reasonsForReview.push('Rental income indicators detected');
    if (counts['T1135'] || counts['FOREIGN_INCOME'] || counts['FOREIGN_REPORTING']) reasonsForReview.push('Foreign income or tax documents detected');
    if (hasCorrupted) reasonsForReview.push('Unreadable or corrupted document upload');
    if (counts['T2125'] && counts['T4'] > 0) reasonsForReview.push('Conflicting document signals (Employment + Business)');
    if (totalReceipts > 10) reasonsForReview.push('Volume of receipt-type documents > 10');
    if ((counts['T2202'] || 0) > 1) reasonsForReview.push('Multiple-year tuition slips potentially detected');
    if (counts['PRIOR_YEAR_AMENDMENT']) reasonsForReview.push('Prior-year amendment indicators detected');

    let complexIndicators = highCount + moderateCount;
    if (complexIndicators >= 3) {
        reasonsForReview.push('3 or more complexity indicators detected');
    }

    if (reasonsForReview.length > 0) {
        needsReview = true;
        // Deduplicate
        reasonsForReview = [...new Set(reasonsForReview)];
    }

    // --- TIER DETERMINATION ---
    let tier = 'Essential';
    let price = 150;
    let reason = 'Standard Filing';

    // Rule 1 — Check for High Complexity
    if (highCount > 0) {
        tier = 'Pro';
        price = 350;
        reason = 'Complex Filing (Business / Rental / Capital Gains / High Volume)';
    }
    // Rule 2 — Count Moderate Triggers
    else if (moderateCount >= 3) {
        tier = 'Pro';
        price = 350;
        reason = 'Multiple complexity factors detected';
    }
    // Rule 3 — Count Simple Documents
    else if (simpleCount >= 7) {
        tier = 'Pro';
        price = 350;
        reason = 'High volume of simple documents (7+)';
    }
    // Rule 4 — Plus Conditions
    else if (simpleCount >= 4 && simpleCount <= 6) {
        tier = 'Plus';
        price = 250;
        reason = 'Intermediate Filing (4-6 simple documents)';
    }
    else if (simpleCount >= 1 && simpleCount <= 6 && moderateCount >= 1 && moderateCount <= 2) {
        tier = 'Plus';
        price = 250;
        reason = 'Intermediate Filing (Moderate complexity triggers present)';
    }
    // Rule 5 — Essential Conditions
    else if (simpleCount >= 1 && simpleCount <= 3 && moderateCount === 0) {
        tier = 'Essential';
        price = 150;
        reason = 'Standard Filing (1-3 simple documents)';
    }
    // Light Moderate Exception handled implicitly (e.g. 1 T4 + 1 T5 -> simple=2, mod=0 -> Essential)
    else {
        // Default catch-all
        tier = 'Essential';
        price = 150;
        reason = 'Standard Filing';
    }

    // --- ALERTS ---
    let alert = null;
    if (needsReview) {
        alert = "Your documents are being reviewed to ensure accurate pricing. We will confirm your filing package shortly.";
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
    if (reasonsForReview.length > 0) {
        console.log(`[TierCalc] Manual Review Triggers: ${reasonsForReview.join(' | ')}`);
    }
    return result;
}

