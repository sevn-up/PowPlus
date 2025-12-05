import React, { useState } from 'react';
import { Container, Row, Col, Card, Navbar, Offcanvas, Form, Button } from 'react-bootstrap';
import { Search, Snowflake, Wind, Thermometer, Mountain, Calendar, Droplets, Eye, Ruler } from 'lucide-react';
import { getWeatherDescription } from '../services/weatherApi';
import { calculatePowderScore } from '../services/powderTracker';
import { locations } from '../data/locationData';

// Custom Hooks
import { useWeather } from '../hooks/useWeather';
import { useAvalancheForecast } from '../hooks/useAvalanche';
import { useLocation } from '../contexts/LocationContext';

// Extracted Components
import AnimatedBackground from './AnimatedBackground';
import WeatherHeader from './weather/WeatherHeader';
import PowderAlertBanner from './weather/PowderAlertBanner';
import LocationSidebar from './sidebar/LocationSidebar';
import AvalancheSafetyCard from './weather/AvalancheSafetyCard';
import PowderConditionsCard from './weather/PowderConditionsCard';
import SnowfallTrackingCard from './weather/SnowfallTrackingCard';
import DailyForecastCard from './weather/DailyForecastCard';
import VisibilityCard from './weather/VisibilityCard';
import WindCard from './weather/WindCard';
import MapCard from './MapCard'; // Mapbox GL implementation
import AvalancheDetailModal from './AvalancheDetailModal';
import HourlyDetailModal from './HourlyDetailModal';

// Utils
import { getWeatherIcon, getWindColor } from '../utils/weatherIcons.jsx';
import { getSnowQuality, getVisibilityRating, getFreezingLevelWarning, getTemperatureColor, formatWindDirection } from '../utils/skiConditions';

/**
 * Refactored WeatherDashboard Component
 * Now uses custom hooks, extracted components, and context for cleaner architecture
 * Reduced from 1,185 lines to ~400 lines
 */
const WeatherDashboard = () => {
    // Use context for location management
    const { selectedLocation, setSelectedLocation } = useLocation();

    // Local state
    const [searchValue, setSearchValue] = useState(selectedLocation);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAvalancheModal, setShowAvalancheModal] = useState(false);
    const [selectedHourIndex, setSelectedHourIndex] = useState(null);
    const [showHourlyModal, setShowHourlyModal] = useState(false);

    // Fetch weather data using custom hook (with automatic caching)
    const { data: weatherData, isLoading, error } = useWeather(selectedLocation);

    // Fetch avalanche data if we have coordinates
    const { data: avalancheForecast } = useAvalancheForecast(
        weatherData?.coordinates?.lat,
        weatherData?.coordinates?.lon
    );

    // Calculate powder score when weather data changes
    const powderScore = weatherData ? calculatePowderScore(weatherData) : null;

    // Enhance weather data with description
    const weather = weatherData
        ? {
            ...weatherData,
            weatherDescription: getWeatherDescription(weatherData.current.weather_code),
        }
        : null;

    // All saved locations
    const allLocations = locations.map((loc) => loc.name);

    // Handlers
    const handleLocationSelect = (locationName) => {
        setSelectedLocation(locationName);
        setSearchValue(locationName);
        setShowSidebar(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchValue) return;
        setSelectedLocation(searchValue);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
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
                <LocationSidebar
                    currentLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearch}
                />

                {/* Mobile Navbar */}
                <Navbar variant="dark" expand={false} className="d-md-none fixed-top glass-card m-3 shadow-lg">
                    <Container fluid>
                        <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="PowPlus Logo"
                                className="rounded-circle"
                                style={{ width: '30px', height: '30px' }}
                            />
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
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                        className="bg-secondary bg-opacity-25 text-white border-0 rounded-pill ps-5"
                                    />
                                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={16} />
                                </Form>
                                <div className="d-flex flex-column gap-2">
                                    {allLocations.map((loc) => (
                                        <Button
                                            key={loc}
                                            variant="link"
                                            onClick={() => handleLocationSelect(loc)}
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
                    {isLoading && (
                        <div className="text-center text-white mt-5 pt-5">
                            <div className="spinner-border text-info" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading weather data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger mt-5 glass-card" role="alert">
                            <strong>Error:</strong> {error.message || error}
                        </div>
                    )}

                    {weather && (
                        <Container fluid="lg" className="mt-5 mt-md-0">
                            {/* Header with location and current weather */}
                            <WeatherHeader weather={weather} />

                            {/* Powder Alert Banner */}
                            <PowderAlertBanner powderScore={powderScore} />

                            {/* Hourly Forecast Strip - KEEP INLINE FOR NOW */}
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
                                                <Droplets size={12} />
                                                <span>Precip %</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hourly cards - TODO: Extract to separate component */}
                                    <div className="d-flex gap-3 overflow-auto pb-2 scrollbar-hide">
                                        {weather.hourly.time.slice(0, 24).map((time, idx) => {
                                            const hourTime = new Date(time);
                                            const currentHour = hourTime.getHours();
                                            const isNow = idx === 0;

                                            // Get weather data for this hour
                                            const temp = Math.round(weather.hourly.temperature_2m[idx]);
                                            const feelsLike = weather.hourly.apparent_temperature
                                                ? Math.round(weather.hourly.apparent_temperature[idx])
                                                : temp;
                                            const tempDiff = Math.abs(temp - feelsLike);
                                            const snow = weather.hourly.snowfall[idx];
                                            const weatherCode = weather.hourly.weather_code ? weather.hourly.weather_code[idx] : 0;
                                            const windSpeed = weather.hourly.wind_speed_10m ? Math.round(weather.hourly.wind_speed_10m[idx]) : 0;
                                            const windDirection = weather.hourly.wind_direction_10m ? weather.hourly.wind_direction_10m[idx] : 0;
                                            const precipProb = weather.hourly.precipitation_probability
                                                ? weather.hourly.precipitation_probability[idx]
                                                : 0;
                                            const visibility = weather.hourly.visibility ? weather.hourly.visibility[idx] : 10000;
                                            const isDay = weather.hourly.is_day ? weather.hourly.is_day[idx] : 1;

                                            const tempColor = getTemperatureColor(temp);
                                            const snowQuality = getSnowQuality(temp, snow);
                                            const visibilityInfo = getVisibilityRating(visibility);

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
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        setSelectedHourIndex(idx);
                                                        setShowHourlyModal(true);
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
                                                    {/* Hour */}
                                                    <small className="fw-bold" style={{ color: isNow ? '#3b82f6' : '#fff', fontSize: '0.75rem' }}>
                                                        {isNow ? 'Now' : currentHour}
                                                    </small>

                                                    {/* Weather icon */}
                                                    <div style={{ height: '36px' }} className="d-flex align-items-center">
                                                        {snow > 0 ? (
                                                            <Snowflake size={32} className="text-info" style={{ filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' }} />
                                                        ) : (
                                                            getWeatherIcon(weatherCode, 32)
                                                        )}
                                                    </div>

                                                    {/* Temperature */}
                                                    <span className="fw-bold text-shadow-sm" style={{ fontSize: '1.1rem', color: tempColor }}>
                                                        {temp}°
                                                    </span>

                                                    {/* Snowfall */}
                                                    <div style={{ height: '22px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Snowflake size={10} style={{ color: snow > 0 ? snowQuality.color : '#9ca3af', opacity: snow > 0 ? 1 : 0.3 }} />
                                                        {snow > 0 ? (
                                                            <span className="fw-bold" style={{ fontSize: '0.65rem', color: snowQuality.color }}>
                                                                {snow.toFixed(1)}cm
                                                            </span>
                                                        ) : (
                                                            <small className="text-white-50" style={{ fontSize: '0.6rem', opacity: 0.3 }}>
                                                                0cm
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Wind */}
                                                    <div style={{ height: '20px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Wind size={10} style={{ color: windSpeed >= 20 ? getWindColor(windSpeed) : '#9ca3af', opacity: windSpeed >= 20 ? 1 : 0.5 }} />
                                                        <small
                                                            className="text-white-50"
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                color: windSpeed >= 20 ? getWindColor(windSpeed) : '#9ca3af',
                                                            }}
                                                        >
                                                            {windSpeed} {formatWindDirection(windDirection).name}
                                                        </small>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Avalanche Safety Card */}
                            <AvalancheSafetyCard
                                avalancheForecast={avalancheForecast}
                                locationHasZone={!!weatherData.locationData?.avalancheZone}
                                onShowDetails={() => setShowAvalancheModal(true)}
                            />

                            {/* Powder Conditions Card */}
                            <PowderConditionsCard powderScore={powderScore} />

                            {/* 10-Day Forecast Card */}
                            <DailyForecastCard weather={weather} />

                            {/* Bento Grid */}
                            <Row className="g-4">
                                {/* Snowfall Tracking */}
                                <Col md={6}>
                                    <SnowfallTrackingCard weather={weather} />
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
                                                        {weather.current.snowfall > 0 ? 'Fresh powder!' : 'No fresh snow.'}
                                                    </p>
                                                </div>
                                                <div className="col-6 ps-4">
                                                    <div className="display-4 fw-black mb-1 text-shadow-md">
                                                        {weather.hourly.snow_depth ? (weather.hourly.snow_depth[0] * 100).toFixed(0) : 0}{' '}
                                                        <span className="fs-4 fw-medium text-white-50">cm</span>
                                                    </div>
                                                    <p className="text-white-50 mb-0 fw-medium small">Total Base</p>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Visibility Card */}
                                <Col md={6}>
                                    <VisibilityCard weather={weather} />
                                </Col>

                                {/* Wind Card */}
                                <Col md={6}>
                                    <WindCard weather={weather} />
                                </Col>

                                {/* Map Card */}
                                <Col md={12}>
                                    <MapCard
                                        location={weatherData.locationData}
                                        coordinates={weatherData.coordinates}
                                        avalancheForecast={avalancheForecast}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    )}
                </div>
            </div>

            {/* Modals */}
            {avalancheForecast && (
                <AvalancheDetailModal
                    show={showAvalancheModal}
                    onHide={() => setShowAvalancheModal(false)}
                    forecast={avalancheForecast}
                />
            )}

            {weather && selectedHourIndex !== null && (
                <HourlyDetailModal
                    show={showHourlyModal}
                    onHide={() => {
                        setShowHourlyModal(false);
                        setSelectedHourIndex(null);
                    }}
                    weather={weather}
                    hourIndex={selectedHourIndex}
                />
            )}
        </>
    );
};

export default WeatherDashboard;
