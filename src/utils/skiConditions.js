/**
 * Utility functions for calculating skiing-specific weather conditions
 */

/**
 * Determine snow quality based on temperature and snowfall
 * @param {number} temp - Temperature in Celsius
 * @param {number} snowfall - Snowfall amount in cm
 * @returns {Object} - Quality classification with color and label
 */
export const getSnowQuality = (temp, snowfall) => {
    if (!snowfall || snowfall <= 0) {
        return { quality: 'No Snow', color: '#6b7280', label: 'none', emoji: '—' };
    }

    if (temp <= -8) {
        return { quality: 'Powder', color: '#3b82f6', label: 'powder', emoji: '❄️' };
    } else if (temp <= -3) {
        return { quality: 'Good Snow', color: '#06b6d4', label: 'good', emoji: '🌨️' };
    } else if (temp <= 0) {
        return { quality: 'Packed Snow', color: '#8b5cf6', label: 'packed', emoji: '🏔️' };
    } else {
        return { quality: 'Wet Snow', color: '#6b7280', label: 'wet', emoji: '💧' };
    }
};

/**
 * Calculate wind chill danger level
 * @param {number} temp - Temperature in Celsius
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {Object} - Wind chill rating with color and warning level
 */
export const getWindChillRating = (temp, windSpeed) => {
    // Simple wind chill calculation (JAG/TI method approximation)
    const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);

    if (windChill > 0) {
        return { level: 'Mild', color: '#10b981', warning: false, feelsLike: Math.round(windChill) };
    } else if (windChill > -15) {
        return { level: 'Cold', color: '#fbbf24', warning: false, feelsLike: Math.round(windChill) };
    } else if (windChill > -28) {
        return { level: 'Very Cold', color: '#f97316', warning: true, feelsLike: Math.round(windChill) };
    } else {
        return { level: 'Extreme', color: '#ef4444', warning: true, feelsLike: Math.round(windChill) };
    }
};

/**
 * Categorize visibility for skiing conditions
 * @param {number} visibility - Visibility in meters
 * @returns {Object} - Visibility rating with color and warning
 */
export const getVisibilityRating = (visibility) => {
    const visibilityKm = visibility / 1000;

    if (visibilityKm >= 10) {
        return { level: 'Excellent', color: '#10b981', warning: false, distance: visibilityKm.toFixed(1) };
    } else if (visibilityKm >= 5) {
        return { level: 'Good', color: '#10b981', warning: false, distance: visibilityKm.toFixed(1) };
    } else if (visibilityKm >= 2) {
        return { level: 'Moderate', color: '#fbbf24', warning: false, distance: visibilityKm.toFixed(1) };
    } else if (visibilityKm >= 0.5) {
        return { level: 'Limited', color: '#f97316', warning: true, distance: visibilityKm.toFixed(1), emoji: '⚠️' };
    } else {
        return { level: 'Whiteout Risk', color: '#ef4444', warning: true, distance: visibilityKm.toFixed(1), emoji: '🚨' };
    }
};

/**
 * Assess rain risk based on freezing level and elevation
 * @param {number} freezingLevel - Freezing level height in meters
 * @param {number} elevation - Location elevation in meters
 * @returns {Object} - Freezing level warning with color and status
 */
export const getFreezingLevelWarning = (freezingLevel, elevation) => {
    const difference = freezingLevel - elevation;

    if (difference < -300) {
        return {
            status: 'Powder Conditions',
            color: '#10b981',
            warning: false,
            emoji: '❄️',
            description: 'Well below freezing - excellent powder'
        };
    } else if (difference < 0) {
        return {
            status: 'Cold Snow',
            color: '#06b6d4',
            warning: false,
            emoji: '🌨️',
            description: 'Below freezing - good snow conditions'
        };
    } else if (difference < 300) {
        return {
            status: 'Mixed Conditions',
            color: '#fbbf24',
            warning: true,
            emoji: '⚠️',
            description: 'Near freezing level - variable conditions'
        };
    } else {
        return {
            status: 'Rain Risk',
            color: '#ef4444',
            warning: true,
            emoji: '🌧️',
            description: 'Above freezing - rain likely'
        };
    }
};

/**
 * Calculate overall skiing condition rating for an hour
 * @param {Object} hourData - All weather data for the hour
 * @param {number} elevation - Location elevation
 * @returns {Object} - Overall rating with score and recommendations
 */
export const getSkiingConditionRating = (hourData, elevation = 2000) => {
    let score = 50; // Start at neutral
    const insights = [];

    // Snow factor (most important)
    if (hourData.snowfall > 5) {
        score += 30;
        insights.push(`Heavy snowfall (${hourData.snowfall}cm)`);
    } else if (hourData.snowfall > 2) {
        score += 20;
        insights.push(`Moderate snowfall (${hourData.snowfall}cm)`);
    } else if (hourData.snowfall > 0) {
        score += 10;
        insights.push(`Light snowfall (${hourData.snowfall}cm)`);
    }

    // Temperature factor
    const temp = hourData.temperature_2m;
    if (temp >= -12 && temp <= -5) {
        score += 15;
        insights.push('Perfect powder temperature');
    } else if (temp > 0) {
        score -= 20;
        insights.push('Warm - wet snow conditions');
    }

    // Wind factor
    const wind = hourData.wind_speed_10m;
    if (wind < 15) {
        score += 10;
        insights.push('Calm winds');
    } else if (wind > 40) {
        score -= 20;
        insights.push('Strong winds - exposed areas difficult');
    } else if (wind > 25) {
        score -= 10;
        insights.push('Moderate winds');
    }

    // Visibility factor
    const visibility = hourData.visibility || 10000;
    if (visibility < 500) {
        score -= 25;
        insights.push('Very limited visibility');
    } else if (visibility < 2000) {
        score -= 10;
        insights.push('Reduced visibility');
    }

    // Weather code factor
    const weatherCode = hourData.weather_code;
    if (weatherCode === 0 || weatherCode === 1) {
        score += 10;
        insights.push('Clear skies');
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine rating
    let rating, color, recommendation;
    if (score >= 80) {
        rating = 'Excellent';
        color = '#10b981';
        recommendation = 'Prime skiing conditions!';
    } else if (score >= 60) {
        rating = 'Good';
        color = '#06b6d4';
        recommendation = 'Great day for skiing';
    } else if (score >= 40) {
        rating = 'Fair';
        color = '#fbbf24';
        recommendation = 'Decent conditions';
    } else {
        rating = 'Poor';
        color = '#ef4444';
        recommendation = 'Challenging conditions';
    }

    return { score, rating, color, insights, recommendation };
};

/**
 * Classify snowfall intensity
 * @param {number} snowfall - Snowfall in cm
 * @returns {Object} - Intensity classification
 */
export const getSnowfallIntensity = (snowfall) => {
    if (snowfall === 0) {
        return { level: 'None', color: '#6b7280', emoji: '—', rate: 0 };
    } else if (snowfall < 0.5) {
        return { level: 'Flurries', color: '#93c5fd', emoji: '🌨️', rate: snowfall };
    } else if (snowfall < 2) {
        return { level: 'Light', color: '#60a5fa', emoji: '❄️', rate: snowfall };
    } else if (snowfall < 5) {
        return { level: 'Moderate', color: '#3b82f6', emoji: '🌨️', rate: snowfall };
    } else {
        return { level: 'Heavy', color: '#2563eb', emoji: '❄️❄️', rate: snowfall };
    }
};

/**
 * Format wind direction from degrees to compass with emoji
 * @param {number} degrees - Wind direction in degrees
 * @returns {Object} - Direction info with cardinal direction and emoji
 */
export const formatWindDirection = (degrees) => {
    const directions = [
        { name: 'N', emoji: '⬇️', label: 'North' },
        { name: 'NE', emoji: '↙️', label: 'Northeast' },
        { name: 'E', emoji: '⬅️', label: 'East' },
        { name: 'SE', emoji: '↖️', label: 'Southeast' },
        { name: 'S', emoji: '⬆️', label: 'South' },
        { name: 'SW', emoji: '↗️', label: 'Southwest' },
        { name: 'W', emoji: '➡️', label: 'West' },
        { name: 'NW', emoji: '↘️', label: 'Northwest' }
    ];

    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

/**
 * Get temperature color based on value
 * @param {number} temp - Temperature in Celsius
 * @returns {string} - Color hex code
 */
export const getTemperatureColor = (temp) => {
    if (temp < -10) return '#3b82f6'; // Deep blue
    if (temp < 0) return '#60a5fa';   // Light blue
    if (temp < 10) return '#ffffff';  // White
    return '#fbbf24';                 // Yellow
};
