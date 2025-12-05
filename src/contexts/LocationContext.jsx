/**
 * Location Context
 * Manages the currently selected location and provides it to all child components
 * Reduces prop drilling and centralizes location state management
 */
import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children, initialLocation = 'Whistler' }) => {
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);

    const value = {
        selectedLocation,
        setSelectedLocation,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

/**
 * Hook to access location context
 * @returns {Object} Location context value with selectedLocation and setSelectedLocation
 */
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
