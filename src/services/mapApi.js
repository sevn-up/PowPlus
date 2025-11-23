const DRIVEBC_BASE = 'https://api.open511.gov.bc.ca';

/**
 * Fetch road events from DriveBC Open511 API
 * @param {Object} bounds - Optional map bounds to filter events {north, south, east, west}
 * @returns {Promise<Array>} Array of road events
 */
export const getDriveBCEvents = async (bounds = null) => {
    try {
        let url = `${DRIVEBC_BASE}/events?format=json&status=ACTIVE`;

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
 * Parse event type to display information
 * @param {string} eventType - Event type from API
 * @returns {Object} Display info with icon, color, and label
 */
export const parseEventType = (eventType) => {
    const typeMap = {
        'CONSTRUCTION': {
            label: 'Construction',
            color: '#FFA500',
            icon: '🚧'
        },
        'INCIDENT': {
            label: 'Incident',
            color: '#FF4444',
            icon: '⚠️'
        },
        'WEATHER_CONDITION': {
            label: 'Weather',
            color: '#4A90E2',
            icon: '❄️'
        },
        'ROAD_CONDITION': {
            label: 'Road Condition',
            color: '#FFD700',
            icon: '🛣️'
        },
        'SPECIAL_EVENT': {
            label: 'Special Event',
            color: '#9B59B6',
            icon: '📅'
        }
    };

    return typeMap[eventType] || {
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
 * Prioritize events by severity and relevance to skiing (Key Routes)
 * @param {Array} events - Array of events
 * @param {number} limit - Maximum number of events to return
 * @returns {Array} Prioritized and limited events
 */
export const prioritizeEvents = (events, limit = 75) => {
    if (!events || events.length === 0) return [];

    // Key Ski Highways
    const KEY_ROUTES = [
        'Highway 99', // Sea-to-Sky
        'Highway 1',  // TransCanada
        'Highway 3',  // Crowsnest
        'Highway 5',  // Coquihalla
        'Highway 97'  // Okanagan
    ];

    // Helper to check if event is on a key route
    const isKeyRoute = (event) => {
        if (!event.roads) return false;
        return event.roads.some(road =>
            KEY_ROUTES.some(keyRoute => road.name && road.name.includes(keyRoute))
        );
    };

    // Helper to check if event is relevant
    const isRelevant = (event) => {
        const severity = parseSeverity(event.severity).priority;
        const type = event.event_type;
        const desc = event.description ? event.description.toLowerCase() : '';

        // STALE DATA CHECK:
        // If event hasn't been updated in 30 days, hide it to avoid "July construction" in November.
        // EXCEPTIONS: Major Incidents (might be long term closures) or Road Conditions (seasonal).
        const daysSinceUpdate = (new Date() - new Date(event.updated)) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > 30 && severity < 3 && type !== 'ROAD_CONDITION') {
            return false;
        }

        // 1. ALWAYS SHOW: 
        // - Major incidents (accidents, closures)
        // - Weather conditions (snow, ice, fog)
        // - High Severity events
        if (type === 'INCIDENT' ||
            type === 'WEATHER_CONDITION' ||
            severity >= 3) return true;

        // 2. ROAD CONDITIONS:
        // - Only show if on a Key Route (e.g. Compact Snow on Hwy 5)
        // - Filter out minor side roads (e.g. Nazko Rd)
        if (type === 'ROAD_CONDITION') {
            return isKeyRoute(event);
        }

        // 2. CONSTRUCTION: Be stricter. 
        // - Hide if description says "no delay" or "minor delay" (unless Major severity)
        // - Hide if description says "work on shoulders" (usually irrelevant)
        // - Only show if it involves a closure, single lane, or major delay AND is on a Key Route
        if (type === 'CONSTRUCTION') {
            if (severity >= 3) return true;

            // Explicitly exclude "no delay" or minor impact events
            if (desc.includes('no delay') ||
                desc.includes('expect minor delays') ||
                desc.includes('work on shoulders')) return false;

            const hasImpact = desc.includes('closed') ||
                desc.includes('closure') ||
                desc.includes('single lane') ||
                desc.includes('major delay') ||
                desc.includes('delays'); // General delays, but filtered by "minor" check above

            return isKeyRoute(event) && hasImpact;
        }

        // 3. Default: Hide minor events even on key routes to reduce noise
        return false;
    };

    return events
        .filter(isRelevant) // Filter out irrelevant minor events
        .sort((a, b) => {
            // 1. Sort by Severity (Highest first)
            const severityA = parseSeverity(a.severity).priority;
            const severityB = parseSeverity(b.severity).priority;
            if (severityB !== severityA) return severityB - severityA;

            // 2. Sort by Type (Incidents/Weather/Road Conditions > Construction)
            const getTypePriority = (type) => {
                if (type === 'INCIDENT') return 4;
                if (type === 'WEATHER_CONDITION') return 3;
                if (type === 'ROAD_CONDITION') return 3;
                if (type === 'CONSTRUCTION') return 1;
                return 2;
            };
            const typeA = getTypePriority(a.event_type);
            const typeB = getTypePriority(b.event_type);
            if (typeB !== typeA) return typeB - typeA;

            // 3. Sort by Key Route (Key routes first)
            const keyA = isKeyRoute(a) ? 1 : 0;
            const keyB = isKeyRoute(b) ? 1 : 0;
            if (keyB !== keyA) return keyB - keyA;

            // 4. Sort by Update Time (Newest first)
            return new Date(b.updated) - new Date(a.updated);
        })
        .slice(0, limit);
};
