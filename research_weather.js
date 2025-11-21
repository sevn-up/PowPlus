// Native fetch is available in Node.js v18+

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

async function fetchWeatherData() {
    const params = new URLSearchParams({
        latitude: 50.1163, // Whistler
        longitude: -122.9574,
        current: 'temperature_2m,weather_code,snowfall,wind_speed_10m,wind_direction_10m',
        hourly: 'temperature_2m,apparent_temperature,snowfall,freezing_level_height,snow_depth,visibility,wind_gusts_10m',
        daily: 'temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: 1
    });

    try {
        console.log('Fetching weather data from Open-Meteo...');
        const response = await fetch(`${WEATHER_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('\n--- HOURLY UNITS ---');
        console.log(JSON.stringify(data.hourly_units, null, 2));

        console.log('\n--- HOURLY DATA (First 3 hours) ---');
        // Helper to slice object arrays
        const sliceHourly = (hourly, limit) => {
            const result = {};
            for (const key in hourly) {
                result[key] = hourly[key].slice(0, limit);
            }
            return result;
        };
        console.log(JSON.stringify(sliceHourly(data.hourly, 3), null, 2));

    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

fetchWeatherData();
