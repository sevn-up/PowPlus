import React, { useEffect, useState } from 'react';
import './WeatherBackground.css';

/**
 * Carrot Weather-style illustrated background
 * Creates layered mountain/tree scenes that change based on weather
 */
const WeatherBackground = ({ weatherCode }) => {
    const [sceneType, setSceneType] = useState('clear');

    useEffect(() => {
        // Map WMO weather codes to scene types
        if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            setSceneType('snow');
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
            setSceneType('rain');
        } else if ([45, 48].includes(weatherCode)) {
            setSceneType('fog');
        } else if ([2, 3].includes(weatherCode)) {
            setSceneType('cloudy');
        } else if ([0, 1].includes(weatherCode)) {
            setSceneType('clear');
        } else if ([95, 96, 99].includes(weatherCode)) {
            setSceneType('storm');
        } else {
            setSceneType('clear');
        }
    }, [weatherCode]);

    return (
        <div className={`weather-background weather-background-${sceneType}`}>
            {/* Sky Layer */}
            <div className="sky-layer"></div>
            
            {/* Sun/Moon */}
            {(sceneType === 'clear' || sceneType === 'cloudy') && (
                <div className="sun"></div>
            )}
            
            {/* Mountain Layers (back to front) */}
            <div className="mountain-layer mountain-far"></div>
            <div className="mountain-layer mountain-mid"></div>
            <div className="mountain-layer mountain-near"></div>
            
            {/* Tree Layer */}
            <div className="tree-layer">
                <div className="tree tree-1"></div>
                <div className="tree tree-2"></div>
                <div className="tree tree-3"></div>
                <div className="tree tree-4"></div>
                <div className="tree tree-5"></div>
                <div className="tree tree-6"></div>
            </div>
            
            {/* Ground/Snow Layer */}
            <div className="ground-layer"></div>
        </div>
    );
};

export default WeatherBackground;
