import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground Component
 * Renders dynamic, animated backgrounds based on weather conditions and time of day
 * @param {number} weatherCode - WMO weather code
 * @param {number} currentTime - Current time in milliseconds
 * @param {number} sunrise - Sunrise time in milliseconds
 * @param {number} sunset - Sunset time in milliseconds
 */
const AnimatedBackground = ({ weatherCode, currentTime, sunrise, sunset }) => {
    const canvasRef = useRef(null);

    // Determine time of day from sunrise/sunset
    const getTimeOfDay = (current, sunriseTime, sunsetTime) => {
        const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

        // Sunrise period: 30 min before to 30 min after sunrise
        if (current >= sunriseTime - THIRTY_MINUTES && current <= sunriseTime + THIRTY_MINUTES) {
            return 'sunrise';
        }

        // Sunset period: 30 min before to 30 min after sunset
        if (current >= sunsetTime - THIRTY_MINUTES && current <= sunsetTime + THIRTY_MINUTES) {
            return 'sunset';
        }

        // Day: Between sunrise and sunset
        if (current > sunriseTime + THIRTY_MINUTES && current < sunsetTime - THIRTY_MINUTES) {
            return 'day';
        }

        // Night: Everything else
        return 'night';
    };

    // Determine weather type from WMO code
    const getWeatherType = (code) => {
        if (code === 0 || code === 1) return 'clear';
        if (code === 2 || code === 3) return 'cloudy';
        if (code === 45 || code === 48) return 'fog';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rain';
        return 'clear';
    };

    const weatherType = getWeatherType(weatherCode);
    const timeOfDay = getTimeOfDay(currentTime, sunrise, sunset);

    // Canvas-based snow animation
    useEffect(() => {
        if (weatherType !== 'snow') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const snowflakes = [];
        const snowflakeCount = 150;

        // Create snowflakes
        for (let i = 0; i < snowflakeCount; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                drift: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.6 + 0.4
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snowflakes.forEach(flake => {
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
                ctx.fill();

                // Update position
                flake.y += flake.speed;
                flake.x += flake.drift;

                // Reset if off screen
                if (flake.y > canvas.height) {
                    flake.y = -10;
                    flake.x = Math.random() * canvas.width;
                }
                if (flake.x > canvas.width) flake.x = 0;
                if (flake.x < 0) flake.x = canvas.width;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [weatherType]);

    // Canvas-based rain animation
    useEffect(() => {
        if (weatherType !== 'rain') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const raindrops = [];
        const raindropCount = 200;

        // Create raindrops
        for (let i = 0; i < raindropCount; i++) {
            raindrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 5 + 5,
                opacity: Math.random() * 0.3 + 0.3
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Update position
                drop.y += drop.speed;

                // Reset if off screen
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [weatherType]);

    // Canvas-based realistic clouds animation
    useEffect(() => {
        if (weatherType !== 'cloudy') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const clouds = [];
        const cloudCount = 8;

        // Create realistic clouds with randomized properties
        for (let i = 0; i < cloudCount; i++) {
            const cloud = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5, // Upper 50% of screen
                size: Math.random() * 120 + 80, // 80-200px
                speed: Math.random() * 0.2 + 0.1, // Slow movement
                opacity: Math.random() * 0.15 + 0.15, // 0.15-0.3 opacity (more subtle)
                puffs: []
            };

            // Create 5-8 overlapping circles per cloud for realistic shape
            const puffCount = Math.floor(Math.random() * 4) + 5;
            for (let j = 0; j < puffCount; j++) {
                cloud.puffs.push({
                    offsetX: Math.random() * 100 - 50,
                    offsetY: Math.random() * 40 - 20,
                    radius: Math.random() * 60 + 25, // More size variation
                    innerOpacity: Math.random() * 0.3 + 0.7 // Variation in puff opacity
                });
            }

            clouds.push(cloud);
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Enable blur for softer clouds
            ctx.filter = 'blur(8px)';

            clouds.forEach(cloud => {
                // Draw each cloud as multiple overlapping circles with radial gradients
                cloud.puffs.forEach(puff => {
                    // Create radial gradient for soft, natural look
                    const gradient = ctx.createRadialGradient(
                        cloud.x + puff.offsetX,
                        cloud.y + puff.offsetY,
                        0,
                        cloud.x + puff.offsetX,
                        cloud.y + puff.offsetY,
                        puff.radius
                    );

                    // Center is more opaque, edges fade out
                    const centerOpacity = cloud.opacity * puff.innerOpacity;
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${centerOpacity})`);
                    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${centerOpacity * 0.6})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                    ctx.beginPath();
                    ctx.arc(
                        cloud.x + puff.offsetX,
                        cloud.y + puff.offsetY,
                        puff.radius,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle = gradient;
                    ctx.fill();
                });

                // Update position
                cloud.x += cloud.speed;

                // Reset if off screen
                if (cloud.x - cloud.size > canvas.width) {
                    cloud.x = -cloud.size;
                    cloud.y = Math.random() * canvas.height * 0.5;
                }
            });

            // Reset filter for next frame
            ctx.filter = 'none';

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [weatherType]);

    // Canvas-based fog animation
    useEffect(() => {
        if (weatherType !== 'fog') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fogLayers = [];
        const layerCount = 5; // More layers for depth

        // Create fog layers with varying properties
        for (let i = 0; i < layerCount; i++) {
            fogLayers.push({
                x: Math.random() * canvas.width - canvas.width,
                y: i * (canvas.height / layerCount),
                width: canvas.width * 2.5,
                height: canvas.height / layerCount + 100,
                speed: (Math.random() * 0.3 + 0.2) * (i % 2 === 0 ? 1 : -1), // Alternate directions
                opacity: Math.random() * 0.3 + 0.3, // 0.3-0.6 opacity
                offset: Math.random() * 100
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Apply blur for soft fog
            ctx.filter = 'blur(40px)';

            fogLayers.forEach((layer) => {
                // Create horizontal gradient for fog layer
                const gradient = ctx.createLinearGradient(
                    layer.x,
                    0,
                    layer.x + layer.width,
                    0
                );

                // Create smooth fog gradient with multiple stops
                gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                gradient.addColorStop(0.1, `rgba(255, 255, 255, ${layer.opacity * 0.3})`);
                gradient.addColorStop(0.3, `rgba(255, 255, 255, ${layer.opacity * 0.7})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${layer.opacity})`);
                gradient.addColorStop(0.7, `rgba(255, 255, 255, ${layer.opacity * 0.7})`);
                gradient.addColorStop(0.9, `rgba(255, 255, 255, ${layer.opacity * 0.3})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

                // Update position
                layer.x += layer.speed;

                // Reset if off screen
                if (layer.speed > 0 && layer.x > canvas.width) {
                    layer.x = -layer.width;
                } else if (layer.speed < 0 && layer.x + layer.width < 0) {
                    layer.x = canvas.width;
                }
            });

            // Reset filter
            ctx.filter = 'none';

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [weatherType]);

    return (
        <div className={`animated-background ${weatherType} ${timeOfDay}`}>
            {/* Canvas for snow, rain, clouds, and fog */}
            {(weatherType === 'snow' || weatherType === 'rain' || weatherType === 'cloudy' || weatherType === 'fog') && (
                <canvas ref={canvasRef} className="weather-canvas" />
            )}

            {/* Stars for clear night sky */}
            {weatherType === 'clear' && timeOfDay === 'night' && (
                <div className="stars">
                    {[...Array(100)].map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnimatedBackground;
