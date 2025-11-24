import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, Offcanvas, Badge, Alert } from 'react-bootstrap';
import { Search, Snowflake, Wind, Thermometer, Mountain, MapPin, Calendar, Droplets, Sun, Menu, Eye, Ruler, AlertTriangle, TrendingUp, CloudSnow, Sunrise, Sunset, Cloud, CloudRain, CloudDrizzle, CloudFog, Zap } from 'lucide-react';
import { getCoordinates, getWeather, getWeatherDescription } from '../services/weatherApi';
import { getClosestAvalancheForecast, parseDangerRating, formatHighlights } from '../services/avalancheApi';
import { calculatePowderScore, calculateSnowfallTotal, getBestSkiingWindow } from '../services/powderTracker';
import { locations, getLocationByName, getResorts, getBackcountryZones } from '../data/locationData';
import AvalancheDetailModal from './AvalancheDetailModal';
import AnimatedBackground from './AnimatedBackground';
import MapCard from './MapCard';
import { getSnowQuality, getVisibilityRating, getFreezingLevelWarning, getTemperatureColor } from '../utils/skiConditions';

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
    const [forecastView, setForecastView] = useState('10day'); // '3day' or '10day'
    const [isAnimating, setIsAnimating] = useState(false); // For smooth transitions

    // Helper function to get weather icon based on WMO code
    const getWeatherIcon = (code, size = 20) => {
        const iconProps = { size, className: "drop-shadow-md" };
        if (code === 0) return <Sun {...iconProps} className="text-warning drop-shadow-md" />;
        if (code === 1) return <Sun {...iconProps} className="text-warning opacity-75 drop-shadow-md" />;
        if (code === 2) return <Cloud {...iconProps} className="text-white-50 drop-shadow-md" />;
        if (code === 3) return <Cloud {...iconProps} className="text-white drop-shadow-md" />;
        if (code >= 45 && code <= 48) return <CloudFog {...iconProps} className="text-white-50 drop-shadow-md" />;
        if (code >= 51 && code <= 57) return <CloudDrizzle {...iconProps} className="text-info drop-shadow-md" />;
        if (code >= 61 && code <= 67) return <CloudRain {...iconProps} className="text-info drop-shadow-md" />;
        if (code >= 71 && code <= 77) return <Snowflake {...iconProps} className="text-white drop-shadow-md" />;
        if (code >= 80 && code <= 82) return <CloudRain {...iconProps} className="text-info drop-shadow-md" />;
        if (code >= 85 && code <= 86) return <CloudSnow {...iconProps} className="text-white drop-shadow-md" />;
        if (code >= 95 && code <= 99) return <Zap {...iconProps} className="text-warning drop-shadow-md" />;
        return <Sun {...iconProps} className="text-warning opacity-50 drop-shadow-md" />;
    };

    // Helper function to get wind speed color
    const getWindColor = (speed) => {
        if (speed < 20) return '#10b981'; // Green - Calm
        if (speed < 40) return '#fbbf24'; // Yellow - Breezy
        if (speed < 60) return '#f97316'; // Orange - Windy
        return '#ef4444'; // Red - Very windy
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
                <div className="d-none d-md-flex flex-column p-4 glass-sidebar" style={{ width: '320px', height: '100vh' }}>
                    <div className="mb-4">
                        <div className="d-flex align-items-center gap-2 mb-4 text-white">
                            <img src="/logo.png" alt="PowPlus Logo" className="rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }} />
                            <span className="fw-bold fs-4 tracking-tight text-shadow-sm">POWPLUS</span>
                        </div>

                        <Form onSubmit={handleSearch} className="position-relative">
                            <Form.Control
                                type="text"
                                placeholder="Search..."
                                value={town}
                                onChange={(e) => setTown(e.target.value)}
                                className="bg-transparent text-white border-secondary rounded-pill ps-5 shadow-sm"
                                style={{ backdropFilter: 'blur(5px)' }}
                            />
                            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={16} />
                        </Form>
                    </div>

                    <div className="flex-grow-1 overflow-auto custom-scrollbar">
                        <small className="text-uppercase text-white-50 fw-bold mb-3 d-block px-2">Ski Resorts</small>
                        <div className="d-flex flex-column gap-2 mb-4">
                            {getResorts().map((loc) => (
                                <Button
                                    key={loc.name}
                                    variant="link"
                                    onClick={() => fetchWeather(loc.name)}
                                    className={`text-decoration-none text-start px-3 py-2 rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale ${town === loc.name ? 'bg-primary bg-opacity-50 text-white shadow-md' : 'text-white-50 hover-bg-white-10'}`}
                                >
                                    <div className="d-flex flex-column">
                                        <span className="fw-medium">{loc.name}</span>
                                        {loc.resortInfo && (
                                            <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                                {loc.resortInfo.verticalDrop}m vertical
                                            </small>
                                        )}
                                    </div>
                                    {town === loc.name && <div className="bg-white rounded-circle shadow-sm" style={{ width: '8px', height: '8px' }}></div>}
                                </Button>
                            ))}
                        </div>

                        <small className="text-uppercase text-white-50 fw-bold mb-3 d-block px-2">Backcountry</small>
                        <div className="d-flex flex-column gap-2">
                            {getBackcountryZones().map((loc) => (
                                <Button
                                    key={loc.name}
                                    variant="link"
                                    onClick={() => fetchWeather(loc.name)}
                                    className={`text-decoration-none text-start px-3 py-2 rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale ${town === loc.name ? 'bg-primary bg-opacity-50 text-white shadow-md' : 'text-white-50 hover-bg-white-10'}`}
                                >
                                    <div className="d-flex flex-column">
                                        <span className="fw-medium">{loc.name}</span>
                                        {loc.backcountryInfo && (
                                            <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                                {loc.backcountryInfo.difficulty}
                                            </small>
                                        )}
                                    </div>
                                    {town === loc.name && <div className="bg-white rounded-circle shadow-sm" style={{ width: '8px', height: '8px' }}></div>}
                                </Button>
                            ))}
                        </div>
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
                                <Form onSubmit={handleSearch} className="mb-4 position-relative">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search..."
                                        value={town}
                                        onChange={(e) => setTown(e.target.value)}
                                        className="bg-secondary bg-opacity-25 text-white border-0 rounded-pill ps-5"
                                    />
                                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={16} />
                                </Form>
                                <div className="d-flex flex-column gap-2">
                                    {savedLocations.map((loc) => (
                                        <Button
                                            key={loc}
                                            variant="link"
                                            onClick={() => fetchWeather(loc)}
                                            className="text-decoration-none text-white text-start px-0 fs-5"
                                        >
                                            {loc}
                                        </Button>
                                    ))}
                                </div>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>

                {/* Main Content */}
                <div className="flex-grow-1 overflow-auto p-4 p-md-5" style={{ height: '100vh' }}>
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

                                    <div className="d-flex gap-3 overflow-auto pb-2 scrollbar-hide">
                                        {weather.hourly.time.slice(0, 24).map((time, idx) => {
                                            const hourTime = new Date(time);
                                            const currentHour = hourTime.getHours();
                                            const isNow = idx === 0;

                                            // Check if this hour contains sunrise or sunset
                                            const sunrise = weather.daily.sunrise ? new Date(weather.daily.sunrise[0]) : null;
                                            const sunset = weather.daily.sunset ? new Date(weather.daily.sunset[0]) : null;
                                            const isSunriseHour = sunrise && sunrise.getHours() === currentHour;
                                            const isSunsetHour = sunset && sunset.getHours() === currentHour;

                                            // Get weather data for this hour
                                            const temp = Math.round(weather.hourly.temperature_2m[idx]);
                                            const feelsLike = weather.hourly.apparent_temperature ? Math.round(weather.hourly.apparent_temperature[idx]) : temp;
                                            const tempDiff = Math.abs(temp - feelsLike);
                                            const snow = weather.hourly.snowfall[idx];
                                            const weatherCode = weather.hourly.weather_code ? weather.hourly.weather_code[idx] : 0;
                                            const windSpeed = weather.hourly.wind_speed_10m ? Math.round(weather.hourly.wind_speed_10m[idx]) : 0;
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
                                                    className="d-flex flex-column align-items-center gap-2 position-relative"
                                                    style={{
                                                        minWidth: '85px',
                                                        padding: '0.75rem 0.5rem',
                                                        borderRadius: '1rem',
                                                        background: isDay
                                                            ? 'linear-gradient(180deg, rgba(135, 206, 235, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
                                                            : 'linear-gradient(180deg, rgba(25, 25, 112, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%)',
                                                        border: isNow ? '2px solid rgba(59, 130, 246, 0.5)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {/* Hour label */}
                                                    <small className="fw-bold" style={{ color: isNow ? '#3b82f6' : '#fff', fontSize: '0.75rem' }}>
                                                        {isNow ? 'Now' : currentHour}
                                                    </small>

                                                    {/* Sunrise/Sunset indicator */}
                                                    {(isSunriseHour || isSunsetHour) && (
                                                        <div style={{ height: '18px', fontSize: '0.9rem' }}>
                                                            {isSunriseHour ? '🌅' : '🌇'}
                                                        </div>
                                                    )}
                                                    {!isSunriseHour && !isSunsetHour && <div style={{ height: '18px' }}></div>}

                                                    {/* Weather icon */}
                                                    <div style={{ height: '36px' }} className="d-flex align-items-center">
                                                        {getWeatherIcon(weatherCode, 32)}
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

                                                    {/* Feels-like badge (only if significantly different) */}
                                                    <div style={{ minHeight: '18px' }}>
                                                        {tempDiff >= 3 && (
                                                            <small
                                                                className="badge rounded-pill"
                                                                style={{
                                                                    fontSize: '0.6rem',
                                                                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                                                    color: '#fbbf24',
                                                                    border: '1px solid rgba(251, 191, 36, 0.3)'
                                                                }}
                                                            >
                                                                Feels {feelsLike}°
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Snowfall badge with quality indicator */}
                                                    <div style={{ minHeight: '26px' }}>
                                                        {snow > 0 && (
                                                            <div className="d-flex flex-column align-items-center gap-1">
                                                                <span
                                                                    className="badge rounded-pill shadow-sm d-flex align-items-center gap-1"
                                                                    style={{
                                                                        fontSize: '0.7rem',
                                                                        backgroundColor: `${snowQuality.color}30`,
                                                                        color: snowQuality.color,
                                                                        border: `1px solid ${snowQuality.color}60`,
                                                                        padding: '2px 6px'
                                                                    }}
                                                                >
                                                                    {snowQuality.emoji} {snow}cm
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Freezing level warning (only when relevant) */}
                                                    <div style={{ minHeight: '18px' }}>
                                                        {freezingWarning && freezingWarning.warning && (
                                                            <small
                                                                className="badge rounded-pill"
                                                                style={{
                                                                    fontSize: '0.55rem',
                                                                    backgroundColor: `${freezingWarning.color}20`,
                                                                    color: freezingWarning.color,
                                                                    border: `1px solid ${freezingWarning.color}40`,
                                                                    padding: '2px 5px'
                                                                }}
                                                            >
                                                                {freezingWarning.emoji} {freezingWarning.status}
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Visibility warning */}
                                                    <div style={{ minHeight: '18px' }}>
                                                        {visibilityInfo.warning && (
                                                            <small
                                                                className="badge rounded-pill"
                                                                style={{
                                                                    fontSize: '0.55rem',
                                                                    backgroundColor: `${visibilityInfo.color}20`,
                                                                    color: visibilityInfo.color,
                                                                    border: `1px solid ${visibilityInfo.color}40`,
                                                                    padding: '2px 5px'
                                                                }}
                                                            >
                                                                Vis: {visibilityInfo.distance}km
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Wind badge (enhanced with better visibility) */}
                                                    <div style={{ minHeight: '20px' }}>
                                                        {windSpeed >= 20 && (
                                                            <div
                                                                className="d-flex align-items-center gap-1 rounded-pill"
                                                                style={{
                                                                    backgroundColor: `${getWindColor(windSpeed)}25`,
                                                                    border: `1px solid ${getWindColor(windSpeed)}50`,
                                                                    fontSize: '0.65rem',
                                                                    padding: '2px 6px',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                <Wind size={10} style={{ color: getWindColor(windSpeed) }} />
                                                                <span className="fw-bold" style={{ color: getWindColor(windSpeed) }}>
                                                                    {windSpeed}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Cloud cover mini bar */}
                                                    <div style={{ width: '100%', minHeight: '12px' }}>
                                                        {cloudCover > 20 && (
                                                            <div style={{ width: '100%' }}>
                                                                <div
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '3px',
                                                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                                                        borderRadius: '2px',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: `${cloudCover}%`,
                                                                            height: '100%',
                                                                            backgroundColor: 'rgba(255,255,255,0.6)',
                                                                            transition: 'width 0.3s ease'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <small className="text-white-50 d-block text-center" style={{ fontSize: '0.55rem', marginTop: '2px' }}>
                                                                    Cover {cloudCover}%
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Precipitation probability */}
                                                    {precipProb > 0 && (
                                                        <small className="text-white-50" style={{ fontSize: '0.65rem' }}>
                                                            Precip: {precipProb}%
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Avalanche Safety Card - Only show for locations with valid avalanche zones */}
                            {avalancheForecast && avalancheForecast.report && currentLocation?.avalancheZone && (
                                <Card
                                    className="glass-card border-0 mb-4 text-white shadow-lg hover-scale transition-all"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowAvalancheModal(true)}
                                >
                                    <Card.Body>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                <AlertTriangle size={16} /> Avalanche Forecast
                                            </div>
                                            {avalancheForecast.area?.name && !avalancheForecast.area.name.match(/^[0-9a-f]{64}$/) && (
                                                <Badge bg="secondary">
                                                    {avalancheForecast.area.name}
                                                </Badge>
                                            )}
                                        </div>

                                        {avalancheForecast.report.dangerRatings && avalancheForecast.report.dangerRatings[0] && (
                                            <div className="mb-3">
                                                <Row className="g-2">
                                                    {['alp', 'tln', 'btl'].map((elevation) => {
                                                        const rating = avalancheForecast.report.dangerRatings[0].ratings[elevation];
                                                        const ratingInfo = parseDangerRating(rating?.rating?.value);
                                                        return (
                                                            <Col xs={4} key={elevation}>
                                                                <div
                                                                    className="p-2 rounded text-center"
                                                                    style={{
                                                                        backgroundColor: ratingInfo.color,
                                                                        color: ratingInfo.textColor
                                                                    }}
                                                                >
                                                                    <small className="d-block" style={{ fontSize: '0.7rem' }}>
                                                                        {rating?.display || elevation.toUpperCase()}
                                                                    </small>
                                                                    <strong style={{ fontSize: '0.8rem' }}>{ratingInfo.level}</strong>
                                                                </div>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        )}

                                        {avalancheForecast.report.highlights && (
                                            <div className="bg-white bg-opacity-10 rounded-4 p-3 mb-3">
                                                <small className="text-white">
                                                    {formatHighlights(avalancheForecast.report.highlights).substring(0, 150)}...
                                                </small>
                                            </div>
                                        )}

                                        <div className="text-center">
                                            <Button variant="outline-light" size="sm">
                                                View Full Report →
                                            </Button>
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
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                                                    <Calendar size={16} /> Forecast
                                                </div>
                                                {/* Modern On/Off Toggle */}
                                                <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-50 rounded-pill p-1" style={{ backdropFilter: 'blur(10px)' }}>
                                                    <button
                                                        className={`px-3 py-1 rounded-pill border-0 transition-all ${forecastView === '3day'
                                                            ? 'bg-primary text-white fw-medium'
                                                            : 'bg-transparent text-white-50'
                                                            }`}
                                                        onClick={() => {
                                                            setIsAnimating(true);
                                                            setTimeout(() => {
                                                                setForecastView('3day');
                                                                setIsAnimating(false);
                                                            }, 150);
                                                        }}
                                                        style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        3 Day
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 rounded-pill border-0 transition-all ${forecastView === '10day'
                                                            ? 'bg-primary text-white fw-medium'
                                                            : 'bg-transparent text-white-50'
                                                            }`}
                                                        onClick={() => {
                                                            setIsAnimating(true);
                                                            setTimeout(() => {
                                                                setForecastView('10day');
                                                                setIsAnimating(false);
                                                            }, 150);
                                                        }}
                                                        style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        10 Day
                                                    </button>
                                                </div>
                                            </div>

                                            {weather.daily && (
                                                <div
                                                    className="d-flex gap-2 w-100"
                                                    style={{
                                                        opacity: isAnimating ? 0 : 1,
                                                        transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        overflowX: forecastView === '10day' ? 'auto' : 'visible',
                                                        scrollbarWidth: 'thin'
                                                    }}
                                                >
                                                    {weather.daily.time.slice(0, forecastView === '3day' ? 3 : 10).map((date, idx) => {
                                                        const dayName = idx === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                                        const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
                                                        const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
                                                        const snow = weather.daily.snowfall_sum ? weather.daily.snowfall_sum[idx] : 0;
                                                        const precip = weather.daily.precipitation_probability_max ? weather.daily.precipitation_probability_max[idx] : 0;
                                                        const windSpeed = weather.daily.wind_speed_10m_max ? Math.round(weather.daily.wind_speed_10m_max[idx]) : 0;
                                                        const windDir = weather.daily.wind_direction_10m_dominant ? weather.daily.wind_direction_10m_dominant[idx] : 0;
                                                        const weatherCode = weather.daily.weather_code ? weather.daily.weather_code[idx] : 0;
                                                        const uvIndex = weather.daily.uv_index_max ? Math.round(weather.daily.uv_index_max[idx]) : 0;
                                                        const sunrise = weather.daily.sunrise ? weather.daily.sunrise[idx] : null;
                                                        const sunset = weather.daily.sunset ? weather.daily.sunset[idx] : null;

                                                        const is3Day = forecastView === '3day';

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="d-flex flex-column align-items-center p-3 rounded-4"
                                                                style={{
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                    flex: is3Day ? 1 : '1 1 0',
                                                                    minWidth: is3Day ? '180px' : '85px',
                                                                    maxWidth: is3Day ? 'none' : '110px',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                }}
                                                            >
                                                                {/* 1. Day Name - FIXED */}
                                                                <div className="fw-bold text-white text-center mb-2" style={{ fontSize: is3Day ? '1.1rem' : '0.9rem', minHeight: '24px' }}>
                                                                    {dayName}
                                                                </div>

                                                                {/* 2. Weather Icon - FIXED */}
                                                                <div className="mb-3" style={{ minHeight: is3Day ? '56px' : '32px' }}>
                                                                    {getWeatherIcon(weatherCode, is3Day ? 56 : 32)}
                                                                </div>

                                                                {/* 3. Snow Amount - ALWAYS SHOWN FIXED */}
                                                                <div className="text-center" style={{ minHeight: is3Day ? '28px' : '24px', marginBottom: '4px' }}>
                                                                    {snow > 0 ? (
                                                                        <div className="d-flex align-items-center gap-1 justify-content-center">
                                                                            <Snowflake size={is3Day ? 16 : 14} className="text-info" />
                                                                            <span className="fw-bold text-info" style={{ fontSize: is3Day ? '0.95rem' : '0.8rem' }}>
                                                                                {snow.toFixed(1)} cm
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-white-50" style={{ fontSize: is3Day ? '0.95rem' : '0.8rem' }}>-</span>
                                                                    )}
                                                                </div>

                                                                {/* 4. Precipitation % - ALWAYS SHOWN FIXED */}
                                                                <div className="text-center text-white-50" style={{ minHeight: is3Day ? '24px' : '20px', fontSize: is3Day ? '0.85rem' : '0.75rem', marginBottom: '8px' }}>
                                                                    {precip > 0 ? `${precip}%` : '-'}
                                                                </div>

                                                                {is3Day ? (
                                                                    /* Enhanced 3-Day View */
                                                                    <>
                                                                        {/* 5. Wind Speed + Direction - FIXED SLOT */}
                                                                        <div className="mb-2" style={{ minHeight: '32px' }}>
                                                                            {windSpeed > 0 && (
                                                                                <div
                                                                                    className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                                                                    style={{
                                                                                        backgroundColor: `${getWindColor(windSpeed)}20`,
                                                                                        border: `1px solid ${getWindColor(windSpeed)}40`
                                                                                    }}
                                                                                >
                                                                                    <Wind size={14} style={{ color: getWindColor(windSpeed) }} />
                                                                                    <span className="fw-medium" style={{ color: getWindColor(windSpeed), fontSize: '0.75rem' }}>
                                                                                        {windSpeed} km/h {getWindDirection(windDir)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* 6. UV Index - FIXED SLOT - ALWAYS SHOWN */}
                                                                        <div className="mb-3" style={{ minHeight: '32px' }}>
                                                                            <div
                                                                                className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                                                                style={{
                                                                                    backgroundColor: `${getUVColor(uvIndex === 0 ? 1 : uvIndex)}20`,
                                                                                    border: `1px solid ${getUVColor(uvIndex === 0 ? 1 : uvIndex)}40`
                                                                                }}
                                                                            >
                                                                                <Sun size={14} style={{ color: getUVColor(uvIndex === 0 ? 1 : uvIndex) }} />
                                                                                <span className="fw-medium" style={{ color: getUVColor(uvIndex === 0 ? 1 : uvIndex), fontSize: '0.75rem' }}>
                                                                                    UV {uvIndex}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* 7. Sunrise - FIXED */}
                                                                        <div className="text-white-50 small mb-2" style={{ fontSize: '0.75rem', minHeight: '20px' }}>
                                                                            🌅 {formatTime(sunrise)}
                                                                        </div>

                                                                        {/* 8-9. Temperature with Bar - FIXED */}
                                                                        <div className="d-flex flex-column align-items-center gap-2 my-2">
                                                                            <span className="fw-bold text-white" style={{ fontSize: '1.4rem' }}>
                                                                                {maxTemp}°
                                                                            </span>
                                                                            <div
                                                                                className="rounded-pill"
                                                                                style={{
                                                                                    width: '4px',
                                                                                    height: '50px',
                                                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                                    position: 'relative'
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="rounded-pill position-absolute"
                                                                                    style={{
                                                                                        width: '4px',
                                                                                        height: '60%',
                                                                                        top: '20%',
                                                                                        background: 'linear-gradient(to bottom, #fbbf24, #0ea5e9)'
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                            <span className="text-white-50" style={{ fontSize: '1rem' }}>
                                                                                {minTemp}°
                                                                            </span>
                                                                        </div>

                                                                        {/* 10. Sunset - FIXED */}
                                                                        <div className="text-white-50 small mt-2" style={{ fontSize: '0.75rem', minHeight: '20px' }}>
                                                                            🌇 {formatTime(sunset)}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    /* Compact 7-Day View */
                                                                    <>
                                                                        {/* 5. Wind Speed Badge - FIXED SLOT */}
                                                                        <div className="mb-2" style={{ minHeight: '28px' }}>
                                                                            {windSpeed > 0 && (
                                                                                <div
                                                                                    className="d-flex align-items-center rounded-pill"
                                                                                    style={{
                                                                                        backgroundColor: `${getWindColor(windSpeed)}20`,
                                                                                        border: `1px solid ${getWindColor(windSpeed)}40`,
                                                                                        fontSize: '0.6rem',
                                                                                        padding: '2px 6px',
                                                                                        gap: '3px',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}
                                                                                >
                                                                                    <Wind size={11} style={{ color: getWindColor(windSpeed) }} />
                                                                                    <span className="fw-medium" style={{ color: getWindColor(windSpeed) }}>
                                                                                        {windSpeed} {getWindDirection(windDir)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* 6. UV Index - FIXED SLOT - ALWAYS SHOWN (GREEN for UV 0) */}
                                                                        <div className="mb-2" style={{ minHeight: '24px' }}>
                                                                            <div
                                                                                className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                                                                style={{
                                                                                    backgroundColor: `${getUVColor(uvIndex === 0 ? 1 : uvIndex)}20`,
                                                                                    border: `1px solid ${getUVColor(uvIndex === 0 ? 1 : uvIndex)}40`,
                                                                                    fontSize: '0.65rem'
                                                                                }}
                                                                            >
                                                                                <Sun size={12} style={{ color: getUVColor(uvIndex === 0 ? 1 : uvIndex) }} />
                                                                                <span className="fw-medium" style={{ color: getUVColor(uvIndex === 0 ? 1 : uvIndex) }}>
                                                                                    UV {uvIndex}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* 7. Sunrise - FIXED */}
                                                                        <div className="text-white-50 small mb-1" style={{ fontSize: '0.65rem', minHeight: '16px' }}>
                                                                            🌅 {formatTime(sunrise)}
                                                                        </div>

                                                                        {/* 8-9. Temperature - FIXED */}
                                                                        <div className="d-flex flex-column align-items-center gap-2 my-1">
                                                                            <span className="fw-bold text-white" style={{ fontSize: '1rem' }}>
                                                                                {maxTemp}°
                                                                            </span>
                                                                            <div
                                                                                className="rounded-pill"
                                                                                style={{
                                                                                    width: '4px',
                                                                                    height: '30px',
                                                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                                    position: 'relative'
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="rounded-pill position-absolute"
                                                                                    style={{
                                                                                        width: '4px',
                                                                                        height: '60%',
                                                                                        top: '20%',
                                                                                        background: 'linear-gradient(to bottom, #fbbf24, #0ea5e9)'
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                            <small className="text-white-50" style={{ fontSize: '0.85rem' }}>
                                                                                {minTemp}°
                                                                            </small>
                                                                        </div>

                                                                        {/* 10. Sunset - FIXED */}
                                                                        <div className="text-white-50 small mt-1" style={{ fontSize: '0.65rem', minHeight: '16px' }}>
                                                                            🌇 {formatTime(sunset)}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                />
            </div>
        </>
    );
};

export default WeatherDashboard;
