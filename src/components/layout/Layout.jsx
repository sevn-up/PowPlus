import React from 'react';
import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Layout Component
 * Provides consistent layout wrapper for all pages
 * Includes AnimatedBackground and renders child routes
 */
const Layout = ({ weather }) => {
    return (
        <>
            {/* Animated Background - shared across all pages */}
            {weather && (
                <AnimatedBackground
                    weatherCode={weather.current.weather_code}
                    currentTime={new Date().getTime()}
                    sunrise={new Date(weather.daily.sunrise[0]).getTime()}
                    sunset={new Date(weather.daily.sunset[0]).getTime()}
                />
            )}

            {/* Child routes render here */}
            <Outlet />
        </>
    );
};

export default Layout;
