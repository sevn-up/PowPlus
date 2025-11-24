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
 * @returns {Object} Display info with icon, color, label, and category
 */
export const parseEventType = (eventType, description = '') => {
    const desc = description.toLowerCase();

    // CRITICAL: Natural Disasters & Road Closures (INCIDENT type)
    if (eventType === 'INCIDENT') {
        // Landslide
        if (desc.includes('landslide') || desc.includes('landslip')) {
            return { label: 'Landslide', color: '#8B4513', icon: '🏔️', category: 'Natural Hazard' };
        }

        // Flooding / Washout
        if (desc.includes('flood') || desc.includes('washout')) {
            return { label: 'Flooding', color: '#1E88E5', icon: '🌊', category: 'Natural Hazard' };
        }

        // Avalanche-related closure
        if (desc.includes('avalanche') && (desc.includes('closed') || desc.includes('closure'))) {
            return { label: 'Avalanche Closure', color: '#D32F2F', icon: '⛔', category: 'Critical Closure' };
        }

        // General road closure
        if (desc.includes('road closed') || desc.includes('closure')) {
            return { label: 'Road Closed', color: '#C62828', icon: '🚫', category: 'Critical Closure' };
        }

        // Default incident
        return { label: 'Incident', color: '#FF4444', icon: '⚠️', category: 'Road Incident' };
    }

    // Enhanced ROAD_CONDITION sub-categorization
    if (eventType === 'ROAD_CONDITION') {
        // WINTER CONDITIONS
        // Chains Required
        if (desc.includes('chain') || desc.includes('4x4') || desc.includes('4wd')) {
            return { label: 'Chains Required', color: '#FF6B35', icon: '⛓️', category: 'Winter Conditions' };
        }

        // Ice conditions
        if (desc.includes('black ice')) {
            return { label: 'Black Ice', color: '#1E3A8A', icon: '🧊', category: 'Winter Conditions' };
        }
        if (desc.includes('icy') || desc.includes(' ice')) {
            return { label: 'Icy Sections', color: '#4FC3F7', icon: '🧊', category: 'Winter Conditions' };
        }

        // Snow on road
        if (desc.includes('compact snow') || desc.includes('packed snow')) {
            return { label: 'Packed Snow', color: '#5B8FB9', icon: '❄️', category: 'Winter Conditions' };
        }
        if (desc.includes('snow covered') || desc.includes('snow on road')) {
            return { label: 'Snow Covered', color: '#81C3D7', icon: '🌨️', category: 'Winter Conditions' };
        }
        if (desc.includes('loose snow')) {
            return { label: 'Loose Snow', color: '#B0D4E3', icon: '❄️', category: 'Winter Conditions' };
        }

        // Drifting/blowing snow
        if (desc.includes('drifting') || desc.includes('blowing snow')) {
            return { label: 'Blowing Snow', color: '#B0BEC5', icon: '🌬️', category: 'Visibility Warning' };
        }

        // VISIBILITY ISSUES
        if (desc.includes('fog') || desc.includes('limited visibility')) {
            return { label: 'Fog / Low Visibility', color: '#78909C', icon: '🌫️', category: 'Visibility Warning' };
        }
        if (desc.includes('visibility reduced')) {
            return { label: 'Reduced Visibility', color: '#90A4AE', icon: '👁️', category: 'Visibility Warning' };
        }

        // SURFACE HAZARDS
        // Water pooling / wet conditions
        if (desc.includes('water pooling') || desc.includes('pooling water')) {
            return { label: 'Water Pooling', color: '#2196F3', icon: '💧', category: 'Surface Hazard' };
        }
        if (desc.includes('wet') || desc.includes('damp')) {
            return { label: 'Wet Road', color: '#64B5F6', icon: '💦', category: 'Surface Hazard' };
        }

        // Debris/obstacles
        if (desc.includes('rockfall') || desc.includes('fallen rock')) {
            return { label: 'Rockfall', color: '#6D4C41', icon: '🪨', category: 'Surface Hazard' };
        }
        if (desc.includes('debris')) {
            return { label: 'Debris on Road', color: '#8D6E63', icon: '⚠️', category: 'Surface Hazard' };
        }
        if (desc.includes('fallen tree') || desc.includes('tree')) {
            return { label: 'Fallen Tree', color: '#795548', icon: '🌲', category: 'Surface Hazard' };
        }

        // Slippery conditions
        if (desc.includes('slippery')) {
            return { label: 'Slippery Sections', color: '#FFA726', icon: '⚠️', category: 'Surface Hazard' };
        }
        if (desc.includes('slushy')) {
            return { label: 'Slushy Road', color: '#FFB74D', icon: '🌊', category: 'Winter Conditions' };
        }

        // Default road condition - check for any condition keywords
        if (desc.includes('watch for') || desc.includes('caution')) {
            return { label: 'Drive with Caution', color: '#FFC107', icon: '⚠️', category: 'Road Advisory' };
        }

        return { label: 'Road Advisory', color: '#FFD700', icon: '🛣️', category: 'Road Advisory' };
    }

    // Enhanced WEATHER_CONDITION sub-categorization
    if (eventType === 'WEATHER_CONDITION') {
        // Heavy snow
        if (desc.includes('heavy snow') || desc.includes('snowfall') || desc.includes('snow storm')) {
            return { label: 'Heavy Snow', color: '#1976D2', icon: '❄️', category: 'Active Weather' };
        }

        // Fog
        if (desc.includes('fog') || desc.includes('limited visibility')) {
            return { label: 'Fog', color: '#78909C', icon: '🌫️', category: 'Active Weather' };
        }

        // Rain
        if (desc.includes('rain') || desc.includes('heavy rain') || desc.includes('storm')) {
            return { label: 'Heavy Rain', color: '#0288D1', icon: '🌧️', category: 'Active Weather' };
        }

        // High winds
        if (desc.includes('wind') || desc.includes('high wind') || desc.includes('gale')) {
            return { label: 'High Winds', color: '#546E7A', icon: '💨', category: 'Active Weather' };
        }

        // Avalanche risk
        if (desc.includes('avalanche')) {
            return { label: 'Avalanche Risk', color: '#D32F2F', icon: '⚠️', category: 'Active Weather' };
        }

        // Default weather condition
        return { label: 'Weather', color: '#4A90E2', icon: '☁️', category: 'Active Weather' };
    }

    // CONSTRUCTION - Less prominent since we're filtering most out
    if (eventType === 'CONSTRUCTION') {
        return {
            label: 'Construction',
            color: '#FFA500',
            icon: '🚧',
            category: 'Construction'
        };
    }

    // SPECIAL_EVENT
    if (eventType === 'SPECIAL_EVENT') {
        return {
            label: 'Special Event',
            color: '#9B59B6',
            icon: '📅',
            category: 'Special Event'
        };
    }

    // Default
    return {
        label: 'Road Advisory',
        color: '#95A5A6',
        icon: 'ℹ️',
        category: 'Other'
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
 * Extract road segment information (from/to) from event
 * @param {Object} event - Event object
 * @returns {Object|null} Segment info with from and to, or null
 */
export const getRoadSegment = (event) => {
    if (!event.roads || event.roads.length === 0) return null;

    const road = event.roads[0];
    if (!road.from && !road.to) return null;

    return {
        from: road.from || 'Start',
        to: road.to || 'End',
        direction: road.direction || 'BOTH'
    };
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

