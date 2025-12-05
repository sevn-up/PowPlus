import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { TrendingUp } from 'lucide-react';

/**
 * Powder Conditions Card Component
 * Displays powder score, 24hr snowfall, and snow quality metrics
 */
const PowderConditionsCard = ({ powderScore }) => {
    if (!powderScore) return null;

    return (
        <Card className="glass-card border-0 mb-4 text-white shadow-lg hover-scale transition-all">
            <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-3 text-white-50 text-uppercase fw-bold small">
                    <TrendingUp size={16} /> Powder Conditions
                </div>
                <Row className="g-3">
                    <Col xs={6}>
                        <div
                            className="text-center p-3 rounded-4"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="fs-2 fw-bold text-info">{powderScore.score}</div>
                            <small className="text-white d-block mb-2">Powder Score</small>
                            <Badge bg="info" className="bg-opacity-75 text-dark fw-bold">
                                {powderScore.rating}
                            </Badge>
                        </div>
                    </Col>
                    <Col xs={6}>
                        <div
                            className="text-center p-3 rounded-4"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="fs-2 fw-bold text-white">
                                {powderScore.snowfall24h}cm
                            </div>
                            <small className="text-white d-block mb-2">24hr Snowfall</small>
                            <small className="text-info fw-bold">
                                {powderScore.snowQuality.quality}
                            </small>
                        </div>
                    </Col>
                    <Col xs={12}>
                        <div
                            className="p-3 rounded-4"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="d-flex justify-content-between mb-2">
                                <small className="text-white">Snow Quality</small>
                                <small className="text-white fw-bold">
                                    {powderScore.snowQuality.score}/10
                                </small>
                            </div>
                            <div
                                className="progress"
                                style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <div
                                    className="progress-bar bg-info"
                                    style={{ width: `${powderScore.snowQuality.score * 10}%` }}
                                ></div>
                            </div>
                            <small className="text-white mt-2 d-block">
                                {powderScore.snowQuality.description}
                            </small>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default PowderConditionsCard;
