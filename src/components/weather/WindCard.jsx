import React from 'react';
import { Card } from 'react-bootstrap';
import { Wind } from 'lucide-react';

/**
 * WindCard Component
 * Displays wind speed, gusts, and direction
 */
const WindCard = ({ weather }) => {
    if (!weather || !weather.current) return null;

    const windSpeed = Math.round(weather.current.wind_speed_10m);
    const windGusts = Math.round(weather.current.wind_gusts_10m);
    const windDirection = weather.current.wind_direction_10m;

    // Get wind direction name
    const getWindDirectionName = (degrees) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    // Get wind intensity color
    const getWindColor = (speed) => {
        if (speed >= 40) return 'text-danger';
        if (speed >= 25) return 'text-warning';
        if (speed >= 15) return 'text-info';
        return 'text-success';
    };

    const directionName = getWindDirectionName(windDirection);
    const colorClass = getWindColor(windSpeed);

    return (
        <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
            <Card.Body className="d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                    <Wind size={16} /> Wind Conditions
                </div>
                <div>
                    <div className={`display-5 fw-bold mb-2 text-shadow-sm ${colorClass}`}>
                        {windSpeed} <span className="fs-4 fw-normal text-white-50">km/h</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="text-white-50 small">Direction</div>
                            <div className="fw-bold">{directionName} ({windDirection}°)</div>
                        </div>
                        {windGusts > windSpeed && (
                            <div className="text-end">
                                <div className="text-white-50 small">Gusts</div>
                                <div className="fw-bold text-warning">{windGusts} km/h</div>
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default WindCard;
