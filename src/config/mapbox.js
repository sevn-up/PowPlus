/**
 * Mapbox Configuration
 * Centralized Mapbox settings and utilities
 */

// Get Mapbox token from environment variable
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Check if token is set
export const hasValidToken = () => {
    return MAPBOX_TOKEN && MAPBOX_TOKEN !== 'PASTE_YOUR_TOKEN_HERE' && MAPBOX_TOKEN.startsWith('pk.');
};

/**
 * Default map configuration
 */
export const DEFAULT_MAP_CONFIG = {
    style: 'mapbox://styles/mapbox/outdoors-v12', // Outdoors style shows terrain well
    center: [-122.9574, 50.1163], // Whistler, BC (fallback)
    zoom: 10,
    pitch: 0,
    bearing: 0,
};

/**
 * Map style options
 */
export const MAP_STYLES = {
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11',
    terrain: 'mapbox://styles/mapbox/satellite-v9', // For 3D terrain
};

/**
 * Avalanche danger rating colors for map layers
 */
export const AVALANCHE_COLORS = {
    1: '#4CAF50', // Low
    2: '#FFC107', // Moderate
    3: '#FF9800', // Considerable
    4: '#F44336', // High
    5: '#000000', // Extreme
};

/**
 * Road event marker colors
 */
export const EVENT_COLORS = {
    closure: '#C62828',
    incident: '#FF4444',
    weather: '#4A90E2',
    roadCondition: '#FFD700',
};

/**
 * Create Mapbox-compatible GeoJSON from avalanche areas
 * @param {Object} avalancheAreas - Avalanche Canada GeoJSON
 * @param {Array} products - Avalanche forecast products
 * @returns {Object} Styled GeoJSON for Mapbox
 */
export const createAvalancheLayer = (avalancheAreas, products) => {
    if (!avalancheAreas || !avalancheAreas.features) return null;

    // Create a map of area IDs to danger ratings
    const ratingMap = {};
    if (products) {
        products.forEach((product) => {
            if (product.area?.id && product.report?.dangerRatings?.[0]) {
                const alpineRating = product.report.dangerRatings[0].ratings?.alp?.rating?.value;
                const level = getRatingLevel(alpineRating);
                ratingMap[product.area.id] = level;
            }
        });
    }

    // Add properties to each feature
    return {
        ...avalancheAreas,
        features: avalancheAreas.features.map((feature) => ({
            ...feature,
            properties: {
                ...feature.properties,
                dangerLevel: ratingMap[feature.id] || 0,
                color: AVALANCHE_COLORS[ratingMap[feature.id]] || '#9E9E9E',
            },
        })),
    };
};

/**
 * Helper to get numeric danger level from API string
 */
const getRatingLevel = (ratingValue) => {
    const map = {
        low: 1,
        moderate: 2,
        considerable: 3,
        high: 4,
        extreme: 5,
    };
    return map[ratingValue?.toLowerCase()] || 0;
};

/**
 * Create marker clustering configuration
 */
export const CLUSTER_CONFIG = {
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points
};
