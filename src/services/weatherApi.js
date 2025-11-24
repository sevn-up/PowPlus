const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export const getCoordinates = async (townName) => {
    const response = await fetch(`${GEO_URL}?name=${townName}&count=1&language=en&format=json`);
    if (!response.ok) throw new Error('Failed to fetch coordinates');
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error('Town not found');
    return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country,
        elevation: data.results[0].elevation
    };
};

export const getWeather = async (lat, lon) => {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,weather_code,snowfall,wind_speed_10m,wind_direction_10m',
        hourly: 'temperature_2m,snowfall,freezing_level_height,snow_depth,visibility,wind_gusts_10m,wind_speed_10m,wind_direction_10m,precipitation_probability,cloud_cover,surface_pressure,is_day',
        daily: 'temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max,weather_code,uv_index_max,sunshine_duration',
        timezone: 'auto',
        forecast_days: 10,
        past_days: 7
    });

    const response = await fetch(`${WEATHER_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
};

// Helper to map WMO weather codes to descriptions
export const getWeatherDescription = (code) => {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
    };
    return codes[code] || 'Unknown';
};
