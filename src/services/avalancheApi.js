const AVALANCHE_BASE = 'https://api.avalanche.ca';

// In-memory cache with TTL
const cache = {
    products: { data: null, timestamp: null },
    areas: { data: null, timestamp: null },
    metadata: { data: null, timestamp: null }
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Check if cached data is still valid
 */
const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    return (Date.now() - timestamp) < CACHE_TTL;
};

/**
 * Fetch all avalanche forecast products
 * @param {string} lang - Language code ('en' or 'fr')
 * @returns {Promise<Array>} Array of forecast products
 */
export const getAvalancheForecastProducts = async (lang = 'en') => {
    // Check cache first
    if (isCacheValid(cache.products.timestamp)) {
        console.log('Avalanche products loaded from cache');
        return cache.products.data;
    }

    try {
        const response = await fetch(`${AVALANCHE_BASE}/forecasts/${lang}/products`);
        if (!response.ok) throw new Error('Failed to fetch avalanche forecast products');
        const data = await response.json();

        // Update cache
        cache.products = {
            data,
            timestamp: Date.now()
        };

        return data;
    } catch (error) {
        console.error('Avalanche API error:', error);
        // Return cached data if available, even if expired
        if (cache.products.data) {
            console.log('Returning expired cache due to error');
            return cache.products.data;
        }
        return null;
    }
};

/**
 * Fetch all avalanche forecast areas as GeoJSON
 * @param {string} lang - Language code ('en' or 'fr')
 * @returns {Promise<Object>} GeoJSON FeatureCollection of forecast areas
 */
export const getAvalancheForecastAreas = async (lang = 'en') => {
    // Check cache first
    if (isCacheValid(cache.areas.timestamp)) {
        console.log('Avalanche areas loaded from cache');
        return cache.areas.data;
    }

    try {
        const response = await fetch(`${AVALANCHE_BASE}/forecasts/${lang}/areas`);
        if (!response.ok) throw new Error('Failed to fetch avalanche forecast areas');
        const data = await response.json();

        // Update cache
        cache.areas = {
            data,
            timestamp: Date.now()
        };

        return data;
    } catch (error) {
        console.error('Avalanche API error:', error);
        // Return cached data if available, even if expired
        if (cache.areas.data) {
            console.log('Returning expired cache due to error');
            return cache.areas.data;
        }
        return null;
    }
};

/**
 * Fetch avalanche forecast metadata for all regions
 * @param {string} lang - Language code ('en' or 'fr')
 * @returns {Promise<Object>} Forecast metadata including danger ratings
 */
export const getAvalancheForecastMetadata = async (lang = 'en') => {
    // Check cache first
    if (isCacheValid(cache.metadata.timestamp)) {
        console.log('Avalanche metadata loaded from cache');
        return cache.metadata.data;
    }

    try {
        const response = await fetch(`${AVALANCHE_BASE}/forecasts/${lang}/metadata`);
        if (!response.ok) throw new Error('Failed to fetch avalanche forecast metadata');
        const data = await response.json();

        // Update cache
        cache.metadata = {
            data,
            timestamp: Date.now()
        };

        return data;
    } catch (error) {
        console.error('Avalanche API error:', error);
        // Return cached data if available, even if expired
        if (cache.metadata.data) {
            console.log('Returning expired cache due to error');
            return cache.metadata.data;
        }
        return null;
    }
};

/**
 * Find the closest avalanche forecast to given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object|null>} Closest forecast or null
 */
export const getClosestAvalancheForecast = async (lat, lon) => {
    const products = await getAvalancheForecastProducts();
    if (!products || !Array.isArray(products)) return null;

    // Find closest forecast by calculating distance to area centroids
    let closestForecast = null;
    let minDistance = Infinity;

    const areas = await getAvalancheForecastAreas();
    if (!areas || !areas.features) return null;

    // Create a map of area IDs to centroids and names
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
                // Add the human-readable area name to the forecast
                closestForecast.area = {
                    ...closestForecast.area,
                    name: areaInfo[product.area.id].name
                };
            }
        }
    });

    return closestForecast;
};

/**
 * Parse danger rating value from API format
 * @param {string} ratingValue - Rating value from API (e.g., 'low', 'moderate', 'earlyseason')
 * @returns {Object} Parsed rating info
 */
export const parseDangerRating = (ratingValue) => {
    const ratingMap = {
        'low': { level: 1, display: '1 - Low', color: '#4CAF50', textColor: '#FFFFFF' },
        'moderate': { level: 2, display: '2 - Moderate', color: '#FFC107', textColor: '#000000' },
        'considerable': { level: 3, display: '3 - Considerable', color: '#FF9800', textColor: '#FFFFFF' },
        'high': { level: 4, display: '4 - High', color: '#F44336', textColor: '#FFFFFF' },
        'extreme': { level: 5, display: '5 - Extreme', color: '#000000', textColor: '#FFFFFF' },
        'earlyseason': { level: 0, display: 'Early Season', color: '#9E9E9E', textColor: '#FFFFFF' },
        'norating': { level: -1, display: 'No Rating', color: '#BDBDBD', textColor: '#000000' },
        'noforecast': { level: -1, display: 'No Forecast', color: '#BDBDBD', textColor: '#000000' }
    };

    return ratingMap[ratingValue?.toLowerCase()] || ratingMap['norating'];
};

/**
 * Map avalanche danger rating to color and description
 * @param {number} rating - Danger rating (1-5)
 * @returns {Object} Color and description
 */
export const getDangerRatingInfo = (rating) => {
    const ratings = {
        1: { level: 'Low', color: '#4CAF50', description: 'Generally safe avalanche conditions' },
        2: { level: 'Moderate', color: '#FFC107', description: 'Heightened avalanche conditions on specific terrain' },
        3: { level: 'Considerable', color: '#FF9800', description: 'Dangerous avalanche conditions' },
        4: { level: 'High', color: '#F44336', description: 'Very dangerous avalanche conditions' },
        5: { level: 'Extreme', color: '#000000', description: 'Extraordinarily dangerous avalanche conditions' }
    };
    return ratings[rating] || { level: 'Unknown', color: '#9E9E9E', description: 'No forecast available' };
};

/**
 * Get travel advice based on danger rating
 * @param {number} rating - Danger rating (1-5)
 * @returns {string} Travel advice
 */
export const getTravelAdvice = (rating) => {
    const advice = {
        1: 'Travel is generally safe. Normal caution advised.',
        2: 'Use caution in steep terrain. Evaluate snow and terrain carefully.',
        3: 'Dangerous conditions. Careful snowpack evaluation, cautious route-finding, and conservative decision-making essential.',
        4: 'Very dangerous conditions. Travel in avalanche terrain not recommended.',
        5: 'Avoid all avalanche terrain. Stay off and out from underneath steep slopes.'
    };
    return advice[rating] || 'Check avalanche.ca for current conditions.';
};

/**
 * Format HTML highlights to plain text
 * @param {string} htmlString - HTML string from API
 * @returns {string} Plain text
 */
export const formatHighlights = (htmlString) => {
    if (!htmlString) return '';
    // Remove HTML tags and decode entities
    return htmlString
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
};
