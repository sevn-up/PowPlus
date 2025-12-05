import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import { parseDangerRating, formatHighlights } from '../../services/avalancheApi';

/**
 * Avalanche Safety Card Component
 * Displays avalanche danger ratings and forecast summary
 */
const AvalancheSafetyCard = ({ avalancheForecast, locationHasZone, onShowDetails }) => {
    if (!avalancheForecast || !avalancheForecast.report || !locationHasZone) {
        return null;
    }

    return (
        <Card
            className="glass-card border-0 mb-4 text-white shadow-lg hover-scale transition-all"
            style={{ cursor: 'pointer' }}
            onClick={onShowDetails}
        >
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                        <AlertTriangle size={16} /> Avalanche Forecast
                    </div>
                    {avalancheForecast.area?.name &&
                        !avalancheForecast.area.name.match(/^[0-9a-f]{64}$/) && (
                            <Badge bg="secondary">{avalancheForecast.area.name}</Badge>
                        )}
                </div>

                {avalancheForecast.report.dangerRatings &&
                    avalancheForecast.report.dangerRatings[0] && (
                        <div className="mb-3">
                            <Row className="g-2">
                                {['alp', 'tln', 'btl'].map((elevation) => {
                                    const rating =
                                        avalancheForecast.report.dangerRatings[0].ratings[elevation];
                                    const ratingInfo = parseDangerRating(rating?.rating?.value);
                                    return (
                                        <Col xs={4} key={elevation}>
                                            <div
                                                className="p-2 rounded text-center"
                                                style={{
                                                    backgroundColor: ratingInfo.color,
                                                    color: ratingInfo.textColor,
                                                }}
                                            >
                                                <small className="d-block" style={{ fontSize: '0.7rem' }}>
                                                    {rating?.display || elevation.toUpperCase()}
                                                </small>
                                                <strong style={{ fontSize: '0.8rem' }}>
                                                    {ratingInfo.level}
                                                </strong>
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
                            {formatHighlights(avalancheForecast.report.highlights).substring(
                                0,
                                150
                            )}
                            ...
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
    );
};

export default AvalancheSafetyCard;
