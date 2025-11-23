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
