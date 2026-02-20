const { EndpointServiceClient } = require('@google-cloud/aiplatform');
const fs_module = require('fs');

const list_endpoints_credentialsPath = 'google-credentials.json';
const credentialsRaw = fs_module.readFileSync(list_endpoints_credentialsPath);
const regions = ['us-central1', 'us-east1', 'us-west1', 'northamerica-northeast1', 'us-east4'];

async function listEndpoints() {
    for (const region of regions) {
        console.log(`Checking region: ${region}...`);
        const client = new EndpointServiceClient({
            apiEndpoint: `${region}-aiplatform.googleapis.com`,
            keyFilename: credentialsPath
        });

        const parent = `projects/gen-lang-client-0626325706/locations/${region}`;

        try {
            const [endpoints] = await client.listEndpoints({ parent });
            if (endpoints.length > 0) {
                console.log(`FOUND ENDPOINTS IN ${region}:`);
                endpoints.forEach((endpoint: any) => {
                    console.log(`- Name: ${endpoint.name}`);
                    console.log(`  DisplayName: ${endpoint.displayName}`);
                    console.log(`  ID: ${endpoint.name.split('/').pop()}`);
                });
            } else {
                console.log(`  No endpoints in ${region}.`);
            }
        } catch (err) {
            console.error(`  Error in ${region}:`, (err as Error).message);
        }
    }
}

listEndpoints();
