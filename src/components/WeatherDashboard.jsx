import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, Offcanvas, Badge, Alert, Modal } from 'react-bootstrap';
import { Search, Snowflake, Wind, Thermometer, Mountain, MapPin, Calendar, Droplets, Sun, Menu, Eye, Ruler, AlertTriangle, TrendingUp, CloudSnow, Sunrise, Sunset, ArrowLeft, Maximize2, Minimize2, X, ChevronRight } from 'lucide-react';
import { getCoordinates, getWeather, getWeatherDescription } from '../services/weatherApi';
import { getClosestAvalancheForecast, parseDangerRating, formatHighlights } from '../services/avalancheApi';
import { calculatePowderScore, calculateSnowfallTotal, getBestSkiingWindow } from '../services/powderTracker';
import { locations, getLocationByName, getResorts, getBackcountryZones } from '../data/locationData';
import AvalancheDetailModal from './AvalancheDetailModal';
import AnimatedBackground from './AnimatedBackground';
import MapComponent from './MapComponent';

const WeatherDashboard = ({ selectedLocation = null, onBack = null }) => {
    const [town, setTown] = useState(selectedLocation?.name || 'Whistler');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [avalancheForecast, setAvalancheForecast] = useState(null);
    const [showAvalancheModal, setShowAvalancheModal] = useState(false);
    const [powderScore, setPowderScore] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(selectedLocation);
    const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'resort', 'backcountry'
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Get all locations from database
    const allLocations = locations.map(loc => loc.name);
    const [savedLocations] = useState(allLocations);
    const [showSidebar, setShowSidebar] = useState(false);

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

    // Update currentLocation and fetch weather when selectedLocation changes
    useEffect(() => {
        if (selectedLocation) {
            console.log('🔄 WeatherDashboard received new location:', selectedLocation);
            setCurrentLocation(selectedLocation);
            setTown(selectedLocation.name);
            fetchWeather(selectedLocation.name);
        } else {
            // Default to Whistler if no location selected
            fetchWeather('Whistler');
        }
    }, [selectedLocation]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!town) return;
        fetchWeather(town);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
                <Container>
                    <Alert variant="danger" className="mx-auto" style={{ maxWidth: '500px' }}>
                        <Alert.Heading>Error Loading Weather</Alert.Heading>
                        <p>{error}</p>
                        <div className="d-flex gap-2">
                            <Button variant="outline-danger" onClick={() => fetchWeather(town)}>Retry</Button>
                            {onBack && <Button variant="link" onClick={onBack}>Go Back</Button>}
                        </div>
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <>
            {/* Animated Background */}
            {weather && weather.current && weather.daily && weather.daily.sunrise && weather.daily.sunset && (
                <AnimatedBackground
                    weatherCode={weather.current.weather_code}
                    currentTime={new Date().getTime()}
                    sunrise={new Date(weather.daily.sunrise[0]).getTime()}
                    sunset={new Date(weather.daily.sunset[0]).getTime()}
                />
            )}

            <div className="d-flex h-100 w-100 overflow-hidden">
                {/* Removed Desktop Sidebar - Now using Back Button */}

                {/* Header with Breadcrumb Navigation */}
                <Navbar variant="dark" expand={false} className="fixed-top glass-card shadow-lg" style={{ zIndex: 1000 }}>
                    <Container fluid className="py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            {onBack && currentLocation && (
                                <Button
                                    variant="link"
                                    onClick={onBack}
                                    className="text-white text-decoration-none d-flex align-items-center gap-2 p-0 align-self-start hover-scale"
                                >
                                    <ArrowLeft size={20} />
                                    <span className="fw-medium">Back to All Zones</span>
                                </Button>
                            )}
                            {!onBack && (
                                <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
                                    <img src="/logo.png" alt="PowPlus Logo" className="rounded-circle" style={{ width: '30px', height: '30px' }} />
                                    <span className="fw-bold text-shadow-sm">POWPLUS</span>
                                </Navbar.Brand>
                            )}
                        </div>
                    </Container>
                </Navbar>

                {/* Main Content */}
                <div className="w-100 overflow-auto p-4 p-md-5" style={{ minHeight: '100vh' }}>
                    {weather && (
                        <Container fluid="lg" className="mt-5 mt-md-0">
                            {/* Header */}
                            <div className="text-center text-white mb-4">
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
                                    <div className="d-flex align-items-center gap-2 mb-3 text-white-50 text-uppercase fw-bold small">
                                        <Calendar size={16} /> Hourly Forecast
                                    </div>
                                    <div className="d-flex gap-4 overflow-auto pb-2 scrollbar-hide">
                                        {weather.hourly.time.slice(0, 24).map((time, idx) => (
                                            <div key={idx} className="d-flex flex-column align-items-center gap-2" style={{ minWidth: '60px' }}>
                                                <small className="text-white-50 fw-medium">{new Date(time).getHours() === new Date().getHours() ? 'Now' : new Date(time).getHours()}</small>
                                                <div style={{ height: '32px' }} className="d-flex align-items-center">
                                                    {weather.hourly.snowfall[idx] > 0 ? <Snowflake size={24} className="text-white drop-shadow-md" /> : <Sun size={24} className="text-warning drop-shadow-md" />}
                                                </div>
                                                <span className="fw-bold fs-5 text-shadow-sm">{Math.round(weather.hourly.temperature_2m[idx])}°</span>
                                                {weather.hourly.snowfall[idx] > 0 && (
                                                    <span className="badge bg-info bg-opacity-25 text-info rounded-pill shadow-sm">{weather.hourly.snowfall[idx]}cm</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Avalanche Safety Card */}
                            {avalancheForecast && avalancheForecast.report && (
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

                                {/* 7-Day Forecast */}
                                <Col md={12}>
                                    <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4 text-white-50 text-uppercase fw-bold small">
                                                <Calendar size={16} /> 7-Day Forecast
                                            </div>
                                            {weather.daily && (
                                                <div className="d-flex flex-column gap-2">
                                                    {weather.daily.time.slice(0, 7).map((date, idx) => {
                                                        const dayName = idx === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                                        const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
                                                        const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
                                                        const snow = weather.daily.snowfall_sum ? weather.daily.snowfall_sum[idx] : 0;
                                                        const precip = weather.daily.precipitation_probability_max ? weather.daily.precipitation_probability_max[idx] : 0;

                                                        return (
                                                            <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                                <span className="fw-bold text-white" style={{ width: '80px' }}>{dayName}</span>
                                                                <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-center">
                                                                    {snow > 0 ? (
                                                                        <div className="d-flex align-items-center gap-1 text-info">
                                                                            <Snowflake size={16} />
                                                                            <small className="fw-bold">{snow.toFixed(1)} cm</small>
                                                                        </div>
                                                                    ) : (
                                                                        <Sun size={16} className="text-warning opacity-50" />
                                                                    )}
                                                                    {precip > 0 && (
                                                                        <small className="text-white">{precip}%</small>
                                                                    )}
                                                                </div>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <small className="text-white">{minTemp}°</small>
                                                                    <div className="rounded-pill" style={{ width: '60px', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                                                        <div className="bg-gradient-to-r from-info to-warning h-100 rounded-pill" style={{ width: '60%', marginLeft: '20%' }}></div>
                                                                    </div>
                                                                    <span className="fw-bold text-white">{maxTemp}°</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Backcountry Wisdom Card */}
                            {currentLocation && (
                                <BackcountryWisdomCard
                                    locationName={currentLocation.displayName || currentLocation.name}
                                    weatherConditions={weather ? {
                                        temp: Math.round(weather.current.temperature_2m),
                                        description: getWeatherDescription(weather.current.weather_code),
                                        snowfall: weather.current.snowfall
                                    } : null}
                                    avalancheDanger={avalancheForecast?.report?.dangerRatings?.[0] ? {
                                        alpine: parseDangerRating(avalancheForecast.report.dangerRatings[0].ratings.alp?.rating?.value).level,
                                        treeline: parseDangerRating(avalancheForecast.report.dangerRatings[0].ratings.tln?.rating?.value).level,
                                        btl: parseDangerRating(avalancheForecast.report.dangerRatings[0].ratings.btl?.rating?.value).level
                                    } : null}
                                />
                            )}

                            {/* Map Section - Prominent placement */}
                            <Card className="glass-card border-0 text-white shadow-lg mb-4">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <MapPin size={20} className="text-info" />
                                                <h5 className="mb-0 fw-bold text-white">Trip Planning Map</h5>
                                            </div>
                                            <small className="text-white-50">View avalanche zones and plan your route</small>
                                        </div>
                                        <Button
                                            variant="info"
                                            size="lg"
                                            onClick={() => setIsMapExpanded(true)}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Maximize2 size={18} />
                                            Open Full Map
                                        </Button>
                                    </div>

                                    {currentLocation && (
                                        <div style={{ height: '50vh', minHeight: '400px' }} className="rounded overflow-hidden">
                                            <MapComponent
                                                centerCoords={[currentLocation.coordinates.lat, currentLocation.coordinates.lon]}
                                                areaGeoJson={null}
                                                currentLocationName={currentLocation.displayName || currentLocation.name}
                                                showAllLocations={false}
                                                allLocations={[]}
                                                highlightedLocations={[]}
                                                onLocationClick={(location) => console.log('Nearby location clicked:', location)}
                                                onZoneClick={(feature) => console.log('Zone clicked:', feature)}
                                            />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Container>
                    )}
                </div>

                {/* Avalanche Detail Modal */}
                <AvalancheDetailModal
                    show={showAvalancheModal}
                    onHide={() => setShowAvalancheModal(false)}
                    forecast={avalancheForecast}
                />

                {/* Expanded Map Modal */}
                <Modal
                    show={isMapExpanded}
                    onHide={() => setIsMapExpanded(false)}
                    fullscreen
                    className="map-modal"
                >
                    <Modal.Header className="bg-dark text-white border-0 py-3">
                        <div className="d-flex flex-column">
                            <Modal.Title className="mb-1">Trip Planning Map</Modal.Title>
                            <small className="text-white-50">{currentLocation?.displayName || currentLocation?.name}</small>
                        </div>
                        <Button
                            variant="outline-light"
                            onClick={() => setIsMapExpanded(false)}
                            className="d-flex align-items-center gap-2"
                        >
                            <X size={20} />
                            Close
                        </Button>
                    </Modal.Header>
                    <Modal.Body className="p-0" style={{ height: 'calc(100vh - 70px)' }}>
                        {currentLocation && (
                            <MapComponent
                                centerCoords={[currentLocation.coordinates.lat, currentLocation.coordinates.lon]}
                                areaGeoJson={null}
                                currentLocationName={currentLocation.displayName || currentLocation.name}
                            />
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default WeatherDashboard;
