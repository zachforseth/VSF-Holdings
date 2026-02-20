const { PredictionServiceClient, helpers } = require('@google-cloud/aiplatform');
const fs = require('fs');
const path = require('path');

// Initialize Vertex AI Prediction Client
const credentialsPath = 'google-credentials.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath));
console.log(`[VertexAI] Using Service Account: ${credentials.client_email}`);

const client = new PredictionServiceClient({
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    keyFilename: credentialsPath
});

// Vertex AI Configuration
const PROJECT_ID = process.env.VERTEX_PROJECT_ID || 'vsf-tax-ai';
const LOCATION = 'us-central1';
const ENDPOINT_ID = process.env.VERTEX_ENDPOINT_ID || '7274015986133499904';
const ENDPOINT_NAME = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

async function classifyDocument(fileBuffer: any, mimeType: any, fileName: any) {
    console.log(`[VertexAI] Classifying ${fileName}...`);

    try {
        const instance = {
            content: fileBuffer.toString('base64'),
            mimeType: mimeType,
        };

        const instanceValue = helpers.toValue(instance);
        const instances = [instanceValue];

        const [response] = await client.predict({
            endpoint: ENDPOINT_NAME,
            instances: instances,
        });

        console.log(`[VertexAI] Prediction received for ${fileName}`);

        if (!response.predictions || response.predictions.length === 0) {
            console.warn(`[VertexAI] No predictions returned`);
            return;
        }

        const prediction = response.predictions[0];
        const predictionData = helpers.fromValue(prediction);

        console.log(`[VertexAI] Raw Prediction Data:`, JSON.stringify(predictionData, null, 2));

    } catch (error) {
        console.error('[VertexAI] Prediction Error:', error);
    }
}

async function main() {
    // Create a dummy 1x1 pixel PNG
    const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(base64Png, 'base64');

    await classifyDocument(buffer, 'image/png', 'test.png');
}

main();
