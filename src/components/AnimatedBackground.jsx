import React, { useEffect, useRef, useState } from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground Component (Optimized for Mobile)
 * Renders dynamic, animated backgrounds based on weather conditions and time of day
 * 
 * Optimizations:
 * - Reduced particle counts on mobile devices (50% fewer on mobile)
 * - Respects prefers-reduced-motion accessibility setting
 * - Pauses when tab is hidden (saves battery/CPU)
 * - Adaptive performance based on screen size
 * 
 * @param {number} weatherCode - WMO weather code
 * @param {number} currentTime - Current time in milliseconds
 * @param {number} sunrise - Sunrise time in milliseconds
 * @param {number} sunset - Sunset time in milliseconds
 */
const AnimatedBackground = ({ weatherCode, currentTime, sunrise, sunset }) => {
    const canvasRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Detect mobile on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Pause animations when tab is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Determine time of day from sunrise/sunset
    const getTimeOfDay = (current, sunriseTime, sunsetTime) => {
        const THIRTY_MINUTES = 30 * 60 * 1000;
        if (current >= sunriseTime - THIRTY_MINUTES && current <= sunriseTime + THIRTY_MINUTES) {
            return 'sunrise';
        }
        if (current >= sunsetTime - THIRTY_MINUTES && current <= sunsetTime + THIRTY_MINUTES) {
            return 'sunset';
        }
        if (current > sunriseTime + THIRTY_MINUTES && current < sunsetTime - THIRTY_MINUTES) {
            return 'day';
        }
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

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
        return <div className={`animated-background ${weatherType} ${timeOfDay} reduced-motion`} />;
    }

    // Canvas-based snow animation (OPTIMIZED)
    useEffect(() => {
        if (weatherType !== 'snow' || !isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const snowflakes = [];
        // Mobile: 50 particles, Desktop: 150 particles
        const snowflakeCount = isMobile ? 50 : 150;

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
            if (!isVisible) return; // Pause when hidden

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snowflakes.forEach(flake => {
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
                ctx.fill();

                flake.y += flake.speed;
                flake.x += flake.drift;

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
    }, [weatherType, isVisible, isMobile]);

    // Canvas-based rain animation (OPTIMIZED)
    useEffect(() => {
        if (weatherType !== 'rain' || !isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const raindrops = [];
        // Mobile: 80 particles, Desktop: 200 particles
        const raindropCount = isMobile ? 80 : 200;

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
            if (!isVisible) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                drop.y += drop.speed;

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
    }, [weatherType, isVisible, isMobile]);

    // Canvas-based clouds animation (OPTIMIZED)
    useEffect(() => {
        if (weatherType !== 'cloudy' || !isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const clouds = [];
        // Mobile: 4 clouds, Desktop: 8 clouds
        const cloudCount = isMobile ? 4 : 8;

        for (let i = 0; i < cloudCount; i++) {
            const cloud = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                size: Math.random() * 120 + 80,
                speed: Math.random() * 0.2 + 0.1,
                opacity: Math.random() * 0.15 + 0.15,
                puffs: []
            };

            const puffCount = Math.floor(Math.random() * 4) + 5;
            for (let j = 0; j < puffCount; j++) {
                cloud.puffs.push({
                    offsetX: Math.random() * 100 - 50,
                    offsetY: Math.random() * 40 - 20,
                    radius: Math.random() * 60 + 25,
                    innerOpacity: Math.random() * 0.3 + 0.7
                });
            }

            clouds.push(cloud);
        }

        let animationId;
        const animate = () => {
            if (!isVisible) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = 'blur(8px)';

            clouds.forEach(cloud => {
                cloud.puffs.forEach(puff => {
                    const gradient = ctx.createRadialGradient(
                        cloud.x + puff.offsetX,
                        cloud.y + puff.offsetY,
                        0,
                        cloud.x + puff.offsetX,
                        cloud.y + puff.offsetY,
                        puff.radius
                    );

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

                cloud.x += cloud.speed;

                if (cloud.x - cloud.size > canvas.width) {
                    cloud.x = -cloud.size;
                    cloud.y = Math.random() * canvas.height * 0.5;
                }
            });

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
    }, [weatherType, isVisible, isMobile]);

    // Canvas-based fog animation (OPTIMIZED)
    useEffect(() => {
        if (weatherType !== 'fog' || !isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fogLayers = [];
        // Mobile: 3 layers, Desktop: 5 layers
        const layerCount = isMobile ? 3 : 5;

        for (let i = 0; i < layerCount; i++) {
            fogLayers.push({
                x: Math.random() * canvas.width - canvas.width,
                y: i * (canvas.height / layerCount),
                width: canvas.width * 2.5,
                height: canvas.height / layerCount + 100,
                speed: (Math.random() * 0.3 + 0.2) * (i % 2 === 0 ? 1 : -1),
                opacity: Math.random() * 0.3 + 0.3,
                offset: Math.random() * 100
            });
        }

        let animationId;
        const animate = () => {
            if (!isVisible) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = 'blur(40px)';

            fogLayers.forEach((layer) => {
                const gradient = ctx.createLinearGradient(
                    layer.x,
                    0,
                    layer.x + layer.width,
                    0
                );

                gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                gradient.addColorStop(0.1, `rgba(255, 255, 255, ${layer.opacity * 0.3})`);
                gradient.addColorStop(0.3, `rgba(255, 255, 255, ${layer.opacity * 0.7})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${layer.opacity})`);
                gradient.addColorStop(0.7, `rgba(255, 255, 255, ${layer.opacity * 0.7})`);
                gradient.addColorStop(0.9, `rgba(255, 255, 255, ${layer.opacity * 0.3})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

                layer.x += layer.speed;

                if (layer.speed > 0 && layer.x > canvas.width) {
                    layer.x = -layer.width;
                } else if (layer.speed < 0 && layer.x + layer.width < 0) {
                    layer.x = canvas.width;
                }
            });

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
    }, [weatherType, isVisible, isMobile]);

    return (
        <div className={`animated-background ${weatherType} ${timeOfDay}`}>
            {/* Canvas for snow, rain, clouds, and fog */}
            {(weatherType === 'snow' || weatherType === 'rain' || weatherType === 'cloudy' || weatherType === 'fog') && (
                <canvas ref={canvasRef} className="weather-canvas" />
            )}

            {/* Stars for clear night sky (reduced on mobile) */}
            {weatherType === 'clear' && timeOfDay === 'night' && (
                <div className="stars">
                    {[...Array(isMobile ? 50 : 100)].map((_, i) => (
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
