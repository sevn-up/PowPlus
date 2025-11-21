import React, { useState, useEffect } from 'react';
import { Nav, Form, Collapse } from 'react-bootstrap';
import { Home, Map, Mountain, MapPin, Search, ChevronDown, ChevronRight, Cloud, CloudSnow, Sun, CloudRain } from 'lucide-react';
import { locations, getResorts, getBackcountryZones } from '../data/locationData';
import { getWeather, getWeatherDescription } from '../services/weatherApi';

/**
 * Get weather icon based on WMO code
 */
const getWeatherIcon = (code, size = 14) => {
    if (code === 0 || code === 1) return <Sun size={size} />;
    if (code >= 71 && code <= 86) return <CloudSnow size={size} />;
    if (code >= 61 && code <= 67) return <CloudRain size={size} />;
    return <Cloud size={size} />;
};

/**
 * Sidebar - Persistent left navigation with modern bubbly UI
 */
const Sidebar = ({ currentPage, selectedLocation, onNavigate, onLocationSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [resortsExpanded, setResortsExpanded] = useState(true);
    const [backcountryExpanded, setBackcountryExpanded] = useState(false);
    const [locationWeather, setLocationWeather] = useState({});
    const [loadingWeather, setLoadingWeather] = useState(true);

    const resorts = getResorts();
    const backcountry = getBackcountryZones();

    // Fetch weather for all locations
    useEffect(() => {
        const fetchWeather = async () => {
            setLoadingWeather(true);
            const weatherData = {};

            for (const location of locations) {
                try {
                    const weather = await getWeather(location.coordinates.lat, location.coordinates.lon);
                    weatherData[location.name] = {
                        temp: Math.round(weather.current.temperature_2m),
                        high: Math.round(Math.max(...weather.hourly.temperature_2m.slice(0, 24))),
                        low: Math.round(Math.min(...weather.hourly.temperature_2m.slice(0, 24))),
                        condition: getWeatherDescription(weather.current.weather_code),
                        weatherCode: weather.current.weather_code
                    };
                } catch (err) {
                    console.error(`Failed to fetch weather for ${location.name}:`, err);
                    weatherData[location.name] = null;
                }
            }

            setLocationWeather(weatherData);
            setLoadingWeather(false);
        };

        fetchWeather();
    }, []);

    // Filter locations by search query
    const filterLocations = (locs) => {
        if (!searchQuery) return locs;
        return locs.filter(loc =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredResorts = filterLocations(resorts);
    const filteredBackcountry = filterLocations(backcountry);

    return (
        <div
            className="d-flex flex-column text-white vh-100 position-fixed"
            style={{
                width: '260px',
                background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)',
                overflowY: 'auto',
                boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
                zIndex: 1000
            }}
        >
            {/* Search Bar */}
            <div className="p-3">
                <Form.Control
                    type="search"
                    placeholder="🔍 Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 text-white"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        padding: '10px 16px'
                    }}
                />
            </div>

            {/* Navigation Items */}
            <Nav className="flex-column px-3">
                {/* Landing Page */}
                <div
                    onClick={() => onNavigate('landing')}
                    className={`d-flex align-items-center gap-3 py-3 px-3 mb-2 ${currentPage === 'landing' ? 'bg-primary' : ''
                        }`}
                    style={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        background: currentPage === 'landing'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s ease',
                        boxShadow: currentPage === 'landing' ? '0 4px 15px rgba(102,126,234,0.4)' : 'none'
                    }}
                >
                    <Home size={20} />
                    <span className="fw-medium">Best Powder</span>
                </div>

                {/* Map */}
                <div
                    onClick={() => onNavigate('map')}
                    className={`d-flex align-items-center gap-3 py-3 px-3 mb-2 ${currentPage === 'map' ? 'bg-primary' : ''
                        }`}
                    style={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        background: currentPage === 'map'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s ease',
                        boxShadow: currentPage === 'map' ? '0 4px 15px rgba(102,126,234,0.4)' : 'none'
                    }}
                >
                    <Map size={20} />
                    <span className="fw-medium">Exploration</span>
                </div>

                {/* Ski Resorts Dropdown */}
                <div className="mt-3">
                    <div
                        onClick={() => setResortsExpanded(!resortsExpanded)}
                        className="d-flex align-items-center justify-content-between py-2 px-3 mb-2"
                        style={{
                            cursor: 'pointer',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <Mountain size={18} />
                            <span className="fw-medium small">Ski Resorts</span>
                        </div>
                        {resortsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    <Collapse in={resortsExpanded}>
                        <div>
                            {filteredResorts.map((location) => {
                                const weather = locationWeather[location.name];
                                const isActive = selectedLocation?.name === location.name;

                                return (
                                    <div
                                        key={location.name}
                                        onClick={() => {
                                            console.log("Sidebar: Location clicked:", location.name);
                                            onLocationSelect(location);
                                        }}
                                        className="px-3 py-2 mb-1 mx-2"
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            background: isActive
                                                ? 'rgba(102,126,234,0.2)'
                                                : 'rgba(255,255,255,0.03)',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s ease',
                                            border: isActive ? '1px solid rgba(102,126,234,0.5)' : '1px solid transparent'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{location.displayName || location.name}</div>
                                                {weather && (
                                                    <div className="text-muted small d-flex align-items-center gap-1 mt-1">
                                                        {getWeatherIcon(weather.weatherCode, 12)}
                                                        <span>{weather.condition}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <div className="fs-5 fw-bold">{weather?.temp || '--'}°</div>
                                                {weather && (
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {weather.high}°/{weather.low}°
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Collapse>
                </div>

                {/* Backcountry Dropdown */}
                <div className="mt-2">
                    <div
                        onClick={() => setBackcountryExpanded(!backcountryExpanded)}
                        className="d-flex align-items-center justify-content-between py-2 px-3 mb-2"
                        style={{
                            cursor: 'pointer',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <MapPin size={18} />
                            <span className="fw-medium small">Backcountry</span>
                        </div>
                        {backcountryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    <Collapse in={backcountryExpanded}>
                        <div>
                            {filteredBackcountry.map((location) => {
                                const weather = locationWeather[location.name];
                                const isActive = selectedLocation?.name === location.name;

                                return (
                                    <div
                                        key={location.name}
                                        onClick={() => {
                                            console.log("Sidebar: Location clicked:", location.name);
                                            onLocationSelect(location);
                                        }}
                                        className="px-3 py-2 mb-1 mx-2"
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            background: isActive
                                                ? 'rgba(102,126,234,0.2)'
                                                : 'rgba(255,255,255,0.03)',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s ease',
                                            border: isActive ? '1px solid rgba(102,126,234,0.5)' : '1px solid transparent'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{location.displayName || location.name}</div>
                                                {weather && (
                                                    <div className="text-muted small d-flex align-items-center gap-1 mt-1">
                                                        {getWeatherIcon(weather.weatherCode, 12)}
                                                        <span>{weather.condition}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <div className="fs-5 fw-bold">{weather?.temp || '--'}°</div>
                                                {weather && (
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {weather.high}°/{weather.low}°
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Collapse>
                </div>
            </Nav>
        </div>
    );
};

export default Sidebar;
