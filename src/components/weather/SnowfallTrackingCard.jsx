import React from 'react';
import { Card } from 'react-bootstrap';
import { Snowflake, Calendar } from 'lucide-react';

/**
 * Calculate days until next snowfall and predicted amount
 * @param {Object} weather - Weather data object
 * @returns {Object} { daysUntil, amount }
 */
const calculateNextSnowfall = (weather) => {
    const now = new Date();
    const currentHourIndex = weather.hourly.time.findIndex(
        (t) => new Date(t) >= now
    );

    let daysUntilSnow = null;
    let nextSnowAmount = 0;

    for (let i = currentHourIndex; i < weather.hourly.snowfall.length; i++) {
        if (weather.hourly.snowfall[i] > 0) {
            if (daysUntilSnow === null) {
                daysUntilSnow = Math.floor((i - currentHourIndex) / 24);
            }
            const dayStart = currentHourIndex + daysUntilSnow * 24;
            const dayEnd = Math.min(dayStart + 24, weather.hourly.snowfall.length);
            for (let j = dayStart; j < dayEnd; j++) {
                nextSnowAmount += weather.hourly.snowfall[j];
            }
            break;
        }
    }

    return { daysUntil: daysUntilSnow, amount: nextSnowAmount };
};

/**
 * Calculate days since last snowfall and amount
 * @param {Object} weather - Weather data object
 * @returns {Object} { daysSince, amount }
 */
const calculateLastSnowfall = (weather) => {
    const now = new Date();
    const currentHourIndex = weather.hourly.time.findIndex(
        (t) => new Date(t) >= now
    );

    let daysSinceSnow = null;
    let lastSnowAmount = 0;

    for (let i = currentHourIndex - 1; i >= 0; i--) {
        if (weather.hourly.snowfall[i] > 0) {
            const hoursSince = currentHourIndex - i;
            daysSinceSnow = Math.floor(hoursSince / 24);

            const snowDayEnd = i;
            let snowDayStart = i;
            while (snowDayStart > 0 && i - snowDayStart < 24) {
                if (weather.hourly.snowfall[snowDayStart - 1] > 0) {
                    snowDayStart--;
                } else {
                    break;
                }
            }
            for (let j = snowDayStart; j <= snowDayEnd; j++) {
                lastSnowAmount += weather.hourly.snowfall[j];
            }
            break;
        }
    }

    return { daysSince: daysSinceSnow, amount: lastSnowAmount };
};

/**
 * Snowfall Tracking Card Component
 * Shows days until next snow and days since last snow
 */
const SnowfallTrackingCard = ({ weather }) => {
    if (!weather) return null;

    const nextSnow = calculateNextSnowfall(weather);
    const lastSnow = calculateLastSnowfall(weather);

    return (
        <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
            <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-4 text-white-50 text-uppercase fw-bold small">
                    <Snowflake size={16} /> Snowfall Tracking
                </div>
                <div className="d-flex flex-column gap-3">
                    {/* Days Until Next Snowfall */}
                    <div
                        className="d-flex align-items-center justify-content-between p-3 rounded-4"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                        <div className="d-flex flex-column flex-grow-1">
                            <small className="text-white-50 mb-1">Days Until Next Snowfall</small>
                            <div className="d-flex align-items-center gap-2">
                                <Snowflake size={20} className="text-info" />
                                <span className="fs-3 fw-bold text-white">
                                    {nextSnow.daysUntil !== null ? nextSnow.daysUntil : '7+'}
                                </span>
                                <span className="text-white-50">
                                    {nextSnow.daysUntil === 0
                                        ? 'Today!'
                                        : nextSnow.daysUntil === 1
                                            ? 'day'
                                            : 'days'}
                                </span>
                            </div>
                        </div>
                        {nextSnow.amount > 0 && (
                            <div className="text-end">
                                <small className="text-white-50 d-block mb-1">Predicted</small>
                                <div className="badge bg-info bg-opacity-25 text-info fs-6 px-3 py-2">
                                    {nextSnow.amount.toFixed(1)} cm
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Days Since Last Snowfall */}
                    <div
                        className="d-flex align-items-center justify-content-between p-3 rounded-4"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                        <div className="d-flex flex-column flex-grow-1">
                            <small className="text-white-50 mb-1">Since Last Snowfall</small>
                            <div className="d-flex align-items-center gap-2">
                                <Calendar size={20} className="text-white-50" />
                                <span className="fs-3 fw-bold text-white">
                                    {lastSnow.daysSince !== null ? lastSnow.daysSince : '7+'}
                                </span>
                                <span className="text-white-50">
                                    {lastSnow.daysSince === 0
                                        ? 'Today'
                                        : lastSnow.daysSince === 1
                                            ? 'day ago'
                                            : 'days ago'}
                                </span>
                            </div>
                        </div>
                        {lastSnow.amount > 0 && (
                            <div className="text-end">
                                <small className="text-white-50 d-block mb-1">Amount</small>
                                <div className="badge bg-info bg-opacity-25 text-info fs-6 px-3 py-2">
                                    {lastSnow.amount.toFixed(1)} cm
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SnowfallTrackingCard;
