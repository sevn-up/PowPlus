import { getClosestAvalancheForecast } from './src/services/avalancheApi.js';

// Mock fetch if running in node without global fetch (Node 18+ has it, but good to be safe if environment differs)
// Assuming environment has fetch.

async function checkData() {
    console.log("Fetching forecast for Whistler...");
    // Whistler coordinates
    const lat = 50.1163;
    const lon = -122.9574;

    try {
        const forecast = await getClosestAvalancheForecast(lat, lon);
        if (forecast) {
            console.log("Forecast found for:", forecast.area.name);
            console.log("Danger Ratings Structure:", JSON.stringify(forecast.dangerRatings, null, 2));
            console.log("Problems Structure:", JSON.stringify(forecast.problems, null, 2));
        } else {
            console.log("No forecast found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkData();
