import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Calendar, CloudRain, CloudSnow, Sun, CloudDrizzle, CloudFog, Cloud } from 'lucide-react';

/**
 * DailyForecastCard Component
 * Displays 10-day weather forecast in a compact, scannable format
 */
const DailyForecastCard = ({ weather }) => {
    if (!weather || !weather.daily) return null;

    // Get weather icon based on WMO code
    const getWeatherIcon = (code) => {
        if (code === 0 || code === 1) return <Sun size={20} className="text-warning" />;
        if (code === 2 || code === 3) return <Cloud size={20} className="text-white-50" />;
        if (code === 45 || code === 48) return <CloudFog size={20} className="text-white-50" />;
        if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow size={20} className="text-info" />;
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code))
            return <CloudRain size={20} className="text-primary" />;
        return <Cloud size={20} className="text-white-50" />;
    };

    // Format date
    const formatDate = (dateString, index) => {
        const date = new Date(dateString);
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Get precipitation probability
    const getPrecipProb = (index) => {
        return weather.daily.precipitation_probability?.[index] || 0;
    };

    return (
        <Card className="glass-card border-0 text-white shadow-lg hover-scale transition-all mb-4">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                        <Calendar size={16} /> 10-Day Forecast
                    </div>
                    <small className="text-white-50 fst-italic" style={{ fontSize: '0.65rem' }}>
                        Long-range outlook
                    </small>
                </div>

                <div className="d-flex flex-column gap-2">
                    {weather.daily.time.slice(0, 10).map((date, index) => {
                        const maxTemp = Math.round(weather.daily.temperature_2m_max[index]);
                        const minTemp = Math.round(weather.daily.temperature_2m_min[index]);
                        const weatherCode = weather.daily.weather_code[index];
                        const snowfall = weather.daily.snowfall_sum?.[index] || 0;
                        const precipProb = getPrecipProb(index);

                        return (
                            <div
                                key={date}
                                className="d-flex align-items-center justify-content-between py-2 px-3 rounded-3 transition-all"
                                style={{
                                    background: index === 0
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    border: index === 0
                                        ? '1px solid rgba(59, 130, 246, 0.4)'
                                        : '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = index === 0
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : 'rgba(255, 255, 255, 0.02)';
                                }}
                            >
                                {/* Date - Fixed width for alignment */}
                                <div style={{ minWidth: '100px', maxWidth: '100px' }}>
                                    <div className={`${index === 0 ? 'fw-bold text-info' : 'fw-medium'} small`}>
                                        {formatDate(date, index)}
                                    </div>
                                </div>

                                {/* Weather Icon */}
                                <div className="d-flex align-items-center justify-content-center" style={{ minWidth: '40px' }}>
                                    {getWeatherIcon(weatherCode)}
                                </div>

                                {/* Snowfall/Precip - Fixed width */}
                                <div className="text-center" style={{ minWidth: '70px' }}>
                                    {snowfall > 0 ? (
                                        <span className="text-info fw-bold small">
                                            <CloudSnow size={14} className="me-1" />
                                            {snowfall.toFixed(0)}cm
                                        </span>
                                    ) : precipProb > 20 ? (
                                        <span className="text-white-50 small">
                                            {precipProb}%
                                        </span>
                                    ) : (
                                        <span className="text-white-50 small">—</span>
                                    )}
                                </div>

                                {/* Temperature Range - Right aligned */}
                                <div className="d-flex align-items-center gap-2 justify-content-end" style={{ minWidth: '80px' }}>
                                    <span className="fw-bold">{maxTemp}°</span>
                                    <span className="text-white-50">{minTemp}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card.Body>
        </Card>
    );
};

export default DailyForecastCard;
