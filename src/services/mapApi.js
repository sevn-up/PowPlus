const DRIVEBC_BASE = 'https://api.open511.gov.bc.ca';

/**
 * Fetch road events from DriveBC Open511 API
 * @param {Object} bounds - Optional map bounds to filter events {north, south, east, west}
 * @param {number} limit - Maximum number of events to fetch (max 500)
 * @returns {Promise<Array>} Array of road events
 */
export const getDriveBCEvents = async (bounds = null, limit = 500) => {
    try {
        let url = `${DRIVEBC_BASE}/events?format=json&status=ACTIVE&limit=${limit}`;

        // Add bbox parameter if bounds provided
        if (bounds) {
            url += `&bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch DriveBC events');

        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error('DriveBC API error:', error);
        return [];
    }
};

/**
 * Check if event is a road closure
 * @param {Object} event - Event object from API
 * @returns {boolean} True if event is a road closure
 */
export const isRoadClosure = (event) => {
    if (!event) return false;
    const desc = (event.description || '').toLowerCase();
    return desc.includes('road closed') ||
        desc.includes('closure') ||
        desc.includes('closed');
};

/**
 * Parse event type to display information with enhanced natural disaster and closure detection
 * @param {string} eventType - Event type from API
 * @param {string} description - Optional event description for detailed categorization
 * @returns {Object} Display info with icon, color, and label
 */
export const parseEventType = (eventType, description = '') => {
    const desc = description.toLowerCase();

    // CRITICAL: Natural Disasters & Road Closures (INCIDENT type)
    if (eventType === 'INCIDENT') {
        // Landslide
        if (desc.includes('landslide') || desc.includes('landslip')) {
            return { label: 'Landslide', color: '#8B4513', icon: '🪨' };
        }

        // Flooding / Washout
        if (desc.includes('flood') || desc.includes('washout')) {
            return { label: 'Flooding', color: '#1E88E5', icon: '🌊' };
        }

        // Avalanche-related closure
        if (desc.includes('avalanche') && (desc.includes('closed') || desc.includes('closure'))) {
            return { label: 'Avalanche Closure', color: '#D32F2F', icon: '⛔' };
        }

        // General road closure
        if (desc.includes('road closed') || desc.includes('closure')) {
            return { label: 'Road Closed', color: '#C62828', icon: '🚫' };
        }

        // Default incident
        return { label: 'Incident', color: '#FF4444', icon: '⚠️' };
    }

    // Enhanced ROAD_CONDITION sub-categorization
    if (eventType === 'ROAD_CONDITION') {
        // High Priority: Chains/4x4 Required (critical for trip planning)
        if (desc.includes('chain') || desc.includes('4x4') || desc.includes('4wd')) {
            return { label: 'Chains Required', color: '#FF6B35', icon: '⛓️' };
        }

        // High Priority: Ice conditions (safety critical)
        if (desc.includes('black ice') || desc.includes('icy') || desc.includes('ice')) {
            return { label: 'Ice Warning', color: '#4FC3F7', icon: '🧊' };
        }

        // High Priority: Snow on road
        if (desc.includes('compact snow') || desc.includes('snow covered') ||
            desc.includes('loose snow') || desc.includes('snow on road')) {
            return { label: 'Snow on Road', color: '#81C3D7', icon: '🌨️' };
        }

        // Medium Priority: Drifting/blowing snow (visibility issue)
        if (desc.includes('drifting') || desc.includes('blowing snow')) {
            return { label: 'Blowing Snow', color: '#B0BEC5', icon: '💨' };
        }

        // Medium Priority: Visibility issues
        if (desc.includes('fog') || desc.includes('visibility reduced') ||
            desc.includes('limited visibility')) {
            return { label: 'Poor Visibility', color: '#90A4AE', icon: '🌫️' };
        }

        // Medium Priority: Debris/obstacles
        if (desc.includes('debris') || desc.includes('fallen rock') ||
            desc.includes('rockfall') || desc.includes('fallen tree')) {
            return { label: 'Debris', color: '#8D6E63', icon: '🪨' };
        }

        // Medium Priority: Slippery conditions
        if (desc.includes('slippery') || desc.includes('slushy')) {
            return { label: 'Slippery Road', color: '#FFA726', icon: '⚠️' };
        }

        // Default road condition
        return { label: 'Road Condition', color: '#FFD700', icon: '🛣️' };
    }

    // Enhanced WEATHER_CONDITION sub-categorization
    if (eventType === 'WEATHER_CONDITION') {
        // Heavy snow
        if (desc.includes('heavy snow') || desc.includes('snowfall') || desc.includes('snow storm')) {
            return { label: 'Heavy Snow', color: '#1976D2', icon: '❄️' };
        }

        // Fog
        if (desc.includes('fog') || desc.includes('limited visibility')) {
            return { label: 'Fog', color: '#78909C', icon: '🌫️' };
        }

        // Rain
        if (desc.includes('rain') || desc.includes('heavy rain') || desc.includes('storm')) {
            return { label: 'Heavy Rain', color: '#0288D1', icon: '🌧️' };
        }

        // High winds
        if (desc.includes('wind') || desc.includes('high wind') || desc.includes('gale')) {
            return { label: 'High Winds', color: '#546E7A', icon: '💨' };
        }

        // Avalanche risk
        if (desc.includes('avalanche')) {
            return { label: 'Avalanche Risk', color: '#D32F2F', icon: '⚠️' };
        }

        // Default weather condition
        return { label: 'Weather', color: '#4A90E2', icon: '☁️' };
    }

    // CONSTRUCTION - Less prominent since we're filtering most out
    if (eventType === 'CONSTRUCTION') {
        return {
            label: 'Construction',
            color: '#FFA500',
            icon: '🚧'
        };
    }

    // SPECIAL_EVENT
    if (eventType === 'SPECIAL_EVENT') {
        return {
            label: 'Special Event',
            color: '#9B59B6',
            icon: '📅'
        };
    }

    // Default
    return {
        label: 'Other',
        color: '#95A5A6',
        icon: 'ℹ️'
    };
};

/**
 * Get severity level information
 * @param {string} severity - Severity from API (MINOR, MODERATE, MAJOR, UNKNOWN)
 * @returns {Object} Severity display info
 */
export const parseSeverity = (severity) => {
    const severityMap = {
        'MINOR': {
            label: 'Minor',
            color: '#52C41A',
            priority: 1
        },
        'MODERATE': {
            label: 'Moderate',
            color: '#FAAD14',
            priority: 2
        },
        'MAJOR': {
            label: 'Major',
            color: '#F5222D',
            priority: 3
        },
        'UNKNOWN': {
            label: 'Unknown',
            color: '#8C8C8C',
            priority: 0
        }
    };

    return severityMap[severity] || severityMap['UNKNOWN'];
};

/**
 * Filter events by map bounds
 * @param {Array} events - Array of events
 * @param {Object} bounds - Map bounds {north, south, east, west}
 * @returns {Array} Filtered events
 */
export const filterEventsByBounds = (events, bounds) => {
    if (!bounds || !events) return events;

    return events.filter(event => {
        if (!event.geography || !event.geography.coordinates) return false;

        const [lon, lat] = event.geography.coordinates;
        return (
            lat >= bounds.south &&
            lat <= bounds.north &&
            lon >= bounds.west &&
            lon <= bounds.east
        );
    });
};

/**
 * Extract road names from event
 * @param {Object} event - Event object
 * @returns {string} Formatted road names
 */
export const getRoadNames = (event) => {
    if (!event.roads || event.roads.length === 0) return 'Unknown Road';

    return event.roads
        .map(road => road.name || road.from || 'Highway')
        .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
        .join(', ');
};

/**
 * Extract Next Update time from event description
 * @param {string} description - Event description
 * @returns {string|null} Next update time or null
 */
export const getNextUpdate = (description) => {
    if (!description) return null;
    const match = description.match(/Next update time (.*?)\./);
    return match ? match[1] : null;
};

/**
 * Check if event is a natural disaster
 * @param {Object} event - Event object from API
 * @returns {boolean} True if event is a natural disaster
 */
const isNaturalDisaster = (event) => {
    if (!event || event.event_type !== 'INCIDENT') return false;
    const desc = (event.description || '').toLowerCase();
    return desc.includes('landslide') ||
        desc.includes('flood') ||
        desc.includes('washout') ||
        (desc.includes('avalanche') && (desc.includes('closed') || desc.includes('closure')));
};

/**
 * Prioritize events - FOCUS ON: Road Condition Advisories ONLY
 * @param {Array} events - Array of events
 * @param {number} limit - Maximum number of events to return
 * @returns {Array} Prioritized and limited events
 */
export const prioritizeEvents = (events, limit = 500) => {
    if (!events || events.length === 0) return [];

    // Helper to check if event is a current road condition advisory
    const isCurrentRoadCondition = (event) => {
        // Only show ROAD_CONDITION events
        if (event.event_type !== 'ROAD_CONDITION') return false;

        // STALE DATA CHECK - If event hasn't been updated in 30 days, hide it
        // Road conditions may persist for weeks (e.g., winter highway advisories)
        const daysSinceUpdate = (new Date() - new Date(event.updated)) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > 30) {
            return false;
        }

        // Show all current road conditions (no keyword filtering)
        return true;
    };

    return events
        .filter(isCurrentRoadCondition) // Filter to show ONLY current road conditions
        .sort((a, b) => {
            // 1. Sort by Severity (Highest first)
            const severityA = parseSeverity(a.severity).priority;
            const severityB = parseSeverity(b.severity).priority;
            if (severityB !== severityA) return severityB - severityA;

            // 2. Sort by Recency (Newer first)
            return new Date(b.updated) - new Date(a.updated);
        })
        .slice(0, limit); // Limit to requested number of events
};

