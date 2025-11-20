/**
 * Calculate snowfall totals over different time periods
 * @param {Array} snowfallData - Hourly snowfall array
 * @param {number} hours - Number of hours to sum (24, 48, 72)
 * @returns {number} Total snowfall in cm
 */
export const calculateSnowfallTotal = (snowfallData, hours = 24) => {
    if (!snowfallData || snowfallData.length === 0) return 0;
    const slice = snowfallData.slice(0, Math.min(hours, snowfallData.length));
    return slice.reduce((sum, val) => sum + (val || 0), 0);
};

/**
 * Determine snow quality based on temperature and wind
 * @param {number} avgTemp - Average temperature during snowfall (°C)
 * @param {number} avgWind - Average wind speed during snowfall (km/h)
 * @returns {Object} Snow quality info
 */
export const getSnowQuality = (avgTemp, avgWind) => {
    let quality = 'unknown';
    let description = '';
    let score = 0;

    // Temperature-based quality
    if (avgTemp < -10) {
        quality = 'champagne';
        description = 'Cold smoke powder - light and dry';
        score = 10;
    } else if (avgTemp < -5) {
        quality = 'dry';
        description = 'Dry powder - excellent skiing';
        score = 9;
    } else if (avgTemp < -2) {
        quality = 'good';
        description = 'Good powder - nice skiing';
        score = 7;
    } else if (avgTemp < 0) {
        quality = 'medium';
        description = 'Medium density - decent conditions';
        score = 5;
    } else {
        quality = 'heavy';
        description = 'Heavy/wet snow - challenging conditions';
        score = 3;
    }

    // Wind adjustment
    if (avgWind > 30) {
        score -= 3;
        description += ' (wind-affected)';
    } else if (avgWind > 20) {
        score -= 1;
        description += ' (some wind transport)';
    }

    return {
        quality,
        description,
        score: Math.max(0, Math.min(10, score))
    };
};

/**
 * Calculate powder score based on multiple factors
 * @param {Object} weatherData - Weather data object
 * @returns {Object} Powder score and analysis
 */
export const calculatePowderScore = (weatherData) => {
    if (!weatherData || !weatherData.hourly) {
        return { score: 0, rating: 'No data', isPowderDay: false };
    }

    const { hourly } = weatherData;

    // Get last 24 hours of data
    const snowfall24h = calculateSnowfallTotal(hourly.snowfall, 24);
    const avgTemp = hourly.temperature_2m.slice(0, 24).reduce((a, b) => a + b, 0) / 24;
    const avgWind = hourly.wind_speed_10m ?
        hourly.wind_speed_10m.slice(0, 24).reduce((a, b) => a + b, 0) / 24 : 0;

    // Base score from snowfall
    let score = 0;
    if (snowfall24h >= 30) score = 10;
    else if (snowfall24h >= 20) score = 8;
    else if (snowfall24h >= 15) score = 7;
    else if (snowfall24h >= 10) score = 5;
    else if (snowfall24h >= 5) score = 3;
    else score = 1;

    // Adjust for snow quality
    const quality = getSnowQuality(avgTemp, avgWind);
    score = (score + quality.score) / 2;

    // Determine rating
    let rating = '';
    let isPowderDay = false;

    if (score >= 8.5) {
        rating = 'Epic';
        isPowderDay = true;
    } else if (score >= 7) {
        rating = 'Excellent';
        isPowderDay = true;
    } else if (score >= 5.5) {
        rating = 'Good';
        isPowderDay = snowfall24h >= 15;
    } else if (score >= 4) {
        rating = 'Fair';
    } else {
        rating = 'Poor';
    }

    return {
        score: Math.round(score * 10) / 10,
        rating,
        isPowderDay,
        snowfall24h: Math.round(snowfall24h * 10) / 10,
        snowQuality: quality,
        avgTemp: Math.round(avgTemp * 10) / 10,
        avgWind: Math.round(avgWind)
    };
};

/**
 * Calculate snow-to-liquid ratio estimate
 * @param {number} temp - Temperature in °C
 * @returns {number} Estimated ratio
 */
export const estimateSnowToLiquidRatio = (temp) => {
    // Simplified estimation based on temperature
    // Colder = fluffier snow = higher ratio
    if (temp < -15) return 20;
    if (temp < -10) return 15;
    if (temp < -5) return 12;
    if (temp < -2) return 10;
    if (temp < 0) return 8;
    return 5; // Wet snow
};

/**
 * Identify best skiing window in next 48 hours
 * @param {Object} weatherData - Weather data object
 * @returns {Object} Best skiing time recommendation
 */
export const getBestSkiingWindow = (weatherData) => {
    if (!weatherData || !weatherData.hourly) {
        return { recommendation: 'No data available', hours: [] };
    }

    const { hourly } = weatherData;
    const scores = [];

    // Score each hour based on conditions
    for (let i = 0; i < Math.min(48, hourly.time.length); i++) {
        let hourScore = 5; // Base score

        // Recent snowfall bonus
        const recentSnow = hourly.snowfall.slice(Math.max(0, i - 6), i).reduce((a, b) => a + b, 0);
        if (recentSnow > 10) hourScore += 3;
        else if (recentSnow > 5) hourScore += 2;
        else if (recentSnow > 2) hourScore += 1;

        // Wind penalty
        const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0;
        if (wind > 40) hourScore -= 4;
        else if (wind > 30) hourScore -= 2;
        else if (wind > 20) hourScore -= 1;

        // Visibility bonus (if available)
        const visibility = hourly.visibility ? hourly.visibility[i] : 10000;
        if (visibility > 8000) hourScore += 1;
        else if (visibility < 2000) hourScore -= 2;

        // Daylight bonus
        const isDay = hourly.is_day ? hourly.is_day[i] : 1;
        if (isDay) hourScore += 1;

        // Temperature consideration (not too cold, not too warm)
        const temp = hourly.temperature_2m[i];
        if (temp > -20 && temp < -2) hourScore += 1;
        else if (temp > 0) hourScore -= 1;

        scores.push({
            hour: i,
            time: hourly.time[i],
            score: hourScore,
            temp: temp,
            wind: wind,
            snow: recentSnow
        });
    }

    // Find best continuous 4-hour window
    let bestWindow = { start: 0, avgScore: 0 };
    for (let i = 0; i <= scores.length - 4; i++) {
        const windowScore = scores.slice(i, i + 4).reduce((sum, h) => sum + h.score, 0) / 4;
        if (windowScore > bestWindow.avgScore) {
            bestWindow = { start: i, avgScore: windowScore };
        }
    }

    const bestHours = scores.slice(bestWindow.start, bestWindow.start + 4);
    const startTime = new Date(bestHours[0].time);
    const endTime = new Date(bestHours[3].time);

    let recommendation = '';
    if (bestWindow.avgScore >= 8) {
        recommendation = 'Excellent conditions expected';
    } else if (bestWindow.avgScore >= 6) {
        recommendation = 'Good skiing conditions';
    } else if (bestWindow.avgScore >= 4) {
        recommendation = 'Fair conditions';
    } else {
        recommendation = 'Challenging conditions';
    }

    return {
        recommendation,
        startTime: startTime.toLocaleString(),
        endTime: endTime.toLocaleString(),
        score: Math.round(bestWindow.avgScore * 10) / 10,
        hours: bestHours
    };
};
