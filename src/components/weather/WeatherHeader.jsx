import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * Weather Header Component
 * Displays location info, current temperature, and conditions
 */
const WeatherHeader = ({ weather }) => {
    if (!weather) return null;

    return (
        <div className="text-center text-white mb-5">
            <div className="d-inline-flex align-items-center gap-2 bg-dark bg-opacity-50 px-3 py-1 rounded-pill border border-white border-opacity-10 mb-3 shadow-sm backdrop-blur-md">
                <MapPin size={14} />
                <span className="small fw-bold">{weather.country}</span>
                {weather.elevation && (
                    <span className="small border-start border-secondary ps-2">
                        {weather.elevation}m
                    </span>
                )}
            </div>
            <h1 className="display-3 fw-black mb-0 text-shadow-lg tracking-tight">
                {weather.locationName}
            </h1>
            <div className="display-1 fw-light my-2 text-shadow-md">
                {Math.round(weather.current.temperature_2m)}°
            </div>
            <div className="fs-4 text-info text-capitalize fw-medium text-shadow-sm">
                {weather.weatherDescription || 'Clear'}
            </div>
            <div className="d-flex justify-content-center gap-4 mt-2 text-white fw-medium text-shadow-sm">
                <span>
                    H: {Math.round(Math.max(...weather.hourly.temperature_2m.slice(0, 24)))}°
                </span>
                <span>
                    L: {Math.round(Math.min(...weather.hourly.temperature_2m.slice(0, 24)))}°
                </span>
            </div>
        </div>
    );
};

export default WeatherHeader;
