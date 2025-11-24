/**
 * Station Matcher Service
 * Intelligently matches locations to the closest avalanche weather stations
 * using Haversine distance calculations and zone filtering
 */

/**
 * Calculate Haversine distance between two coordinates
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Avalanche Canada weather stations database
 * Compiled from https://www.avalanche.ca/weather/stations
 * Note: This is a subset of key BC stations. Full database would include 100+ stations.
 */
export const avalancheStations = [
    // BC Ministry of Transportation & Infrastructure Stations
    { id: 41, name: 'Kootenay Pass', lat: 49.0833, lon: -116.9167, elevation: 1775, zone: 'Kootenay Boundary', operator: 'BC MoTI' },
    { id: 15, name: 'Coquihalla Summit', lat: 49.7167, lon: -121.0667, elevation: 1244, zone: 'South Coast', operator: 'BC MoTI' },
    { id: 28, name: 'Kicking Horse', lat: 51.2989, lon: -117.0519, elevation: 1190, zone: 'Purcell', operator: 'BC MoTI' },
    { id: 71, name: 'Brandywine', lat: 50.0333, lon: -123.1167, elevation: 1200, zone: 'Sea-to-Sky', operator: 'BC MoTI' },
    { id: 73, name: 'Allison Pass', lat: 49.0667, lon: -120.7333, elevation: 1342, zone: 'South Coast', operator: 'BC MoTI' },
    { id: 74, name: 'Cayoosh Summit', lat: 50.5833, lon: -122.6667, elevation: 1270, zone: 'Sea-to-Sky', operator: 'BC MoTI' },

    // Avalanche Canada Stations
    { id: 90, name: 'Core Lodge', lat: 51.5167, lon: -117.8333, elevation: 1900, zone: 'North Columbia', operator: 'Avalanche Canada' },
    { id: 118, name: 'Fraser', lat: 52.7500, lon: -118.9167, elevation: 1650, zone: 'North Rockies', operator: 'Avalanche Canada' },
    { id: 120, name: 'Haines Pass', lat: 59.6333, lon: -136.0167, elevation: 1067, zone: 'Northwest', operator: 'Avalanche Canada' },
    { id: 7, name: 'Hankin-Evelyn', lat: 54.5833, lon: -127.2500, elevation: 1830, zone: 'Northwest', operator: 'Avalanche Canada' },
    { id: 8, name: 'Kakwa', lat: 54.0833, lon: -119.9167, elevation: 1950, zone: 'North Rockies', operator: 'Avalanche Canada' },
    { id: 6, name: 'Lucille', lat: 52.9167, lon: -119.3333, elevation: 1890, zone: 'North Rockies', operator: 'Avalanche Canada' },
    { id: 105, name: 'Summit Creek', lat: 50.4167, lon: -122.5833, elevation: 1850, zone: 'Sea-to-Sky', operator: 'Avalanche Canada' },
    { id: 85, name: 'Telkwa', lat: 54.6833, lon: -127.0667, elevation: 1750, zone: 'Northwest', operator: 'Avalanche Canada' },

    // Additional key BC MoTI stations
    { id: 29, name: 'Black Wall', lat: 50.9167, lon: -118.2833, elevation: 1400, zone: 'North Columbia', operator: 'BC MoTI' },
    { id: 19, name: 'Blowdown Peak', lat: 49.3833, lon: -120.2167, elevation: 1950, zone: 'South Columbia', operator: 'BC MoTI' },
    { id: 37, name: 'Caribou Ridge', lat: 50.8167, lon: -119.8833, elevation: 1650, zone: 'South Columbia', operator: 'BC MoTI' },
    { id: 62, name: 'Gamma', lat: 51.2500, lon: -117.5833, elevation: 1330, zone: 'Glacier National Park', operator: 'BC MoTI' },
    { id: 86, name: 'Gold Bridge', lat: 50.6667, lon: -122.8333, elevation: 900, zone: 'Sea-to-Sky', operator: 'BC MoTI' },
    { id: 46, name: 'Heckman Pass', lat: 52.3833, lon: -126.7500, elevation: 1524, zone: 'Northwest', operator: 'BC MoTI' },
];

/**
 * Find the closest weather station to given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} options - Optional filters
 * @param {string} options.zone - Avalanche zone to filter by
 * @param {number} options.maxDistance - Maximum distance in km (default: 100)
 * @returns {Object|null} Closest station with distance and confidence score
 */
export const findClosestStation = (lat, lon, options = {}) => {
    const { zone, maxDistance = 100 } = options;

    // Filter stations by zone if specified
    let candidateStations = avalancheStations;
    if (zone) {
        const zoneStations = avalancheStations.filter(s => s.zone === zone);
        // If zone has stations, use them; otherwise fall back to all stations
        if (zoneStations.length > 0) {
            candidateStations = zoneStations;
        }
    }

    // Calculate distances to all candidate stations
    const stationsWithDistance = candidateStations.map(station => {
        const distance = calculateDistance(lat, lon, station.lat, station.lon);
        return {
            ...station,
            distance,
            distanceKm: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
    });

    // Sort by distance
    stationsWithDistance.sort((a, b) => a.distance - b.distance);

    // Get closest station
    const closest = stationsWithDistance[0];

    // Return null if beyond max distance
    if (!closest || closest.distance > maxDistance) {
        return null;
    }

    // Calculate confidence score
    const confidence = calculateConfidence(closest, zone, lat, lon);

    return {
        ...closest,
        confidence,
        confidenceLabel: getConfidenceLabel(confidence)
    };
};

/**
 * Find best station considering zone match, distance, and elevation
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} avalancheZone - Avalanche forecast zone
 * @param {number} elevation - Location elevation (optional)
 * @returns {Object|null} Best matched station
 */
export const findBestStation = (lat, lon, avalancheZone, elevation = null) => {
    // First try to find station in same zone
    const zoneMatch = findClosestStation(lat, lon, { zone: avalancheZone, maxDistance: 50 });

    if (zoneMatch && zoneMatch.confidence > 0.7) {
        return zoneMatch;
    }

    // If no good zone match, find closest overall
    const closestOverall = findClosestStation(lat, lon, { maxDistance: 100 });

    // If we have elevation data, prefer stations with similar elevation
    if (elevation && closestOverall) {
        const nearbyStations = avalancheStations
            .map(station => ({
                ...station,
                distance: calculateDistance(lat, lon, station.lat, station.lon),
                elevationDiff: Math.abs(elevation - station.elevation)
            }))
            .filter(s => s.distance < 100)
            .sort((a, b) => {
                // Weight: 70% distance, 30% elevation similarity
                const scoreA = (a.distance * 0.7) + (a.elevationDiff / 10 * 0.3);
                const scoreB = (b.distance * 0.7) + (b.elevationDiff / 10 * 0.3);
                return scoreA - scoreB;
            });

        if (nearbyStations.length > 0) {
            const best = nearbyStations[0];
            return {
                ...best,
                distanceKm: Math.round(best.distance * 10) / 10,
                confidence: calculateConfidence(best, avalancheZone, lat, lon),
                confidenceLabel: getConfidenceLabel(calculateConfidence(best, avalancheZone, lat, lon))
            };
        }
    }

    return closestOverall;
};

/**
 * Get top N closest stations
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} count - Number of stations to return (default: 3)
 * @param {Object} options - Optional filters
 * @returns {Array} Array of closest stations
 */
export const findNearestStations = (lat, lon, count = 3, options = {}) => {
    const { zone, maxDistance = 100 } = options;

    let candidateStations = avalancheStations;
    if (zone) {
        const zoneStations = avalancheStations.filter(s => s.zone === zone);
        if (zoneStations.length > 0) {
            candidateStations = zoneStations;
        }
    }

    const stationsWithDistance = candidateStations
        .map(station => {
            const distance = calculateDistance(lat, lon, station.lat, station.lon);
            return {
                ...station,
                distance,
                distanceKm: Math.round(distance * 10) / 10,
                confidence: calculateConfidence({ ...station, distance }, zone, lat, lon),
            };
        })
        .filter(s => s.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count)
        .map(s => ({
            ...s,
            confidenceLabel: getConfidenceLabel(s.confidence)
        }));

    return stationsWithDistance;
};

/**
 * Calculate confidence score for a station match
 * @param {Object} station - Station with distance
 * @param {string} zone - Target avalanche zone
 * @param {number} lat - Target latitude
 * @param {number} lon - Target longitude
 * @returns {number} Confidence score (0-1)
 */
const calculateConfidence = (station, zone, lat, lon) => {
    let score = 1.0;

    // Distance penalty (70% weight)
    if (station.distance > 50) {
        score -= 0.4;
    } else if (station.distance > 25) {
        score -= 0.2;
    } else if (station.distance > 10) {
        score -= 0.1;
    }

    // Zone mismatch penalty (20% weight)
    if (zone && station.zone !== zone) {
        score -= 0.2;
    }

    // Elevation difference penalty (10% weight) - estimated
    // This is a simplified version; real implementation would need elevation data

    return Math.max(0, Math.min(1, score));
};

/**
 * Get confidence label from score
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Label
 */
const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
};

/**
 * Get station data URL for Avalanche Canada
 * @param {number} stationId - Station ID
 * @returns {string} URL to station data page
 */
export const getStationDataUrl = (stationId) => {
    return `https://www.avalanche.ca/weather/stations/${stationId}`;
};
