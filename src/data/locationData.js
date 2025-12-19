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
        region: 'Coast Mountains',
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
        region: 'Interior',
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
        region: 'Interior',
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
        region: 'Interior',
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
        region: 'Rockies',
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
        region: 'Rockies',
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
        region: 'Rockies',
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
        region: 'Rockies',
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
        region: 'Rockies',
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
        region: 'Interior',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
        coordinates: { lat: 50.1167, lon: -123.1500 },
        elevation: { base: 2100, summit: 2800 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Helicopter or ski access from Squamish',
            permits: 'Hut booking required',
            description: 'Remote ACC hut in Tantalus Range behind Whistler'
        }
    },
    {
        name: 'Fairy Meadow Hut',
        displayName: 'Fairy Meadow Hut',
        type: locationTypes.BACKCOUNTRY,
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
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
        region: 'Coast Mountains',
        coordinates: { lat: 50.3167, lon: -122.5833 },
        elevation: { base: 1400, summit: 2600 },
        avalancheZone: 'Sea-to-Sky',
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Cat skiing operation',
            permits: 'Booking required',
            description: 'Cat skiing operation with deep coastal snow'
        }
    },

    // Additional Ski Resorts
    {
        name: 'Red Mountain',
        displayName: 'Red Mountain Resort',
        type: locationTypes.RESORT,
        region: 'Interior',
        coordinates: { lat: 49.0967, lon: -117.8253 },
        elevation: { base: 1185, summit: 2075 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        resortInfo: {
            verticalDrop: 890,
            skiableAcres: 4200,
            lifts: 7,
            trails: 119,
            website: 'https://www.redresort.com',
            description: 'Legendary powder and tree skiing near Rossland'
        }
    },
    {
        name: 'Apex',
        displayName: 'Apex Mountain Resort',
        type: locationTypes.RESORT,
        region: 'Interior',
        coordinates: { lat: 49.4667, lon: -119.9333 },
        elevation: { base: 1508, summit: 2180 },
        avalancheZone: 'South Columbia',
        nearestWeatherStation: 14, // Apex Roadside
        resortInfo: {
            verticalDrop: 610,
            skiableAcres: 1120,
            lifts: 4,
            trails: 82,
            website: 'https://www.apexresort.com',
            description: 'Family-friendly resort with consistent snowfall'
        }
    },
    {
        name: 'Powder King',
        displayName: 'Powder King Mountain Resort',
        type: locationTypes.RESORT,
        region: 'North BC',
        coordinates: { lat: 55.4167, lon: -122.6667 },
        elevation: { base: 1524, summit: 2267 },
        avalancheZone: 'North Rockies',
        nearestWeatherStation: 8, // Kakwa
        resortInfo: {
            verticalDrop: 610,
            skiableAcres: 1500,
            lifts: 3,
            trails: 35,
            website: 'https://www.powderking.com',
            description: 'Deep powder and remote northern BC skiing'
        }
    },
    {
        name: 'Hudson Bay Mountain',
        displayName: 'Hudson Bay Mountain (Smithers)',
        type: locationTypes.RESORT,
        region: 'North BC',
        coordinates: { lat: 54.7833, lon: -127.3167 },
        elevation: { base: 1066, summit: 1981 },
        avalancheZone: 'Northwest',
        nearestWeatherStation: 85, // Telkwa
        resortInfo: {
            verticalDrop: 915,
            skiableAcres: 1750,
            lifts: 3,
            trails: 30,
            website: 'https://www.hudsonbaymountain.com',
            description: 'Northern BC resort with stunning views'
        }
    },
    {
        name: 'Shames Mountain',
        displayName: 'Shames Mountain',
        type: locationTypes.RESORT,
        region: 'North BC',
        coordinates: { lat: 54.4167, lon: -128.6667 },
        elevation: { base: 579, summit: 1220 },
        avalancheZone: 'Northwest',
        nearestWeatherStation: 7, // Hankin-Evelyn
        resortInfo: {
            verticalDrop: 488,
            skiableAcres: 400,
            lifts: 2,
            trails: 32,
            website: 'https://www.shamesmountain.com',
            description: 'Coastal powder near Terrace'
        }
    },

    // Additional Backcountry Huts
    {
        name: 'Kokanee Glacier Cabin',
        displayName: 'Kokanee Glacier Cabin',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.7333, lon: -117.1167 },
        elevation: { base: 1920, summit: 2500 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Gibson Lake trailhead',
            permits: 'Hut booking required',
            description: 'ACC hut with glacier skiing and alpine touring'
        }
    },
    {
        name: 'Slocan Chief Cabin',
        displayName: 'Slocan Chief Cabin',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.8167, lon: -117.3667 },
        elevation: { base: 2000, summit: 2600 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Slocan Valley',
            permits: 'Hut booking required',
            description: 'ACC hut in Valhalla Provincial Park area'
        }
    },
    {
        name: 'Valhalla Hut',
        displayName: 'Valhalla Hut',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.8667, lon: -117.4333 },
        elevation: { base: 2100, summit: 2700 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Slocan Valley',
            permits: 'Hut booking required',
            description: 'Remote hut in stunning Valhalla Provincial Park'
        }
    },
    {
        name: 'Asulkan Cabin',
        displayName: 'Asulkan Cabin (Rogers Pass)',
        type: locationTypes.BACKCOUNTRY,
        region: 'Rockies',
        coordinates: { lat: 51.2667, lon: -117.5167 },
        elevation: { base: 1950, summit: 2800 },
        avalancheZone: 'Glacier National Park',
        nearestWeatherStation: 62, // Gamma
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Rogers Pass via Illecillewaet campground',
            permits: 'Required - Parks Canada',
            description: 'Classic ACC hut with world-class ski mountaineering'
        }
    },
    {
        name: 'Wheeler Hut',
        displayName: 'Wheeler Hut',
        type: locationTypes.BACKCOUNTRY,
        region: 'Rockies',
        coordinates: { lat: 51.2833, lon: -117.4833 },
        elevation: { base: 2000, summit: 2800 },
        avalancheZone: 'Glacier National Park',
        nearestWeatherStation: 62, // Gamma
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Rogers Pass',
            permits: 'Required - Parks Canada',
            description: 'ACC hut with access to Hermit Range skiing'
        }
    },

    // Additional Backcountry Zones
    {
        name: 'Retallack',
        displayName: 'Retallack Lodge Area',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.9167, lon: -117.1833 },
        elevation: { base: 1400, summit: 2400 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 26, // Lardeau
        backcountryInfo: {
            difficulty: 'Intermediate to Advanced',
            access: 'Cat skiing operation',
            permits: 'Booking required',
            description: 'Premier cat skiing in West Kootenays'
        }
    },
    {
        name: 'Baldface',
        displayName: 'Baldface Lodge Area',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.2833, lon: -117.2167 },
        elevation: { base: 1600, summit: 2600 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Cat skiing operation',
            permits: 'Booking required',
            description: 'World-renowned cat skiing with deep powder'
        }
    },
    {
        name: 'Valhalla Provincial Park',
        displayName: 'Valhalla Provincial Park',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 49.9000, lon: -117.4500 },
        elevation: { base: 1200, summit: 2800 },
        avalancheZone: 'Kootenay Boundary',
        nearestWeatherStation: 41, // Kootenay Pass
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Various trailheads from Slocan Valley',
            permits: 'BC Parks permit required',
            description: 'Pristine wilderness with alpine skiing'
        }
    },
    {
        name: 'Monashee Mountains',
        displayName: 'Monashee Mountains',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 50.5000, lon: -118.5000 },
        elevation: { base: 1500, summit: 2800 },
        avalancheZone: 'South Columbia',
        nearestWeatherStation: 29, // Black Wall
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Various access points',
            permits: 'Varies by area',
            description: 'Deep interior powder and remote terrain'
        }
    },
    {
        name: 'Cariboo Mountains',
        displayName: 'Cariboo Mountains',
        type: locationTypes.BACKCOUNTRY,
        region: 'North BC',
        coordinates: { lat: 52.7500, lon: -120.0000 },
        elevation: { base: 1600, summit: 2900 },
        avalancheZone: 'Cariboo',
        nearestWeatherStation: 6, // Lucille
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Remote access via helicopter or snowmobile',
            permits: 'Varies by area',
            description: 'Remote northern BC mountains with deep snowpack'
        }
    },
    {
        name: 'Selkirk Mountains',
        displayName: 'Selkirk Mountains',
        type: locationTypes.BACKCOUNTRY,
        region: 'Interior',
        coordinates: { lat: 50.8000, lon: -117.5000 },
        elevation: { base: 1500, summit: 3000 },
        avalancheZone: 'North Columbia',
        nearestWeatherStation: 90, // Core Lodge
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Various access points',
            permits: 'Varies by area',
            description: 'Classic BC interior range with deep snow'
        }
    },
    {
        name: 'Purcell Mountains',
        displayName: 'Purcell Mountains',
        type: locationTypes.BACKCOUNTRY,
        region: 'Rockies',
        coordinates: { lat: 50.5000, lon: -116.5000 },
        elevation: { base: 1400, summit: 3000 },
        avalancheZone: 'Purcell',
        nearestWeatherStation: 28, // Kicking Horse
        backcountryInfo: {
            difficulty: 'Advanced',
            access: 'Various access points',
            permits: 'Varies by area',
            description: 'Extensive range with varied terrain'
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

/**
 * Get locations by region
 * @param {string} region - Region name ('Coast Mountains', 'Interior', 'Rockies', 'North BC')
 * @returns {Array} Array of locations in the specified region
 */
export const getLocationsByRegion = (region) => {
    return locations.filter(loc => loc.region === region);
};

/**
 * Get all available regions
 * @returns {Array} Array of unique region names
 */
export const getRegions = () => {
    const regions = [...new Set(locations.map(loc => loc.region).filter(Boolean))];
    // Sort regions in a logical order
    const order = ['Coast Mountains', 'Interior', 'Rockies', 'North BC'];
    return regions.sort((a, b) => order.indexOf(a) - order.indexOf(b));
};
