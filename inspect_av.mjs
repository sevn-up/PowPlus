// Standalone script to check avalanche data
// Run with node inspect_av.mjs

const getAvalancheForecastProducts = async (lang = 'en') => {
    try {
        const response = await fetch(`https://api.avalanche.ca/forecasts/${lang}/products`);
        if (!response.ok) throw new Error('Failed to fetch avalanche forecast products');
        return await response.json();
    } catch (error) {
        console.error('Avalanche API error:', error);
        return null;
    }
};

const getAvalancheForecastAreas = async (lang = 'en') => {
    try {
        const response = await fetch(`https://api.avalanche.ca/forecasts/${lang}/areas`);
        if (!response.ok) throw new Error('Failed to fetch avalanche forecast areas');
        return await response.json();
    } catch (error) {
        console.error('Avalanche API error:', error);
        return null;
    }
};

const getClosestAvalancheForecast = async (lat, lon) => {
    const products = await getAvalancheForecastProducts();
    if (!products || !Array.isArray(products)) return null;

    let closestForecast = null;
    let minDistance = Infinity;

    const areas = await getAvalancheForecastAreas();
    if (!areas || !areas.features) return null;

    const areaInfo = {};
    areas.features.forEach(feature => {
        if (feature.properties && feature.properties.centroid) {
            areaInfo[feature.id] = {
                centroid: feature.properties.centroid,
                name: feature.properties.name || feature.properties.id
            };
        }
    });

    products.forEach(product => {
        if (product.area && product.area.id && areaInfo[product.area.id]) {
            const [areaLon, areaLat] = areaInfo[product.area.id].centroid;
            const distance = Math.sqrt(
                Math.pow(lat - areaLat, 2) + Math.pow(lon - areaLon, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestForecast = product;
                closestForecast.area = {
                    ...closestForecast.area,
                    name: areaInfo[product.area.id].name
                };
            }
        }
    });

    return closestForecast;
};

async function checkData() {
    console.log("Fetching forecast for Whistler...");
    const lat = 50.1163;
    const lon = -122.9574;

    try {
        const forecast = await getClosestAvalancheForecast(lat, lon);
        if (forecast) {
            console.log("Forecast found for:", forecast.area.name);
            console.log("--- DANGER RATINGS ---");
            console.log(JSON.stringify(forecast.dangerRatings, null, 2));
            console.log("--- PROBLEMS ---");
            console.log(JSON.stringify(forecast.problems, null, 2));
        } else {
            console.log("No forecast found, trying generic request...");
            const products = await getAvalancheForecastProducts();
            if (products && products.length > 0) {
                console.log("First available forecast structure:");
                console.log(JSON.stringify(products[0].dangerRatings, null, 2));
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkData();
