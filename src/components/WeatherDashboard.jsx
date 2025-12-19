import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, Offcanvas, Badge, Alert } from 'react-bootstrap';
import { Search, Snowflake, Wind, Thermometer, Mountain, MapPin, Calendar, Droplets, Sun, Menu, Eye, Ruler, AlertTriangle, TrendingUp, CloudSnow, Sunrise, Sunset, Cloud, CloudRain, CloudDrizzle, CloudFog, Zap, ArrowUp, Navigation, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getCoordinates, getWeather, getWeatherDescription } from '../services/weatherApi';
import { getClosestAvalancheForecast, parseDangerRating, formatHighlights } from '../services/avalancheApi';
import { calculatePowderScore, calculateSnowfallTotal, getBestSkiingWindow } from '../services/powderTracker';
import { locations, getLocationByName, getResorts, getBackcountryZones, getLocationsByRegion, getRegions } from '../data/locationData';
import AvalancheDetailModal from './AvalancheDetailModal';
import AnimatedBackground from './AnimatedBackground';
import MapCard from './MapCard';
import HourlyDetailModal from './HourlyDetailModal';
import { getWeatherIcon, getWindColor } from '../utils/weatherIcons.jsx';
import { getSnowQuality, getVisibilityRating, getFreezingLevelWarning, getTemperatureColor, formatWindDirection } from '../utils/skiConditions';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
    const [town, setTown] = useState('Whistler');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [avalancheForecast, setAvalancheForecast] = useState(null);
    const [showAvalancheModal, setShowAvalancheModal] = useState(false);
    const [powderScore, setPowderScore] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'resort', 'backcountry'

    // Get all locations from database
    const allLocations = locations.map(loc => loc.name);
    const [savedLocations] = useState(allLocations);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false); // For smooth transitions
    const [selectedHourIndex, setSelectedHourIndex] = useState(null); // For hourly detail modal
    const [showHourlyModal, setShowHourlyModal] = useState(false);

    // Hold-down gesture state for mobile
    const [isHolding, setIsHolding] = useState(false);
    const holdTimerRef = React.useRef(null);
    const hourlyForecastRef = React.useRef(null);

    // Track which regions are expanded (all expanded by default)
    const [expandedRegions, setExpandedRegions] = useState(() => {
        const regions = getRegions();
        return regions.reduce((acc, region) => ({ ...acc, [region]: true }), {});
    });

    const toggleRegion = (region) => {
        setExpandedRegions(prev => ({ ...prev, [region]: !prev[region] }));
    };

    // Helper function to get UV index color
    const getUVColor = (index) => {
        if (index >= 11) return '#9333ea'; // Extreme (Purple)
        if (index >= 8) return '#dc2626';  // Very High (Red)
        if (index >= 6) return '#f97316';  // High (Orange)
        if (index >= 3) return '#eab308';  // Moderate (Yellow)
        return '#22c55e';                  // Low (Green)
    };

    // Helper function to convert wind direction degrees to cardinal direction
    const getWindDirection = (degrees) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    // Helper function to format time from ISO string
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Hold-down gesture handlers for hourly cards
    const handleHourPress = (idx) => {
        holdTimerRef.current = setTimeout(() => {
            setIsHolding(true);
            setSelectedHourIndex(idx);
            setShowHourlyModal(true);
        }, 200); // 200ms hold threshold
    };

    const handleHourRelease = () => {
        clearTimeout(holdTimerRef.current);
        if (isHolding) {
            setShowHourlyModal(false);
            setIsHolding(false);
        }
    };

    const handleHourClick = (idx) => {
        // Only trigger on click if not holding
        if (!isHolding) {
            setSelectedHourIndex(idx);
            setShowHourlyModal(true);
        }
    };

    const fetchWeather = async (townName) => {
        setLoading(true);
        setError(null);
        try {
            // First, check if we have this location in our database
            const locationData = getLocationByName(townName);

            let coords;
            if (locationData) {
                // Use hardcoded coordinates from our database
                coords = {
                    lat: locationData.coordinates.lat,
                    lon: locationData.coordinates.lon,
                    name: locationData.displayName || locationData.name,
                    country: 'Canada',
                    elevation: locationData.elevation.summit
                };
                setCurrentLocation(locationData);
            } else {
                // Fall back to geocoding API for custom locations
                coords = await getCoordinates(townName);
                setCurrentLocation(null);
            }

            const weatherData = await getWeather(coords.lat, coords.lon);
            setWeather({ ...weatherData, locationName: coords.name, country: coords.country, elevation: coords.elevation });
            setTown(townName);
            setShowSidebar(false);

            // Fetch avalanche forecast
            try {
                const avalanche = await getClosestAvalancheForecast(coords.lat, coords.lon);
                setAvalancheForecast(avalanche);
            } catch (err) {
                console.error('Failed to fetch avalanche data:', err);
                setAvalancheForecast(null);
            }

            // Calculate powder score
            const powder = calculatePowderScore(weatherData);
            setPowderScore(powder);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather('Whistler');
    }, []);

    // Auto-scroll to current hour when weather data loads (horizontal scroll only)
    // DISABLED: Causes entire screen to shift - user doesn't want this behavior
    /*
    useEffect(() => {
        if (weather && hourlyForecastRef.current) {
            // Small delay to ensure DOM is fully rendered
            setTimeout(() => {
                const currentHourCard = hourlyForecastRef.current?.querySelector('[data-current="true"]');
                if (currentHourCard) {
                    currentHourCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }, 300);
        }
    }, [weather]);
    */

    const handleSearch = (e) => {
        e.preventDefault();
        if (!town) return;
        fetchWeather(town);
    };

    return (
        <>
            {/* Animated Background */}
            {weather && (
                <AnimatedBackground
                    weatherCode={weather.current.weather_code}
                    currentTime={new Date().getTime()}
                    sunrise={new Date(weather.daily.sunrise[0]).getTime()}
                    sunset={new Date(weather.daily.sunset[0]).getTime()}
                />
            )}

            <div className="d-flex h-100 w-100 overflow-hidden">
                {/* Desktop Sidebar */}
                <div
                    className="d-none d-md-flex flex-column p-4 glass-sidebar"
                    style={{
                        width: '320px',
                        height: '100vh'
                    }}
                >
                    {/* Search Bar */}
                    <Form onSubmit={handleSearch} className="position-relative mb-4">
                        <Form.Control
                            type="text"
                            placeholder="Search..."
                            value={town}
                            onChange={(e) => setTown(e.target.value)}
                            className="ps-5 py-2 bg-secondary bg-opacity-10 border-0 rounded-4 text-white"
                            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        />
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={16} />
                    </Form>

                    <div className="flex-grow-1 overflow-auto custom-scrollbar">
                        {getRegions().map((region) => {
                            const regionLocations = getLocationsByRegion(region);
                            const regionCount = regionLocations.length;

                            // Region icon mapping
                            const regionIcons = {
                                'Coast Mountains': '🏔️',
                                'Interior': '⛰️',
                                'Rockies': '🗻',
                                'North BC': '🌲'
                            };

                            return (
                                <div key={region} className="mb-3">
                                    <div
                                        className="d-flex align-items-center justify-content-between mb-2 px-3 py-2 rounded-4 transition-all"
                                        onClick={() => toggleRegion(region)}
                                        style={{
                                            cursor: 'pointer',
                                            background: expandedRegions[region] ? 'rgba(13, 110, 253, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!expandedRegions[region]) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!expandedRegions[region]) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            }
                                        }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <small className="text-uppercase text-white-50 fw-bold d-flex align-items-center gap-2">
                                                <span>{regionIcons[region]}</span>
                                                <span>{region}</span>
                                            </small>
                                            <Badge bg="secondary" className="bg-opacity-50 text-white">{regionCount}</Badge>
                                        </div>
                                        {expandedRegions[region] ?
                                            <ChevronUp size={16} className="text-white-50" /> :
                                            <ChevronDown size={16} className="text-white-50" />
                                        }
                                    </div>
                                    {expandedRegions[region] && (
                                        <div className="d-flex flex-column gap-2">
                                            {regionLocations.map((loc) => (
                                                <Button
                                                    key={loc.name}
                                                    variant="link"
                                                    onClick={() => fetchWeather(loc.name)}
                                                    className={`text-decoration-none text-start px-3 py-2 rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale ${town === loc.name
                                                        ? 'bg-primary bg-opacity-50 text-white shadow-md'
                                                        : 'text-white-50 hover-bg-white-10'
                                                        }`}
                                                >
                                                    <div className="d-flex flex-column">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fw-medium">{loc.name}</span>
                                                            {loc.type === 'resort' && <span style={{ fontSize: '0.65rem' }}>🎿</span>}
                                                        </div>
                                                        {(loc.resortInfo || loc.backcountryInfo) && (
                                                            <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                                                {loc.resortInfo
                                                                    ? `${loc.resortInfo.verticalDrop}m vertical`
                                                                    : loc.elevation
                                                                        ? `${loc.elevation.base}-${loc.elevation.summit}m`
                                                                        : 'Elevation data unavailable'
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                    {town === loc.name && (
                                                        <div className="bg-white rounded-circle shadow-sm" style={{ width: '8px', height: '8px' }}></div>
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Navbar */}
                <Navbar variant="dark" expand={false} className="d-md-none fixed-top glass-card m-3 shadow-lg">
                    <Container fluid>
                        <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
                            <img src="/logo.png" alt="PowPlus Logo" className="rounded-circle" style={{ width: '30px', height: '30px' }} />
                            <span className="fw-bold text-shadow-sm">POWPLUS</span>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setShowSidebar(true)} className="border-0" />
                        <Navbar.Offcanvas
                            id="offcanvasNavbar"
                            aria-labelledby="offcanvasNavbarLabel"
                            placement="start"
                            show={showSidebar}
                            onHide={() => setShowSidebar(false)}
                            className="bg-dark text-white"
                        >
                            <Offcanvas.Header closeButton closeVariant="white">
                                <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body style={{ overflowY: 'auto' }} className="custom-scrollbar">
                                {/* Search Bar */}
                                <Form onSubmit={handleSearch} className="mb-4 position-relative">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search locations..."
                                        value={town}
                                        onChange={(e) => setTown(e.target.value)}
                                        className="bg-secondary bg-opacity-10 text-white border-0 rounded-4 ps-5 py-2"
                                        style={{
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    />
                                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={16} />
                                </Form>

                                {/* Regional Navigation */}
                                {getRegions().map((region) => {
                                    const regionLocations = getLocationsByRegion(region);
                                    const regionCount = regionLocations.length;

                                    const regionIcons = {
                                        'Coast Mountains': '🏔️',
                                        'Interior': '⛰️',
                                        'Rockies': '🗻',
                                        'Alberta Rockies': '🏔️',
                                        'North BC': '🌲'
                                    };

                                    return (
                                        <div key={region} className="mb-3">
                                            <div
                                                className="d-flex align-items-center justify-content-between mb-2 px-2 py-2 rounded-3 bg-secondary bg-opacity-10 cursor-pointer"
                                                onClick={() => toggleRegion(region)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <small className="text-uppercase text-white-50 fw-bold d-flex align-items-center gap-2">
                                                        <span>{regionIcons[region]}</span>
                                                        <span>{region}</span>
                                                    </small>
                                                    <Badge bg="secondary" className="bg-opacity-50 text-white">{regionCount}</Badge>
                                                </div>
                                                {expandedRegions[region] ?
                                                    <ChevronUp size={16} className="text-white-50" /> :
                                                    <ChevronDown size={16} className="text-white-50" />
                                                }
                                            </div>
                                            {expandedRegions[region] && (
                                                <div className="d-flex flex-column gap-2">
                                                    {regionLocations.map((loc) => (
                                                        <Button
                                                            key={loc.name}
                                                            variant="link"
                                                            onClick={() => fetchWeather(loc.name)}
                                                            className={`text-decoration-none text-start px-2 py-2 rounded-3 ${town === loc.name ? 'bg-primary bg-opacity-25 text-white' : 'text-white-50'
                                                                }`}
                                                        >
                                                            <div className="d-flex flex-column">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-medium">{loc.name}</span>
                                                                    {loc.type === 'resort' && <span style={{ fontSize: '0.65rem' }}>🎿</span>}
                                                                </div>
                                                                {(loc.resortInfo || loc.elevation) && (
                                                                    <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                                                        {loc.resortInfo
                                                                            ? `${loc.resortInfo.verticalDrop}m vertical`
                                                                            : `${loc.elevation.base}-${loc.elevation.summit}m`
                                                                        }
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>

                {/* Main Content */}
                <div className="flex-grow-1 overflow-auto p-3 p-md-5 no-overflow-x" style={{ height: '100vh' }}>
                    {weather && (
                        <Container fluid="lg" className="mt-5 mt-md-0">
                            {/* Header */}
                            <div className="text-center text-white mb-5">
                                <div className="d-inline-flex align-items-center gap-2 bg-dark bg-opacity-50 px-3 py-1 rounded-pill border border-white border-opacity-10 mb-3 shadow-sm backdrop-blur-md">
                                    <MapPin size={14} />
                                    <span className="small fw-bold">{weather.country}</span>
                                    {weather.elevation && <span className="small border-start border-secondary ps-2">{weather.elevation}m</span>}
                                </div>
                                <h1 className="display-3 fw-black mb-0 text-shadow-lg tracking-tight">{weather.locationName}</h1>
                                <div className="display-1 fw-light my-2 text-shadow-md">
                                    {Math.round(weather.current.temperature_2m)}°
                                </div>
                                <div className="fs-4 text-info text-capitalize fw-medium text-shadow-sm">
                                    {getWeatherDescription(weather.current.weather_code)}
                                </div>
                                <div className="d-flex justify-content-center gap-4 mt-2 text-white fw-medium text-shadow-sm">
                                    <span>H: {Math.round(Math.max(...weather.hourly.temperature_2m.slice(0, 24)))}°</span>
                                    <span>L: {Math.round(Math.min(...weather.hourly.temperature_2m.slice(0, 24)))}°</span>
                                </div>
                            </div>

                            {/* Powder Alert Banner */}
                            {powderScore && powderScore.isPowderDay && (
                                <Alert variant="info" className="glass-card border-0 shadow-lg d-flex align-items-center gap-3 mb-4 hover-scale transition-all">
                                    <CloudSnow size={32} className="text-info" />
                                    <div className="flex-grow-1">
                                        <h5 className="mb-1 fw-bold text-white">🎿 Powder Alert!</h5>
                                        <p className="mb-0 text-white-50">
                                            {powderScore.snowfall24h}cm of fresh snow in the last 24 hours.
                                            Powder score: <strong className="text-info">{powderScore.score}/10</strong> ({powderScore.rating})
                                        </p>
                                    </div>
                                </Alert>
                            )}

                            {/* Hourly Forecast Strip */}
                            <Card className="glass-card border-0 mb-4 text-white shadow-lg hover-scale transition-all">
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                            <Calendar size={16} /> Hourly Forecast
                                        </div>
                                        <small className="text-white-50 fst-italic" style={{ fontSize: '0.65rem' }}>
                                            Next 24 hours
                                        </small>
                                    </div>

                                    {/* Compact Legend */}
                                    <div className="mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                                        <div className="d-flex flex-wrap gap-3 align-items-center" style={{ fontSize: '0.65rem' }}>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Thermometer size={12} />
                                                <span>Temp</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Snowflake size={12} />
                                                <span>Snow</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Wind size={12} />
                                                <span>Wind</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Eye size={12} />
                                                <span>Visibility</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Cloud size={12} />
                                                <span>Clouds</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-white-50">
                                                <Droplets size={12} />
                                                <span>Precip %</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        ref={hourlyForecastRef}
                                        className="hourly-forecast-container d-flex gap-3 overflow-auto pb-2 scrollbar-hide"
                                    >
                                        {weather.hourly.time.slice(0, 24).map((time, idx) => {
                                            const hourTime = new Date(time);
                                            const currentHour = hourTime.getHours();

                                            // Determine if this is the actual current hour
                                            const now = new Date();
                                            const isCurrentHour = hourTime.getHours() === now.getHours() &&
                                                hourTime.getDate() === now.getDate();

                                            // Check if this hour contains sunrise or sunset
                                            const sunrise = weather.daily.sunrise ? new Date(weather.daily.sunrise[0]) : null;
                                            const sunset = weather.daily.sunset ? new Date(weather.daily.sunset[0]) : null;
                                            const isSunriseHour = sunrise && sunrise.getHours() === currentHour;
                                            const isSunsetHour = sunset && sunset.getHours() === currentHour;

                                            // Format time with AM/PM and handle sunrise/sunset exact times
                                            const hour12 = currentHour === 0 ? 12 : (currentHour > 12 ? currentHour - 12 : currentHour);
                                            const ampm = currentHour >= 12 ? 'PM' : 'AM';

                                            let timeLabel;
                                            if (isCurrentHour) {
                                                timeLabel = 'NOW';
                                            } else if (isSunriseHour && sunrise) {
                                                const sunriseHour = sunrise.getHours();
                                                const sunriseMinute = sunrise.getMinutes();
                                                const sunriseHour12 = sunriseHour === 0 ? 12 : (sunriseHour > 12 ? sunriseHour - 12 : sunriseHour);
                                                const sunriseAmpm = sunriseHour >= 12 ? 'PM' : 'AM';
                                                timeLabel = `${sunriseHour12}:${sunriseMinute.toString().padStart(2, '0')}${sunriseAmpm}`;
                                            } else if (isSunsetHour && sunset) {
                                                const sunsetHour = sunset.getHours();
                                                const sunsetMinute = sunset.getMinutes();
                                                const sunsetHour12 = sunsetHour === 0 ? 12 : (sunsetHour > 12 ? sunsetHour - 12 : sunsetHour);
                                                const sunsetAmpm = sunsetHour >= 12 ? 'PM' : 'AM';
                                                timeLabel = `${sunsetHour12}:${sunsetMinute.toString().padStart(2, '0')}${sunsetAmpm}`;
                                            } else {
                                                timeLabel = `${hour12}${ampm}`;
                                            }

                                            // Get weather data for this hour
                                            const temp = Math.round(weather.hourly.temperature_2m[idx]);
                                            const feelsLike = weather.hourly.apparent_temperature ? Math.round(weather.hourly.apparent_temperature[idx]) : temp;
                                            const tempDiff = Math.abs(temp - feelsLike);
                                            const snow = weather.hourly.snowfall[idx];
                                            const weatherCode = weather.hourly.weather_code ? weather.hourly.weather_code[idx] : 0;
                                            const windSpeed = weather.hourly.wind_speed_10m ? Math.round(weather.hourly.wind_speed_10m[idx]) : 0;
                                            const windDirection = weather.hourly.wind_direction_10m ? weather.hourly.wind_direction_10m[idx] : 0;
                                            const precipProb = weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[idx] : 0;
                                            const visibility = weather.hourly.visibility ? weather.hourly.visibility[idx] : 10000;
                                            const cloudCover = weather.hourly.cloud_cover ? weather.hourly.cloud_cover[idx] : 0;
                                            const freezingLevel = weather.hourly.freezing_level_height ? weather.hourly.freezing_level_height[idx] : 2000;
                                            const isDay = weather.hourly.is_day ? weather.hourly.is_day[idx] : 1;

                                            // Calculate enhanced metrics
                                            const snowQuality = getSnowQuality(temp, snow);
                                            const visibilityInfo = getVisibilityRating(visibility);
                                            const tempColor = getTemperatureColor(temp);

                                            // Only show freezing level warning if it's relevant (near elevation or precipitation expected)
                                            const elevation = weather.elevation || 2000;
                                            const freezingWarning = precipProb > 30 ? getFreezingLevelWarning(freezingLevel, elevation) : null;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="hourly-forecast-card d-flex flex-column align-items-center gap-2 position-relative"
                                                    data-current={isCurrentHour ? 'true' : 'false'}
                                                    data-hour-index={idx}
                                                    style={{
                                                        minWidth: '110px',
                                                        padding: '0.75rem 0.5rem',
                                                        borderRadius: '1rem',
                                                        background: (isSunriseHour || isSunsetHour)
                                                            ? 'linear-gradient(180deg, rgba(251, 191, 36, 0.15) 0%, rgba(0, 0, 0, 0) 100%)'
                                                            : (isDay
                                                                ? 'linear-gradient(180deg, rgba(135, 206, 235, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
                                                                : 'linear-gradient(180deg, rgba(25, 25, 112, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%)'),
                                                        border: isCurrentHour
                                                            ? '2px solid rgba(59, 130, 246, 0.8)'
                                                            : ((isSunriseHour || isSunsetHour) ? '2px solid rgba(251, 191, 36, 0.5)' : 'none'),
                                                        boxShadow: isCurrentHour
                                                            ? '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
                                                            : 'none',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    // Touch gesture handlers
                                                    onTouchStart={() => handleHourPress(idx)}
                                                    onTouchEnd={handleHourRelease}
                                                    onTouchCancel={handleHourRelease}
                                                    // Mouse gesture handlers (desktop)
                                                    onMouseDown={() => handleHourPress(idx)}
                                                    onMouseUp={handleHourRelease}
                                                    onMouseLeave={handleHourRelease}
                                                    // Click handler (fallback)
                                                    onClick={() => handleHourClick(idx)}
                                                >
                                                    {/* Hour label */}
                                                    <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <small
                                                            className="fw-bold"
                                                            style={{
                                                                color: isCurrentHour ? '#3b82f6' : ((isSunriseHour || isSunsetHour) ? '#fbbf24' : '#fff'),
                                                                fontSize: isCurrentHour ? '0.7rem' : '0.65rem',
                                                                letterSpacing: isCurrentHour ? '0.5px' : 'normal'
                                                            }}
                                                        >
                                                            {timeLabel}
                                                        </small>
                                                    </div>

                                                    {/* Weather icon - show snowflake if snowing */}
                                                    <div style={{ height: '36px' }} className="d-flex align-items-center">
                                                        {snow > 0 ? (
                                                            <Snowflake size={32} className="text-info" style={{ filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' }} />
                                                        ) : (
                                                            getWeatherIcon(weatherCode, 32)
                                                        )}
                                                    </div>

                                                    {/* Temperature with color coding */}
                                                    <span
                                                        className="fw-bold text-shadow-sm"
                                                        style={{
                                                            fontSize: '1.1rem',
                                                            color: tempColor
                                                        }}
                                                    >
                                                        {temp}°
                                                    </span>

                                                    {/* Feels-like (always show with icon) */}
                                                    <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                                        <Thermometer size={10} style={{ color: tempDiff >= 3 ? '#fbbf24' : '#9ca3af', opacity: 0.7 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: tempDiff >= 3 ? '#fbbf24' : '#9ca3af',
                                                                fontWeight: tempDiff >= 3 ? 'bold' : 'normal'
                                                            }}
                                                        >
                                                            {feelsLike}°
                                                        </small>
                                                    </div>

                                                    {/* Snowfall (always show with icon) */}
                                                    <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                        <Snowflake size={10} style={{ color: snow > 0 ? snowQuality.color : '#9ca3af', opacity: snow > 0 ? 1 : 0.3 }} />
                                                        {snow > 0 ? (
                                                            <span
                                                                className="fw-bold"
                                                                style={{
                                                                    fontSize: '0.65rem',
                                                                    color: snowQuality.color
                                                                }}
                                                            >
                                                                {snow.toFixed(1)}cm
                                                            </span>
                                                        ) : (
                                                            <small className="text-white-50" style={{ fontSize: '0.6rem', opacity: 0.3 }}>
                                                                0cm
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Visibility (always show with icon) */}
                                                    <div style={{ height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                        <Eye size={10} style={{ color: visibilityInfo.warning ? visibilityInfo.color : '#9ca3af', opacity: visibilityInfo.warning ? 1 : 0.5 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: visibilityInfo.warning ? visibilityInfo.color : '#9ca3af',
                                                                fontWeight: visibilityInfo.warning ? 'bold' : 'normal'
                                                            }}
                                                        >
                                                            {visibilityInfo.distance}km
                                                        </small>
                                                    </div>

                                                    {/* Wind (always show with direction) */}
                                                    <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                        <Wind size={10} style={{ color: windSpeed >= 20 ? getWindColor(windSpeed) : '#9ca3af', opacity: windSpeed >= 20 ? 1 : 0.5 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: windSpeed >= 20 ? getWindColor(windSpeed) : '#9ca3af',
                                                                fontWeight: windSpeed >= 20 ? 'bold' : 'normal'
                                                            }}
                                                        >
                                                            {windSpeed} {formatWindDirection(windDirection).name}
                                                        </small>
                                                    </div>

                                                    {/* Cloud cover (always show with icon) */}
                                                    <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                        <Cloud size={10} style={{ color: '#9ca3af', opacity: cloudCover > 20 ? 1 : 0.3 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: '#9ca3af',
                                                                opacity: cloudCover > 0 ? 1 : 0.3
                                                            }}
                                                        >
                                                            {cloudCover}%
                                                        </small>
                                                    </div>

                                                    {/* Precipitation probability (always show with icon) */}
                                                    <div style={{ height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                        <Droplets size={10} style={{ color: '#9ca3af', opacity: precipProb > 0 ? 1 : 0.3 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: '#9ca3af',
                                                                opacity: precipProb > 0 ? 1 : 0.3
                                                            }}
                                                        >
                                                            {precipProb}%
                                                        </small>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Avalanche Safety Card - Only show for locations with valid avalanche zones */}
                            {avalancheForecast && avalancheForecast.report && currentLocation?.avalancheZone && (
                                <Card
                                    className="glass-card border-0 mb-4 text-white"
                                    onClick={() => setShowAvalancheModal(true)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Removed top bar as requested */}
                                    <Card.Body>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-2 text-warning text-uppercase fw-bold">
                                                <AlertTriangle size={18} />
                                                <span style={{ letterSpacing: '0.5px' }}>Avalanche Forecast</span>
                                            </div>
                                            <ExternalLink size={14} className="text-white-50" />
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                                <div className="d-flex flex-column">
                                                    <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Forecast Area</small>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <Badge bg="info" className="text-dark fw-bold">
                                                            {avalancheForecast.report?.title || 'Unavailable'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {avalancheForecast.report?.validUntil && (
                                                    <div className="d-flex flex-column align-items-end">
                                                        <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Valid Until</small>
                                                        <small className="text-white fw-bold mt-1" style={{ fontSize: '0.85rem' }}>
                                                            {new Date(avalancheForecast.report.validUntil).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {avalancheForecast.report.dangerRatings && avalancheForecast.report.dangerRatings[0] && (
                                            <div className="mb-4">
                                                <Row className="g-2">
                                                    {[
                                                        { key: 'alp', label: 'Alpine', icon: '🏔️', elevation: '2500m+' },
                                                        { key: 'tln', label: 'Treeline', icon: '⛰️', elevation: '1500-2500m' },
                                                        { key: 'btl', label: 'Below Treeline', icon: '🌲', elevation: '<1500m' }
                                                    ].map(({ key, label, icon, elevation }) => {
                                                        const rating = avalancheForecast.report.dangerRatings[0].ratings[key];
                                                        const ratingInfo = parseDangerRating(rating?.rating?.value);

                                                        return (
                                                            <Col xs={4} key={key}>
                                                                <div
                                                                    className="p-2 rounded text-center h-100 d-flex flex-column justify-content-center"
                                                                    style={{
                                                                        backgroundColor: ratingInfo.color,
                                                                        color: ratingInfo.textColor,
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                    }}
                                                                >
                                                                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                                                                        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                                                                        <small className="d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: '700' }}>
                                                                            {label}
                                                                        </small>
                                                                    </div>
                                                                    <strong style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{ratingInfo.display}</strong>
                                                                </div>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        )}

                                        {avalancheForecast.report.highlights && (
                                            <div className="bg-white bg-opacity-10 rounded p-3 mb-3 border border-white border-opacity-10">
                                                <div className="d-flex align-items-start gap-2">
                                                    <AlertTriangle size={16} className="text-warning mt-1 flex-shrink-0" />
                                                    <div>
                                                        <strong className="text-warning d-block mb-1 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                            KEY MESSAGE
                                                        </strong>
                                                        <p className="text-white mb-0 small" style={{ lineHeight: '1.5' }}>
                                                            {formatHighlights(avalancheForecast.report.highlights).substring(0, 150)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-center">
                                            <span className="text-info fw-bold cursor-pointer d-inline-flex align-items-center gap-1 small hover-underline">
                                                Tap for full details <ExternalLink size={12} />
                                            </span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Powder Tracking Card */}
                            {powderScore && (
                                <Card className="glass-card border-0 mb-4 text-white shadow-lg hover-scale transition-all">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-2 mb-3 text-white-50 text-uppercase fw-bold small">
                                            <TrendingUp size={16} /> Powder Conditions
                                        </div>
                                        <Row className="g-3">
                                            <Col xs={6}>
                                                <div className="text-center p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                                                    <div className="fs-2 fw-bold text-info">{powderScore.score}</div>
                                                    <small className="text-white d-block mb-2">Powder Score</small>
                                                    <Badge bg="info" className="bg-opacity-75 text-dark fw-bold">{powderScore.rating}</Badge>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className="text-center p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                                                    <div className="fs-2 fw-bold text-white">{powderScore.snowfall24h}cm</div>
                                                    <small className="text-white d-block mb-2">24hr Snowfall</small>
                                                    <small className="text-info fw-bold">{powderScore.snowQuality.quality}</small>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <small className="text-white">Snow Quality</small>
                                                        <small className="text-white fw-bold">{powderScore.snowQuality.score}/10</small>
                                                    </div>
                                                    <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                                        <div
                                                            className="progress-bar bg-info"
                                                            style={{ width: `${powderScore.snowQuality.score * 10}%` }}
                                                        ></div>
                                                    </div>
                                                    <small className="text-white mt-2 d-block">{powderScore.snowQuality.description}</small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Bento Grid */}
                            <Row className="g-4">
                                {/* Snowfall Tracking */}
                                <Col md={6}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4 text-white-50 text-uppercase fw-bold small">
                                                <Snowflake size={16} /> Snowfall Tracking
                                            </div>
                                            <div className="d-flex flex-column gap-3">
                                                {(() => {
                                                    // Find current hour index (where past data ends and forecast begins)
                                                    const now = new Date();
                                                    const currentHourIndex = weather.hourly.time.findIndex(t => new Date(t) >= now);

                                                    // Calculate days until next snowfall and predicted amount
                                                    let daysUntilSnow = null;
                                                    let nextSnowAmount = 0;
                                                    for (let i = currentHourIndex; i < weather.hourly.snowfall.length; i++) {
                                                        if (weather.hourly.snowfall[i] > 0) {
                                                            if (daysUntilSnow === null) {
                                                                daysUntilSnow = Math.floor((i - currentHourIndex) / 24);
                                                            }
                                                            // Sum up snowfall for the day of first snow
                                                            const dayStart = currentHourIndex + (daysUntilSnow * 24);
                                                            const dayEnd = Math.min(dayStart + 24, weather.hourly.snowfall.length);
                                                            for (let j = dayStart; j < dayEnd; j++) {
                                                                nextSnowAmount += weather.hourly.snowfall[j];
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    // Calculate days since last snowfall and amount using historical data
                                                    let daysSinceSnow = null;
                                                    let lastSnowAmount = 0;

                                                    // Search backward through historical data (before current hour)
                                                    for (let i = currentHourIndex - 1; i >= 0; i--) {
                                                        if (weather.hourly.snowfall[i] > 0) {
                                                            const hoursSince = currentHourIndex - i;
                                                            daysSinceSnow = Math.floor(hoursSince / 24);

                                                            // Find the start of that day and sum all snowfall
                                                            const snowDayEnd = i;
                                                            let snowDayStart = i;
                                                            // Go back to find all snow from that day
                                                            while (snowDayStart > 0 && (i - snowDayStart) < 24) {
                                                                if (weather.hourly.snowfall[snowDayStart - 1] > 0) {
                                                                    snowDayStart--;
                                                                } else {
                                                                    break;
                                                                }
                                                            }
                                                            // Sum snowfall for that day
                                                            for (let j = snowDayStart; j <= snowDayEnd; j++) {
                                                                lastSnowAmount += weather.hourly.snowfall[j];
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    return (
                                                        <>
                                                            {/* Days Until Next Snowfall */}
                                                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                                <div className="d-flex flex-column flex-grow-1">
                                                                    <small className="text-white-50 mb-1">Days Until Next Snowfall</small>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <Snowflake size={20} className="text-info" />
                                                                        <span className="fs-3 fw-bold text-white">
                                                                            {daysUntilSnow !== null ? daysUntilSnow : '7+'}
                                                                        </span>
                                                                        <span className="text-white-50">
                                                                            {daysUntilSnow === 0 ? 'Today!' : daysUntilSnow === 1 ? 'day' : 'days'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {nextSnowAmount > 0 && (
                                                                    <div className="text-end">
                                                                        <small className="text-white-50 d-block mb-1">Predicted</small>
                                                                        <div className="badge bg-info bg-opacity-25 text-info fs-6 px-3 py-2">
                                                                            {nextSnowAmount.toFixed(1)} cm
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Days Since Last Snowfall */}
                                                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                                <div className="d-flex flex-column flex-grow-1">
                                                                    <small className="text-white-50 mb-1">Since Last Snowfall</small>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <Calendar size={20} className="text-white-50" />
                                                                        <span className="fs-3 fw-bold text-white">
                                                                            {daysSinceSnow !== null ? daysSinceSnow : '7+'}
                                                                        </span>
                                                                        <span className="text-white-50">
                                                                            {daysSinceSnow === 0 ? 'Today' : daysSinceSnow === 1 ? 'day ago' : 'days ago'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {lastSnowAmount > 0 && (
                                                                    <div className="text-end">
                                                                        <small className="text-white-50 d-block mb-1">Amount</small>
                                                                        <div className="badge bg-info bg-opacity-25 text-info fs-6 px-3 py-2">
                                                                            {lastSnowAmount.toFixed(1)} cm
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Snowfall & Depth */}
                                <Col md={6}>
                                    <Card className="glass-card border-0 h-100 text-white bg-primary bg-opacity-40 border-primary border-opacity-30 position-relative overflow-hidden shadow-lg hover-scale transition-all">
                                        <div className="position-absolute top-0 end-0 p-5 bg-primary rounded-circle blur-3xl opacity-40" style={{ transform: 'translate(30%, -30%)' }}></div>
                                        <Card.Body className="d-flex flex-column justify-content-between position-relative z-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="d-flex align-items-center gap-2 text-info text-uppercase fw-bold small">
                                                    <Snowflake size={16} /> Snowfall
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                    <Ruler size={16} /> Depth
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-6 border-end border-white border-opacity-10">
                                                    <div className="display-4 fw-black mb-1 text-shadow-md">
                                                        {weather.current.snowfall} <span className="fs-4 fw-medium text-info">cm</span>
                                                    </div>
                                                    <p className="text-info text-opacity-90 mb-0 fw-medium small">
                                                        {weather.current.snowfall > 0 ? "Fresh powder!" : "No fresh snow."}
                                                    </p>
                                                </div>
                                                <div className="col-6 ps-4">
                                                    <div className="display-4 fw-black mb-1 text-shadow-md">
                                                        {weather.hourly.snow_depth ? (weather.hourly.snow_depth[0] * 100).toFixed(0) : 0} <span className="fs-4 fw-medium text-white-50">cm</span>
                                                    </div>
                                                    <p className="text-white-50 mb-0 fw-medium small">
                                                        Total Base
                                                    </p>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Freezing Level */}
                                <Col md={6}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                <Mountain size={16} /> Freezing Level
                                            </div>
                                            <div>
                                                <div className="display-5 fw-bold mb-2 text-shadow-sm">
                                                    {Math.round(weather.hourly.freezing_level_height[0])} <span className="fs-4 fw-normal text-white-50">m</span>
                                                </div>
                                                <div className="progress bg-white bg-opacity-10 shadow-inner" style={{ height: '8px' }}>
                                                    <div
                                                        className="progress-bar bg-gradient-to-r from-info to-warning shadow-sm"
                                                        role="progressbar"
                                                        style={{ width: `${Math.min((weather.hourly.freezing_level_height[0] / 3000) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <small className="text-white-50 mt-2 d-block fw-medium">Altitude where 0°C isotherm begins.</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Wind Gusts */}
                                <Col md={3}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                <Wind size={16} /> Wind Gusts
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold text-shadow-sm">
                                                    {weather.hourly.wind_gusts_10m ? Math.round(weather.hourly.wind_gusts_10m[0]) : 0} <span className="fs-6 fw-normal text-white-50">km/h</span>
                                                </div>
                                                <small className="text-white-50 fw-medium">Peak gusts at 10m</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Visibility */}
                                <Col md={3}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                <Eye size={16} /> Visibility
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold text-shadow-sm">
                                                    {weather.hourly.visibility ? (weather.hourly.visibility[0] / 1000).toFixed(1) : 10} <span className="fs-6 fw-normal text-white-50">km</span>
                                                </div>
                                                <small className="text-white-50 fw-medium">Viewing distance</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Forecast Card */}
                                <Col md={12}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body>
                                            {/* Forecast header - consistent with other cards */}
                                            <div className="d-flex align-items-center gap-2 mb-4 text-white-50 text-uppercase fw-bold small">
                                                <Calendar size={16} /> 10 Day Forecast
                                            </div>

                                            {weather.daily && (
                                                <div
                                                    className="forecast-scrollable-container"
                                                    style={{
                                                        maxHeight: '600px',
                                                        overflowY: 'auto',
                                                        overflowX: 'hidden',
                                                        scrollbarWidth: 'thin'
                                                    }}
                                                >
                                                    <div
                                                        className="d-flex flex-column gap-2"
                                                        style={{
                                                            opacity: isAnimating ? 0 : 1,
                                                            transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        {weather.daily.time.slice(0, 10).map((date, idx) => {
                                                            const dayName = idx === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                                            const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
                                                            const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
                                                            const weatherCode = weather.daily.weather_code[idx];
                                                            const precip = weather.daily.precipitation_probability_max[idx] || 0;
                                                            const snow = weather.daily.snowfall_sum[idx] || 0;
                                                            const windSpeed = weather.daily.wind_speed_10m_max ? Math.round(weather.daily.wind_speed_10m_max[idx]) : 0;
                                                            const windDir = weather.daily.wind_direction_10m_dominant ? weather.daily.wind_direction_10m_dominant[idx] : 0;
                                                            const uvIndex = weather.daily.uv_index_max ? Math.round(weather.daily.uv_index_max[idx]) : 0;
                                                            const sunrise = weather.daily.sunrise ? weather.daily.sunrise[idx] : null;
                                                            const sunset = weather.daily.sunset ? weather.daily.sunset[idx] : null;

                                                            // Format time from ISO string
                                                            const formatTime = (isoString) => {
                                                                if (!isoString) return '--';
                                                                return new Date(isoString).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true
                                                                });
                                                            };

                                                            // Wind direction arrow
                                                            const getWindArrow = (deg) => {
                                                                const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
                                                                const index = Math.round(deg / 45) % 8;
                                                                return arrows[index];
                                                            };

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="d-flex flex-column align-items-center p-3 rounded-4"
                                                                    style={{
                                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                        flex: '0 0 auto',
                                                                        width: '100%',
                                                                        minWidth: '0',
                                                                        maxWidth: '100%',
                                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                    }}
                                                                >
                                                                    {/* ROW-BASED LAYOUT - Standardized columns for 10-day */}
                                                                    <div className="d-flex align-items-center w-100" style={{ gap: '8px' }}>

                                                                        {/* Column 1: Day Name - Fixed width */}
                                                                        <div
                                                                            className="fw-bold text-white"
                                                                            style={{
                                                                                fontSize: '0.95rem',
                                                                                minWidth: '50px',
                                                                                maxWidth: '50px',
                                                                                flex: '0 0 auto'
                                                                            }}
                                                                        >
                                                                            {dayName}
                                                                        </div>

                                                                        {/* Column 2: Weather Icon + Precipitation % - Fixed width */}
                                                                        <div
                                                                            className="d-flex flex-column align-items-center justify-content-center"
                                                                            style={{
                                                                                minWidth: '60px',
                                                                                maxWidth: '60px',
                                                                                flex: '0 0 auto'
                                                                            }}
                                                                        >
                                                                            <div style={{ marginBottom: '2px' }}>
                                                                                {getWeatherIcon(weatherCode, 30)}
                                                                            </div>
                                                                            <span
                                                                                className="fw-bold text-info"
                                                                                style={{
                                                                                    fontSize: '0.8rem',
                                                                                    lineHeight: 1
                                                                                }}
                                                                            >
                                                                                {precip > 0 ? `${precip}%` : '—'}
                                                                            </span>
                                                                        </div>

                                                                        {/* Column 3: Low Temp - Fixed width */}
                                                                        <div
                                                                            className="text-white-50 text-end"
                                                                            style={{
                                                                                fontSize: '0.9rem',
                                                                                minWidth: '35px',
                                                                                maxWidth: '35px',
                                                                                flex: '0 0 auto'
                                                                            }}
                                                                        >
                                                                            {minTemp}°
                                                                        </div>

                                                                        {/* Column 4: Temperature Range Bar - Flexible width */}
                                                                        <div
                                                                            className="position-relative"
                                                                            style={{
                                                                                flex: 1,
                                                                                height: '8px',
                                                                                borderRadius: '4px',
                                                                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                                                                minWidth: '60px',
                                                                                maxWidth: '150px'
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className="position-absolute rounded"
                                                                                style={{
                                                                                    left: '15%',
                                                                                    width: '55%',
                                                                                    height: '100%',
                                                                                    background: `linear-gradient(to right, ${getTemperatureColor(minTemp)}, ${getTemperatureColor(maxTemp)})`,
                                                                                    borderRadius: '4px',
                                                                                    boxShadow: `0 0 8px ${getTemperatureColor(maxTemp)}40`
                                                                                }}
                                                                            >
                                                                                {/* Dot indicator at high temp position */}
                                                                                <div
                                                                                    className="position-absolute rounded-circle"
                                                                                    style={{
                                                                                        right: '-5px',
                                                                                        top: '50%',
                                                                                        transform: 'translateY(-50%)',
                                                                                        width: '12px',
                                                                                        height: '12px',
                                                                                        backgroundColor: getTemperatureColor(maxTemp),
                                                                                        border: '2.5px solid rgba(255,255,255,0.9)',
                                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 5: High Temp - Fixed width, right aligned */}
                                                                        <div
                                                                            className="fw-bold text-white text-end"
                                                                            style={{
                                                                                fontSize: '1.05rem',
                                                                                minWidth: '40px',
                                                                                maxWidth: '40px',
                                                                                flex: '0 0 auto'
                                                                            }}
                                                                        >
                                                                            {maxTemp}°
                                                                        </div>


                                                                        {/* Desktop-only columns: Wind, UV, Sun times */}
                                                                        <div className="desktop-weather-details d-none d-md-flex align-items-center gap-3 ms-2">
                                                                            {/* Wind */}
                                                                            <div className="d-flex align-items-center gap-1 text-white-50" style={{ fontSize: '0.85rem', minWidth: '70px' }}>
                                                                                <Wind size={14} />
                                                                                <span>{windSpeed} {getWindArrow(windDir)}</span>
                                                                            </div>

                                                                            {/* UV Index */}
                                                                            <div
                                                                                className="d-flex align-items-center gap-1"
                                                                                style={{
                                                                                    fontSize: '0.85rem',
                                                                                    minWidth: '50px',
                                                                                    color: uvIndex >= 6 ? '#ff6b6b' : uvIndex >= 3 ? '#ffd93d' : '#6bcf7f'
                                                                                }}
                                                                            >
                                                                                <Sun size={14} />
                                                                                <span>UV {uvIndex}</span>
                                                                            </div>

                                                                            {/* Sunrise/Sunset */}
                                                                            <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: '0.8rem', minWidth: '140px' }}>
                                                                                <div className="d-flex align-items-center gap-1">
                                                                                    <Sunrise size={13} />
                                                                                    <span>{formatTime(sunrise)}</span>
                                                                                </div>
                                                                                <div className="d-flex align-items-center gap-1">
                                                                                    <Sunset size={13} />
                                                                                    <span>{formatTime(sunset)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 6: Snow indicator (at the end, show only if snow > 0) */}
                                                                        {snow > 0 && (
                                                                            <div
                                                                                className="d-flex align-items-center gap-1"
                                                                                style={{
                                                                                    minWidth: '50px',
                                                                                    fontSize: '0.85rem'
                                                                                }}
                                                                            >
                                                                                <Snowflake size={14} className="text-info" />
                                                                                <span className="fw-bold text-info">{snow.toFixed(1)} cm</span>
                                                                            </div>
                                                                        )}


                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Interactive Map */}
                                <Col md={12}>
                                    <MapCard
                                        location={currentLocation}
                                        coordinates={weather ? {
                                            lat: weather.latitude,
                                            lon: weather.longitude
                                        } : null}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    )}
                </div>

                {/* Avalanche Detail Modal */}
                <AvalancheDetailModal
                    show={showAvalancheModal}
                    onHide={() => setShowAvalancheModal(false)}
                    forecast={avalancheForecast}
                    location={currentLocation}
                />

                {/* Hourly Detail Modal */}
                {weather && selectedHourIndex !== null && (
                    <HourlyDetailModal
                        show={showHourlyModal}
                        onHide={() => {
                            setShowHourlyModal(false);
                            setSelectedHourIndex(null);
                        }}
                        hourData={{
                            time: weather.hourly.time[selectedHourIndex],
                            temperature_2m: weather.hourly.temperature_2m[selectedHourIndex],
                            apparent_temperature: weather.hourly.apparent_temperature?.[selectedHourIndex],
                            snowfall: weather.hourly.snowfall?.[selectedHourIndex] || 0,
                            weather_code: weather.hourly.weather_code?.[selectedHourIndex] || 0,
                            wind_speed_10m: weather.hourly.wind_speed_10m?.[selectedHourIndex],
                            wind_gusts_10m: weather.hourly.wind_gusts_10m?.[selectedHourIndex],
                            wind_direction_10m: weather.hourly.wind_direction_10m?.[selectedHourIndex],
                            precipitation_probability: weather.hourly.precipitation_probability?.[selectedHourIndex],
                            cloud_cover: weather.hourly.cloud_cover?.[selectedHourIndex],
                            cloud_cover_low: weather.hourly.cloud_cover_low?.[selectedHourIndex],
                            cloud_cover_mid: weather.hourly.cloud_cover_mid?.[selectedHourIndex],
                            cloud_cover_high: weather.hourly.cloud_cover_high?.[selectedHourIndex],
                            visibility: weather.hourly.visibility?.[selectedHourIndex],
                            surface_pressure: weather.hourly.surface_pressure?.[selectedHourIndex],
                            relativehumidity_2m: weather.hourly.relativehumidity_2m?.[selectedHourIndex],
                            dewpoint_2m: weather.hourly.dewpoint_2m?.[selectedHourIndex],
                        }}
                        hourIndex={selectedHourIndex}
                        elevation={weather.elevation || 2000}
                    />
                )}
            </div >
        </>
    );
};

export default WeatherDashboard;
