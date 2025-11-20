import React from 'react';
import { Modal, Button, Badge, Row, Col, Card } from 'react-bootstrap';
import { AlertTriangle, Calendar, ExternalLink, Mountain, Wind, Compass } from 'lucide-react';
import { parseDangerRating, formatHighlights } from '../services/avalancheApi';

const AvalancheDetailModal = ({ show, onHide, forecast }) => {
    if (!forecast || !forecast.report) return null;

    const { report } = forecast;
    const dangerRatings = report.dangerRatings || [];
    const problems = report.problems || [];
    const travelAdvice = report.terrainAndTravelAdvice || [];

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Helper to sanitize title - if it contains many hyphens or is too long, it's likely concatenated area names
    const getDisplayTitle = (title) => {
        if (!title) return 'Avalanche Forecast';
        // Count hyphens - if more than 3, it's likely a concatenated list
        const hyphenCount = (title.match(/-/g) || []).length;
        if (hyphenCount > 3 || title.length > 50) {
            return 'Avalanche Forecast';
        }
        return title;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" className="avalanche-modal">
            <Modal.Header closeButton className="bg-dark text-white border-0">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <AlertTriangle size={24} className="text-warning" />
                    {getDisplayTitle(report.title)}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-dark text-white">
                {/* Forecast Info */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <small className="text-white-50">
                                Forecaster: {report.forecaster && report.forecaster.length < 100 ? report.forecaster : 'Avalanche Canada'}
                            </small>
                        </div>
                        <div className="d-flex gap-2">
                            <Badge bg="secondary">
                                <Calendar size={14} className="me-1" />
                                Valid until {formatDate(report.validUntil)}
                            </Badge>
                            {report.confidence && (
                                <Badge bg="info">
                                    Confidence: {report.confidence.rating.display}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Highlights */}
                    {report.highlights && (
                        <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #FFC107' }}>
                            <strong className="text-warning">Key Message:</strong>
                            <p className="mb-0 mt-2">{formatHighlights(report.highlights)}</p>
                        </div>
                    )}
                </div>

                {/* 3-Day Danger Ratings */}
                <div className="mb-4">
                    <h5 className="mb-3 d-flex align-items-center gap-2">
                        <Mountain size={20} />
                        Danger Ratings
                    </h5>
                    <Row className="g-3">
                        {dangerRatings.slice(0, 3).map((dayRating, idx) => {
                            const alpineRating = parseDangerRating(dayRating.ratings.alp?.rating?.value);
                            const treelineRating = parseDangerRating(dayRating.ratings.tln?.rating?.value);
                            const belowTreelineRating = parseDangerRating(dayRating.ratings.btl?.rating?.value);

                            return (
                                <Col md={4} key={idx}>
                                    <Card className="bg-transparent border-secondary h-100">
                                        <Card.Body>
                                            <div className="text-center mb-3">
                                                <strong>{dayRating.date.display}</strong>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                <div
                                                    className="p-2 rounded text-center"
                                                    style={{
                                                        backgroundColor: alpineRating.color,
                                                        color: alpineRating.textColor
                                                    }}
                                                >
                                                    <small className="d-block">Alpine</small>
                                                    <strong>{alpineRating.display}</strong>
                                                </div>
                                                <div
                                                    className="p-2 rounded text-center"
                                                    style={{
                                                        backgroundColor: treelineRating.color,
                                                        color: treelineRating.textColor
                                                    }}
                                                >
                                                    <small className="d-block">Treeline</small>
                                                    <strong>{treelineRating.display}</strong>
                                                </div>
                                                <div
                                                    className="p-2 rounded text-center"
                                                    style={{
                                                        backgroundColor: belowTreelineRating.color,
                                                        color: belowTreelineRating.textColor
                                                    }}
                                                >
                                                    <small className="d-block">Below Treeline</small>
                                                    <strong>{belowTreelineRating.display}</strong>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </div>

                {/* Avalanche Problems */}
                {problems.length > 0 && (
                    <div className="mb-4">
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                            <Wind size={20} />
                            Avalanche Problems
                        </h5>
                        {problems.map((problem, idx) => (
                            <Card key={idx} className="bg-transparent border-secondary mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h6 className="text-warning mb-0">{problem.type.display}</h6>
                                        {problem.data?.likelihood && (
                                            <Badge bg="secondary">{problem.data.likelihood.display}</Badge>
                                        )}
                                    </div>

                                    {problem.comment && (
                                        <p className="mb-3">{formatHighlights(problem.comment)}</p>
                                    )}

                                    <Row className="g-2">
                                        {problem.data?.elevations && (
                                            <Col xs={6}>
                                                <small className="text-white-50 d-block">Elevations:</small>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {problem.data.elevations.map((elev, i) => (
                                                        <Badge key={i} bg="dark" className="border border-secondary">
                                                            {elev.display}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </Col>
                                        )}
                                        {problem.data?.aspects && (
                                            <Col xs={6}>
                                                <small className="text-white-50 d-block">Aspects:</small>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {problem.data.aspects.map((aspect, i) => (
                                                        <Badge key={i} bg="dark" className="border border-secondary">
                                                            <Compass size={12} className="me-1" />
                                                            {aspect.display}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </Col>
                                        )}
                                    </Row>

                                    {problem.data?.expectedSize && (
                                        <div className="mt-2">
                                            <small className="text-white-50">Expected Size: </small>
                                            <Badge bg="warning" text="dark">
                                                {problem.data.expectedSize.min} - {problem.data.expectedSize.max}
                                            </Badge>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Travel Advice */}
                {travelAdvice.length > 0 && (
                    <div className="mb-3">
                        <h5 className="mb-3">Travel & Terrain Advice</h5>
                        <ul className="list-unstyled">
                            {travelAdvice.map((advice, idx) => (
                                <li key={idx} className="mb-2 d-flex align-items-start">
                                    <span className="text-info me-2">•</span>
                                    <span>{advice}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-dark border-0">
                <Button
                    variant="outline-light"
                    href={forecast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLink size={16} className="me-2" />
                    View on Avalanche.ca
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AvalancheDetailModal;
