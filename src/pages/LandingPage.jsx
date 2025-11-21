import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';
import { Snowflake, TrendingUp, Mountain, MapPin, Cloud, CloudSnow, Sun, CloudRain, Wind, CloudDrizzle, AlertTriangle } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { locations } from '../data/locationData';
import { getAvalancheForecastMetadata, getDangerRatingByZoneName } from '../services/avalancheApi';
import { getWeather, getWeatherDescription } from '../services/weatherApi';
import { calculatePowderScore } from '../services/powderTracker';

/**
 * Get weather icon component based on WMO weather code
 */
const getWeatherIcon = (weatherCode, size = 18) => {
    const iconProps = { size, className: "text-info" };

    if (weatherCode === 0 || weatherCode === 1) return <Sun {...iconProps} />;
    if (weatherCode === 2 || weatherCode === 3) return <Cloud {...iconProps} />;
    if (weatherCode === 45 || weatherCode === 48) return <Wind {...iconProps} />;
    if (weatherCode >= 51 && weatherCode <= 57) return <CloudDrizzle {...iconProps} />;
    if (weatherCode >= 61 && weatherCode <= 67) return <CloudRain {...iconProps} />;
    if (weatherCode >= 80 && weatherCode <= 82) return <CloudRain {...iconProps} />;
    if (weatherCode >= 71 && weatherCode <= 77) return <CloudSnow {...iconProps} />;
    if (weatherCode >= 85 && weatherCode <= 86) return <CloudSnow {...iconProps} />;
    if (weatherCode >= 95 && weatherCode <= 99) return <AlertTriangle {...iconProps} />;

    return <Cloud {...iconProps} />;
};

/**
 * LandingPage - Best Powder Showcase
 */
const LandingPage = ({ onLocationSelect }) => {
    const [locationWeatherCache, setLocationWeatherCache] = useState({});
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [top10Locations, setTop10Locations] = useState([]);

    const calculateLocationScore = (location, weatherData, dangerRatings) => {
        if (!weatherData) return 0;

        // Base score from powder tracker
        let score = weatherData.powderScore * 10;

        // Boost for fresh snow relative to base
        if (weatherData.snowDepth > 0) {
            const freshRatio = weatherData.snowfall24h / weatherData.snowDepth;
            if (freshRatio > 0.1) score += 5; // Big dump relative to base
        }

        // Safety penalty
        if (dangerRatings) {
            const ratings = Object.values(dangerRatings).map(r => r.toLowerCase());
            if (ratings.includes('high') || ratings.includes('extreme')) score *= 0.6;
            else if (ratings.includes('considerable')) score *= 0.8;
        }

        return Math.round(score);
    };

    const getSmartTags = (weather, danger) => {
        const tags = [];
        if (weather.snowfall24h > 15) tags.push({ label: 'Deep Powder', color: 'info' });
        if (weather.weatherCode <= 1) tags.push({ label: 'Bluebird', color: 'warning' });
        if (weather.windSpeed > 30) tags.push({ label: 'Storm Watch', color: 'danger' });
        if (weather.temp > 0 && weather.weatherCode <= 2) tags.push({ label: 'Spring Corn', color: 'success' });
        if (weather.freezingLevel < 1000 && weather.snowfall24h > 5) tags.push({ label: 'Cold Smoke', color: 'primary' });
        return tags;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingWeather(true);
            const cache = {};
            const scoredLocations = [];

            // 1. Fetch Avalanche Metadata
            const avyMetadata = await getAvalancheForecastMetadata();

            // 2. Fetch Weather for all locations
            for (const location of locations) {
                try {
                    const weather = await getWeather(location.coordinates.lat, location.coordinates.lon);
                    const powder = calculatePowderScore(weather);

                    // Get real danger ratings
                    const dangerRatings = getDangerRatingByZoneName(avyMetadata, location.avalancheZone);

                    const weatherData = {
                        temp: Math.round(weather.current.temperature_2m),
                        feelsLike: Math.round(weather.current.apparent_temperature),
                        snowfall24h: powder.snowfall24h,
                        snowfall48h: powder.snowfall48h,
                        powderScore: powder.score,
                        weatherCode: weather.current.weather_code,
                        weatherDescription: getWeatherDescription(weather.current.weather_code),
                        snowDepth: weather.current.snow_depth || (weather.hourly.snow_depth ? weather.hourly.snow_depth[0] : 0),
                        freezingLevel: weather.hourly.freezing_level_height ? Math.round(weather.hourly.freezing_level_height[0]) : 0,
                        windSpeed: weather.current.wind_speed_10m
                    };

                    cache[location.name] = weatherData;

                    const score = calculateLocationScore(location, weatherData, dangerRatings);
                    const tags = getSmartTags(weatherData, dangerRatings);

                    scoredLocations.push({
                        ...location,
                        score,
                        dangerRatings, // { alp: 'low', tln: 'mod', ... }
                        weatherData,
                        tags
                    });
                } catch (err) {
                    console.error(`Failed to fetch data for ${location.name}:`, err);
                    cache[location.name] = null;
                    scoredLocations.push({ ...location, score: 0, dangerRatings: null, weatherData: null, tags: [] });
                }
            }

            const top10 = scoredLocations.sort((a, b) => b.score - a.score).slice(0, 10);
            setTop10Locations(top10);
            setLocationWeatherCache(cache);
            setLoadingWeather(false);
        };

        fetchData();
    }, []);

    return (
        <div className="min-vh-100 p-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)' }}>
            <Container fluid>
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="text-center text-white">
                            <h1 className="display-4 fw-bold mb-2">⛷️ Best Powder in BC</h1>
                            <p className="lead text-white-50">Top 10 locations ranked by fresh snow and safety</p>
                        </div>
                    </Col>
                </Row>

                {/* Top 10 Best Bets - Full Width Above Map */}
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-warning text-dark py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                                <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <Snowflake size={24} />
                                    Top 10 Best Bets Right Now
                                </h4>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loadingWeather ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Analyzing conditions across BC...</p>
                                    </div>
                                ) : (
                                    <Row className="g-0">
                                        {top10Locations.map((location, index) => (
                                            <Col key={location.name} xs={12} md={6} lg={4} xl={3}>
                                                <div
                                                    onClick={() => onLocationSelect(location)}
                                                    className="p-4 border-end border-bottom h-100"
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        background: index === 0 ? 'linear-gradient(135deg, #fff9c4 0%, #ffffff 100%)' : 'white',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    {/* Header: Rank & Tags */}
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <Badge
                                                            bg={index === 0 ? 'warning' : 'dark'}
                                                            text={index === 0 ? 'dark' : 'white'}
                                                            className="fs-5 px-3 py-2 shadow-sm"
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            #{index + 1}
                                                        </Badge>
                                                        <div className="d-flex flex-column align-items-end gap-1">
                                                            {location.tags.map((tag, i) => (
                                                                <Badge key={i} bg={tag.color} className="fw-normal">
                                                                    {tag.label}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Location Name */}
                                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-truncate">
                                                        {location.type === 'resort' ? (
                                                            <Mountain size={18} className="text-primary flex-shrink-0" />
                                                        ) : (
                                                            <MapPin size={18} className="text-success flex-shrink-0" />
                                                        )}
                                                        {location.displayName || location.name}
                                                    </h5>

                                                    {/* Primary Stats: Snow & Temp */}
                                                    {location.weatherData && (
                                                        <>
                                                            <div className="d-flex align-items-center mb-4 bg-light rounded-3 p-3">
                                                                <div className="me-3">
                                                                    <Snowflake size={32} className="text-info" />
                                                                </div>
                                                                <div>
                                                                    <div className="display-6 fw-bold text-dark lh-1">{location.weatherData.snowfall24h}cm</div>
                                                                    <div className="text-muted small fw-bold text-uppercase">24h Snow</div>
                                                                </div>
                                                                <div className="ms-auto text-end border-start ps-3">
                                                                    <div className="fs-4 fw-bold text-dark">{location.weatherData.temp}°</div>
                                                                    <div className="text-muted small">Feels {location.weatherData.feelsLike}°</div>
                                                                </div>
                                                            </div>

                                                            {/* Secondary Stats Grid */}
                                                            <Row className="g-2 mb-3 small">
                                                                <Col xs={4}>
                                                                    <div className="border rounded p-2 text-center h-100">
                                                                        <div className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>BASE</div>
                                                                        <div className="fw-bold">{location.weatherData.snowDepth}cm</div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={4}>
                                                                    <div className="border rounded p-2 text-center h-100">
                                                                        <div className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>FRZ LVL</div>
                                                                        <div className="fw-bold">{location.weatherData.freezingLevel}m</div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={4}>
                                                                    <div className="border rounded p-2 text-center h-100">
                                                                        <div className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>SCORE</div>
                                                                        <div className="fw-bold text-success">{location.weatherData.powderScore}/10</div>
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            {/* Avalanche Safety Footer */}
                                                            <div className="mt-auto">
                                                                <div className="d-flex align-items-center gap-1 mb-1">
                                                                    <AlertTriangle size={12} className="text-muted" />
                                                                    <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>AVALANCHE DANGER</span>
                                                                </div>
                                                                {location.dangerRatings ? (
                                                                    <div className="d-flex gap-1 w-100">
                                                                        {['alp', 'tln', 'btl'].map((zone) => {
                                                                            const rating = location.dangerRatings[zone]?.rating?.value;
                                                                            const colorMap = {
                                                                                low: '#4caf50',
                                                                                moderate: '#ffeb3b',
                                                                                considerable: '#ff9800',
                                                                                high: '#f44336',
                                                                                extreme: '#212121',
                                                                                earlyseason: '#9e9e9e'
                                                                            };
                                                                            const labelMap = {
                                                                                low: 'LOW', moderate: 'MOD', considerable: 'CON', high: 'HIGH', extreme: 'EXT', earlyseason: 'EARLY'
                                                                            };
                                                                            return (
                                                                                <div
                                                                                    key={zone}
                                                                                    className="flex-grow-1 text-center py-1 rounded-1 fw-bold text-white text-shadow-sm"
                                                                                    style={{
                                                                                        backgroundColor: colorMap[rating] || '#9e9e9e',
                                                                                        fontSize: '0.65rem',
                                                                                        color: rating === 'moderate' ? '#333' : 'white'
                                                                                    }}
                                                                                    title={`${zone.toUpperCase()}: ${rating}`}
                                                                                >
                                                                                    {zone.toUpperCase()}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-light rounded p-1 text-center text-muted small" style={{ fontSize: '0.7rem' }}>
                                                                        Rating Unavailable
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Map Section - Below Top 10 */}
                <Row>
                    <Col>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <Card.Header className="bg-dark text-white py-3">
                                <h5 className="mb-0 fw-bold">BC Powder Map</h5>
                                <small className="text-muted">Click markers to view detailed forecasts</small>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div style={{ height: '500px' }}>
                                    <MapComponent
                                        centerCoords={[51.0, -120.0]}
                                        areaGeoJson={null}
                                        currentLocationName={null}
                                        showAllLocations={true}
                                        allLocations={locations}
                                        highlightedLocations={top10Locations.map(loc => loc.name)}
                                        onLocationClick={onLocationSelect}
                                        onZoneClick={(feature) => console.log('Zone clicked:', feature)}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LandingPage;
