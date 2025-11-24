/**
 * Terrain Layer Service
 * Manages terrain/topographic overlay layers for the map using OpenTopoMap
 */

/**
 * Get terrain layer configuration
 * @returns {Object} Configuration object with URL and options
 */
export const getTerrainLayerConfig = () => {
    return {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        options: {
            maxZoom: 17,
            attribution: getTerrainAttribution(),
            subdomains: ['a', 'b', 'c']
        }
    };
};

/**
 * Get proper attribution string for OpenTopoMap
 * @returns {string} Attribution string
 */
export const getTerrainAttribution = () => {
    return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '<a href="http://viewfinderpanoramas.org">SRTM</a> | ' +
        'Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
        '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
};

/**
 * Create terrain layer for Leaflet
 * Note: This returns the configuration object. The actual TileLayer
 * should be created in the React component using L.tileLayer()
 * @returns {Object} Terrain layer configuration
 */
export const createTerrainLayer = () => {
    return getTerrainLayerConfig();
};
