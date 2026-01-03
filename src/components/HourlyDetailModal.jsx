import React from 'react';
import { Modal, Card, Row, Col, Badge } from 'react-bootstrap';
import { Wind, Snowflake, Cloud, Droplets, Eye, Gauge, Thermometer, Star } from 'lucide-react';
import { getSnowQuality, getVisibilityRating, getSkiingConditionRating, formatWindDirection } from '../utils/skiConditions';
import { getWeatherIcon, getWindColor } from '../utils/weatherIcons.jsx';

const HourlyDetailModal = ({ show, onHide, hourData, hourIndex, elevation }) => {
    if (!hourData) return null;

    // Extract all hourly data
    const temp = Math.round(hourData.temperature_2m);
    const feelsLike = hourData.apparent_temperature ? Math.round(hourData.apparent_temperature) : temp;
    const snow = hourData.snowfall || 0;
    const weatherCode = hourData.weather_code || 0;
    const windSpeed = hourData.wind_speed_10m ? Math.round(hourData.wind_speed_10m) : 0;
    const windGusts = hourData.wind_gusts_10m ? Math.round(hourData.wind_gusts_10m) : 0;
    const windDirection = hourData.wind_direction_10m || 0;
    const precipProb = hourData.precipitation_probability || 0;
    const cloudCover = hourData.cloud_cover || 0;
    const cloudLow = hourData.cloud_cover_low || 0;
    const cloudMid = hourData.cloud_cover_mid || 0;
    const cloudHigh = hourData.cloud_cover_high || 0;
    const visibility = hourData.visibility || 10000;
    const pressure = hourData.surface_pressure || 1013;
    const humidity = hourData.relativehumidity_2m || 0;
    const dewpoint = hourData.dewpoint_2m || 0;

    // Calculate skiing metrics
    const snowQuality = getSnowQuality(temp, snow);
    const visibilityInfo = getVisibilityRating(visibility);
    const windDir = formatWindDirection(windDirection);
    const skiConditions = getSkiingConditionRating(hourData, elevation);

    // Format hour display
    const hourTime = new Date(hourData.time);
    const hourLabel = hourIndex === 0 ? 'Now' : hourTime.getHours();
    const dateLabel = hourTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="hourly-detail-modal"
            contentClassName="glass-card border-0 text-white"
            style={{ backdropFilter: 'blur(5px)' }}
        >
            <Modal.Header
                closeButton
                closeVariant="white"
                className="border-bottom border-secondary bg-transparent"
            >
                <Modal.Title>
                    <div>
                        <div className="d-flex align-items-center gap-2 text-info fw-bold">
                            <Thermometer size={20} />
                            Hourly Forecast
                        </div>
                        <div className="d-flex flex-column mt-1">
                            <small className="text-white-50">{dateLabel}</small>
                            <h5 className="mb-0">{hourLabel === 'Now' ? 'Right Now' : `${hourLabel}:00`}</h5>
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-transparent">
                {/* Weather Summary Section */}
                <div className="text-center mb-4 pb-4 border-bottom border-secondary">
                    <div className="mb-3">
                        {getWeatherIcon(weatherCode, 64)}
                    </div>
                    <h2 className="mb-2">
                        {temp}°
                        {feelsLike !== temp && (
                            <small className="text-white-50 ms-2" style={{ fontSize: '1rem' }}>
                                Feels like {feelsLike}°
                            </small>
                        )}
                    </h2>
                </div>

                {/* Powder Alert Banner - only show when snowing */}
                {snow > 0 && (
                    <div className="p-3 rounded-4 mb-3 position-relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.05))',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                        <div className="d-flex align-items-center gap-2">
                            <Snowflake size={20} className="text-info" />
                            <span className="text-info fw-bold">{snow.toFixed(1)}cm fresh powder this hour!</span>
                        </div>
                    </div>
                )}

                {/* Metrics Grid */}
                <Row className="g-3 mb-4">
                    {/* Wind Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Wind
                                    size={32}
                                    className="mb-2"
                                    style={{ color: windSpeed >= 20 ? getWindColor(windSpeed) : '#9ca3af' }}
                                />
                                <h6 className="text-white-50 mb-2">Wind</h6>
                                <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                                    {windSpeed} km/h
                                </div>
                                <small className="text-white-50">
                                    {windDir.name} {windDir.label}
                                </small>
                                {windGusts > windSpeed && (
                                    <div className="mt-2">
                                        <small className="text-warning">Gusts {windGusts} km/h</small>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Snow Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Snowflake
                                    size={32}
                                    className="mb-2"
                                    style={{ color: snow > 0 ? snowQuality.color : '#9ca3af' }}
                                />
                                <h6 className="text-white-50 mb-2">Snowfall</h6>
                                <div className="fw-bold" style={{ fontSize: '1.2rem', color: snow > 0 ? snowQuality.color : '#9ca3af' }}>
                                    {snow.toFixed(1)}cm
                                </div>
                                <small style={{ color: snow > 0 ? snowQuality.color : '#9ca3af' }}>
                                    {snowQuality.quality}
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Clouds Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Cloud size={32} className="mb-2 text-white-50" />
                                <h6 className="text-white-50 mb-2">Cloud Cover</h6>
                                <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                                    {cloudCover}%
                                </div>
                                <div className="mt-2" style={{ fontSize: '0.7rem' }}>
                                    <div className="d-flex justify-content-between text-white-50">
                                        <span>Low: {cloudLow}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-white-50">
                                        <span>Mid: {cloudMid}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-white-50">
                                        <span>High: {cloudHigh}%</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Precipitation Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Droplets size={32} className="mb-2 text-info" />
                                <h6 className="text-white-50 mb-2">Precipitation</h6>
                                <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                                    {precipProb}%
                                </div>
                                <small className="text-white-50">Chance of precip</small>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Visibility Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Eye
                                    size={32}
                                    className="mb-2"
                                    style={{ color: visibilityInfo.warning ? visibilityInfo.color : '#9ca3af' }}
                                />
                                <h6 className="text-white-50 mb-2">Visibility</h6>
                                <div
                                    className="fw-bold"
                                    style={{
                                        fontSize: '1.2rem',
                                        color: visibilityInfo.warning ? visibilityInfo.color : 'white'
                                    }}
                                >
                                    {visibilityInfo.distance} km
                                </div>
                                <small style={{ color: visibilityInfo.warning ? visibilityInfo.color : '#9ca3af' }}>
                                    {visibilityInfo.level}
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Pressure Card */}
                    <Col xs={6} md={4}>
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="text-center">
                                <Gauge size={32} className="mb-2 text-white-50" />
                                <h6 className="text-white-50 mb-2">Pressure</h6>
                                <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                                    {Math.round(pressure)} mb
                                </div>
                                <small className="text-white-50">
                                    Humidity: {humidity}%
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Skiing Conditions Summary */}
                <Card
                    className="border-0"
                    style={{
                        backgroundColor: `${skiConditions.color}20`,
                        borderLeft: `4px solid ${skiConditions.color}`
                    }}
                >
                    <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                            <Star size={24} style={{ color: skiConditions.color }} className="me-2" />
                            <div>
                                <h6 className="mb-0">Skiing Conditions</h6>
                                <Badge
                                    bg=""
                                    style={{ backgroundColor: skiConditions.color, fontSize: '0.9rem' }}
                                    className="mt-1"
                                >
                                    {skiConditions.rating} ({skiConditions.score}/100)
                                </Badge>
                            </div>
                        </div>

                        {skiConditions.insights && skiConditions.insights.length > 0 && (
                            <div className="mb-2">
                                <h6 className="text-white-50 mb-2" style={{ fontSize: '0.85rem' }}>Key Insights:</h6>
                                <ul className="mb-0 ps-3" style={{ fontSize: '0.85rem' }}>
                                    {skiConditions.insights.slice(0, 3).map((insight, idx) => (
                                        <li key={idx} className="text-white-50">{insight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {skiConditions.recommendation && (
                            <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <small className="text-white-50">
                                    💡 <strong>Tip:</strong> {skiConditions.recommendation}
                                </small>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Modal.Body>
        </Modal >
    );
};

export default HourlyDetailModal;
