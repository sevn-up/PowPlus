import React, { useEffect, useState } from 'react';
import './WeatherAnimation.css';

/**
 * Animated weather background component
 * Creates visual effects based on weather conditions
 */
const WeatherAnimation = ({ weatherCode }) => {
    const [animationType, setAnimationType] = useState('clear');

    useEffect(() => {
        // Map WMO weather codes to animation types
        if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            setAnimationType('snow');
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
            setAnimationType('rain');
        } else if ([45, 48].includes(weatherCode)) {
            setAnimationType('fog');
        } else if ([2, 3].includes(weatherCode)) {
            setAnimationType('cloudy');
        } else {
            setAnimationType('clear');
        }
    }, [weatherCode]);

    // Generate snowflakes - MORE for a fun powder day feel!
    const generateSnowflakes = () => {
        const snowflakes = [];
        for (let i = 0; i < 100; i++) {  // Increased from 50 to 100
            snowflakes.push(
                <div
                    key={`snow-${i}`}
                    className="snowflake"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${8 + Math.random() * 12}s`,
                        opacity: 0.4 + Math.random() * 0.6,
                        fontSize: `${12 + Math.random() * 16}px`  // Bigger snowflakes!
                    }}
                >
                    ❄
                </div>
            );
        }
        return snowflakes;
    };

    // Generate raindrops - MORE for dramatic effect!
    const generateRain = () => {
        const raindrops = [];
        for (let i = 0; i < 150; i++) {  // Increased from 100 to 150
            raindrops.push(
                <div
                    key={`rain-${i}`}
                    className="raindrop"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.4 + Math.random() * 0.6}s`,
                        opacity: 0.3 + Math.random() * 0.5,
                        height: `${20 + Math.random() * 15}px`  // Varied raindrop lengths
                    }}
                />
            );
        }
        return raindrops;
    };

    // Generate clouds - MORE puffy clouds!
    const generateClouds = () => {
        const clouds = [];
        for (let i = 0; i < 8; i++) {  // Increased from 5 to 8
            clouds.push(
                <div
                    key={`cloud-${i}`}
                    className="cloud"
                    style={{
                        top: `${5 + Math.random() * 40}%`,
                        animationDelay: `${Math.random() * 15}s`,
                        animationDuration: `${25 + Math.random() * 30}s`,
                        opacity: 0.15 + Math.random() * 0.25,
                        transform: `scale(${0.8 + Math.random() * 0.6})`  // Varied cloud sizes
                    }}
                />
            );
        }
        return clouds;
    };

    return (
        <div className="weather-animation-container">
            {animationType === 'snow' && (
                <div className="snow-container">{generateSnowflakes()}</div>
            )}
            {animationType === 'rain' && (
                <div className="rain-container">{generateRain()}</div>
            )}
            {animationType === 'fog' && (
                <div className="fog-container">
                    <div className="fog-layer fog-layer-1" />
                    <div className="fog-layer fog-layer-2" />
                    <div className="fog-layer fog-layer-3" />
                </div>
            )}
            {animationType === 'cloudy' && (
                <div className="cloud-container">{generateClouds()}</div>
            )}
            {animationType === 'clear' && (
                <div className="clear-container">
                    <div className="star star-1" />
                    <div className="star star-2" />
                    <div className="star star-3" />
                    <div className="star star-4" />
                    <div className="star star-5" />
                </div>
            )}
        </div>
    );
};

export default WeatherAnimation;
