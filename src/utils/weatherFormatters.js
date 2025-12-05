/**
 * Weather formatting utilities
 * Helper functions for formatting times, dates, and directions
 */

/**
 * Format time from ISO string
 * @param {string} isoString - ISO timestamp string
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Convert wind direction degrees to cardinal direction
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal direction (e.g., "NW")
 */
export const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

/**
 * Get UV index color
 * @param {number} index - UV index value
 * @returns {string} Color hex code
 */
export const getUVColor = (index) => {
    if (index >= 11) return '#9333ea'; // Extreme (Purple)
    if (index >= 8) return '#dc2626'; // Very High (Red)
    if (index >= 6) return '#f97316'; // High (Orange)
    if (index >= 3) return '#eab308'; // Moderate (Yellow)
    return '#22c55e'; // Low (Green)
};
