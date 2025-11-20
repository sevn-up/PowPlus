// BC Ski Resorts and Backcountry Locations Database

export const locationTypes = {
    RESORT: 'resort',
    BACKCOUNTRY: 'backcountry',
    CUSTOM: 'custom'
};

export const locations = [
    // Major Ski Resorts
    {
        name: 'Whistler',
        displayName: 'Whistler Blackcomb',
        type: locationTypes.RESORT,
        coordinates: { lat: 50.1163, lon: -122.9574 },
        elevation: { base: 675, summit: 2284 },
        avalancheZone: 'Sea-to-Sky',
        resortInfo: {
            verticalDrop: 1609,
            skiableAcres: 8171,
            lifts: 37,
            trails: 200,
            website: 'https://www.whistlerblackcomb.com',
            description: 'Largest ski resort in North America'
        }
    },
    {
        name: 'Revelstoke',
        displayName: 'Revelstoke Mountain Resort',
        type: locationTypes.RESORT,
        coordinates: { lat: 50.8983, lon: -118.1956 },
        elevation: { base: 1713, summit: 2225 },
        avalancheZone: 'North Columbia',
        resortInfo: {
            verticalDrop: 1713,
            skiableAcres: 3121,
            lifts: 6,
            trails: 69,
            website: 'https://www.revelstokemountainresort.com',
            description: 'Highest vertical in North America'
        }
    },
    {
        name: 'Big White',
        displayName: 'Big White Ski Resort',
        type: locationTypes.RESORT,
        coordinates: { lat: 49.7311, lon: -118.9358 },
        elevation: { base: 1508, summit: 2319 },
        avalancheZone: 'South Columbia',
        resortInfo: {
            verticalDrop: 777,
            skiableAcres: 2765,
            lifts: 16,
            trails: 119,
            website: 'https://www.bigwhite.com',
            description: 'Famous for champagne powder'
        }
    },
    {
        name: 'Sun Peaks',
        displayName: 'Sun Peaks Resort',
        type: locationTypes.RESORT,
        coordinates: { lat: 50.8833, lon: -119.8833 },
        elevation: { base: 1255, summit: 2080 },
        avalancheZone: 'South Columbia',
        resortInfo: {
            verticalDrop: 881,
            skiableAcres: 4270,
            lifts: 13,
            trails: 137,
            website: 'https://www.sunpeaksresort.com',
            description: 'Second largest ski area in Canada'
        }
    },
    {
        name: 'Fernie',
        displayName: 'Fernie Alpine Resort',
        type: locationTypes.RESORT,
        coordinates: { lat: 49.4667, lon: -115.0667 },
        elevation: { base: 1065, summit: 1925 },
        avalancheZone: 'Lizard Range',
        resortInfo: {
            verticalDrop: 857,
            skiableAcres: 2504,
            lifts: 10,
            trails: 142,
            website: 'https://www.skifernie.com',
            description: 'Legendary powder and tree skiing'
        }
    },
    {
        name: 'Kicking Horse',
        displayName: 'Kicking Horse Mountain Resort',
        type: locationTypes.RESORT,
        coordinates: { lat: 51.2989, lon: -117.0519 },
        elevation: { base: 1190, summit: 2450 },
        avalancheZone: 'Purcell',
        resortInfo: {
            verticalDrop: 1260,
            skiableAcres: 2800,
            lifts: 6,
            trails: 120,
            website: 'https://www.kickinghorseresort.com',
            description: 'Steep terrain and deep powder'
        }
    },

    // Backcountry Zones
    {
        name: 'Rogers Pass',
        displayName: 'Rogers Pass',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 51.3011, lon: -117.5208 },
        elevation: { base: 1330, summit: 2600 },
        avalancheZone: 'Glacier National Park',
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Highway 1 parking areas',
            permits: 'Required - Parks Canada',
            description: 'World-class backcountry skiing with high avalanche hazard'
        }
    },
    {
        name: 'Kootenay Pass',
        displayName: 'Kootenay Pass',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 49.0833, lon: -116.9167 },
        elevation: { base: 1775, summit: 2100 },
        avalancheZone: 'Kootenay Boundary',
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Highway 3 parking',
            permits: 'Not required',
            description: 'Deep snowpack and accessible terrain'
        }
    },
    {
        name: 'Golden',
        displayName: 'Golden Area',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 51.2981, lon: -116.9633 },
        elevation: { base: 785, summit: 2500 },
        avalancheZone: 'Purcell',
        backcountryInfo: {
            difficulty: 'All levels',
            access: 'Various trailheads',
            permits: 'Varies by area',
            description: 'Hub for backcountry skiing and cat skiing'
        }
    },
    {
        name: 'Nelson',
        displayName: 'Nelson/Whitewater',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 49.4928, lon: -117.2939 },
        elevation: { base: 530, summit: 2044 },
        avalancheZone: 'Kootenay Boundary',
        backcountryInfo: {
            difficulty: 'Intermediate',
            access: 'Whitewater Ski Resort base',
            permits: 'Not required for most areas',
            description: 'Deep powder and tree skiing'
        }
    },

    // Popular Backcountry Huts
    {
        name: 'Wendy Thompson Hut',
        displayName: 'Wendy Thompson Hut',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.5167, lon: -122.7833 },
        elevation: { base: 1800, summit: 2200 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Duffey Lake Road trailhead',
            permits: 'Hut booking required',
            description: 'Popular ACC hut in Cayoosh Range with excellent ski touring'
        }
    },
    {
        name: 'Brew Hut',
        displayName: 'Brew Hut',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 49.7833, lon: -123.1833 },
        elevation: { base: 1500, summit: 2100 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Squamish via logging roads',
            permits: 'Hut booking required',
            description: 'VOC hut with stunning views of Tantalus Range'
        }
    },
    {
        name: 'Kees and Claire Hut',
        displayName: 'Kees and Claire Hut',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.7833, lon: -117.3167 },
        elevation: { base: 2100, summit: 2800 },
        avalancheZone: 'North Columbia',
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Helicopter access from Revelstoke',
            permits: 'Hut booking required',
            description: 'Remote ACC hut in Selkirk Mountains'
        }
    },
    {
        name: 'Fairy Meadow Hut',
        displayName: 'Fairy Meadow Hut',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.7500, lon: -122.8333 },
        elevation: { base: 2000, summit: 2400 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Intermediate',
            access: 'Duffey Lake Road',
            permits: 'Hut booking required',
            description: 'Family-friendly ACC hut with great beginner terrain'
        }
    },
    {
        name: 'Sphinx Bay Hut',
        displayName: 'Sphinx Bay Hut',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.1167, lon: -122.9167 },
        elevation: { base: 1900, summit: 2300 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Intermediate',
            access: 'Garibaldi Lake trailhead',
            permits: 'Hut booking required',
            description: 'VOC hut on Garibaldi Lake with glacier access'
        }
    },

    // Key Backcountry Access Points
    {
        name: 'Duffy Lake Road',
        displayName: 'Duffy Lake Road',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.5833, lon: -122.6667 },
        elevation: { base: 1200, summit: 2400 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'All levels',
            access: 'Highway 99 between Pemberton and Lillooet',
            permits: 'Not required',
            description: 'Premier backcountry access with numerous zones'
        }
    },
    {
        name: 'Coquihalla Summit',
        displayName: 'Coquihalla Summit',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 49.7167, lon: -121.0667 },
        elevation: { base: 1244, summit: 2000 },
        avalancheZone: 'South Coast',
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Highway 5 pullouts',
            permits: 'Not required',
            description: 'Easily accessible backcountry skiing from highway'
        }
    },
    {
        name: 'Joffre Lakes',
        displayName: 'Joffre Lakes Area',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.3833, lon: -122.4833 },
        elevation: { base: 1200, summit: 2500 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Duffey Lake Road parking',
            permits: 'Day use parking reservation required',
            description: 'Stunning alpine terrain with glacier skiing'
        }
    },
    {
        name: 'Powder Mountain',
        displayName: 'Powder Mountain Catskiing',
        type: locationTypes.BACKCOUNTRY,
        coordinates: { lat: 50.3167, lon: -122.5833 },
        elevation: { base: 1400, summit: 2600 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Cat skiing operation',
            permits: 'Booking required',
            description: 'Cat skiing operation with deep coastal snow'
        }
    }
];

/**
 * Get location by name
 * @param {string} name - Location name
 * @returns {Object|null} Location object or null
 */
export const getLocationByName = (name) => {
    return locations.find(loc =>
        loc.name.toLowerCase() === name.toLowerCase() ||
        loc.displayName.toLowerCase() === name.toLowerCase()
    ) || null;
};

/**
 * Get locations by type
 * @param {string} type - Location type (resort/backcountry/custom)
 * @returns {Array} Array of locations
 */
export const getLocationsByType = (type) => {
    return locations.filter(loc => loc.type === type);
};

/**
 * Get all resort locations
 * @returns {Array} Array of resort locations
 */
export const getResorts = () => {
    return getLocationsByType(locationTypes.RESORT);
};

/**
 * Get all backcountry locations
 * @returns {Array} Array of backcountry locations
 */
export const getBackcountryZones = () => {
    return getLocationsByType(locationTypes.BACKCOUNTRY);
};

/**
 * Find closest location to coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object|null} Closest location
 */
export const findClosestLocation = (lat, lon) => {
    let closest = null;
    let minDistance = Infinity;

    locations.forEach(loc => {
        const distance = Math.sqrt(
            Math.pow(lat - loc.coordinates.lat, 2) +
            Math.pow(lon - loc.coordinates.lon, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closest = loc;
        }
    });

    return closest;
};
