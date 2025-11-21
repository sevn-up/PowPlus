// Native fetch is available in Node.js v18+

const API_BASE_URL = 'https://api.avalanche.ca/forecasts/en/products';

async function fetchAvalancheData() {
    try {
        // 1. Fetch Products to get IDs
        console.log('Fetching products list...');
        const productsResponse = await fetch(`${API_BASE_URL}`);
        const products = await productsResponse.json();

        console.log('\n--- PRODUCTS LIST (First 3) ---');
        console.log(JSON.stringify(products.slice(0, 3), null, 2));

        // 2. Fetch Metadata (might have danger ratings)
        console.log('\nFetching metadata...');
        const metaResponse = await fetch('https://api.avalanche.ca/forecasts/en/metadata');
        const metadata = await metaResponse.json();

        console.log('\n--- METADATA SAMPLE ---');
        // Log a sample region's metadata
        const sampleRegion = Object.keys(metadata)[0];
        console.log(`Region: ${sampleRegion}`);
        console.log(JSON.stringify(metadata[sampleRegion], null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAvalancheData();
