import React from 'react';
import { Modal, Button, Badge, Row, Col, Card } from 'react-bootstrap';
import { AlertTriangle, Calendar, ExternalLink, Mountain, Wind, Compass, MapPin } from 'lucide-react';
import { parseDangerRating, formatHighlights } from '../services/avalancheApi';

const AvalancheDetailModal = ({ show, onHide, forecast, location }) => {
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

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="xl"
            className="avalanche-modal"
            centered
            contentClassName="glass-card border-0 text-white"
            style={{ backdropFilter: 'blur(5px)' }}
        >
            <Modal.Header
                closeButton
                closeVariant="white"
                className="border-bottom border-secondary bg-transparent"
            >
                <div>
                    <Modal.Title className="d-flex align-items-center gap-2 text-info fw-bold">
                        <AlertTriangle size={24} className="text-warning" />
                        Avalanche Forecast
                    </Modal.Title>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <Badge bg="secondary" className="d-flex align-items-center gap-1">
                            <MapPin size={12} />
                            {location?.displayName || location?.name || 'Selected Location'}
                        </Badge>
                        <span className="text-white-50 small">•</span>
                        <small className="text-white-50">{report.title}</small>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="bg-transparent">
                {/* Forecast Info */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <small className="text-info fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                FORECASTER: {report.forecaster && report.forecaster.length < 100 ? report.forecaster : 'Avalanche Canada'}
                            </small>
                        </div>
                        <div className="d-flex gap-2">
                            <Badge bg="info" className="text-dark fw-bold">
                                <Calendar size={14} className="me-1" />
                                Valid until {formatDate(report.validUntil)}
                            </Badge>
                            {report.confidence && (
                                <Badge bg="secondary" className="border border-secondary">
                                    Confidence: {report.confidence.rating.display}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Highlights */}
                    {report.highlights && (
                        <div className="p-4 rounded-4 position-relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.05))',
                                border: '1px solid rgba(255, 193, 7, 0.3)'
                            }}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="p-2 rounded-circle bg-warning bg-opacity-25 flex-shrink-0">
                                    <AlertTriangle size={24} className="text-warning" />
                                </div>
                                <div>
                                    <h6 className="text-warning fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Key Message</h6>
                                    <p className="mb-0 text-white" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>{formatHighlights(report.highlights)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3-Day Danger Ratings */}
                <div className="mb-4">
                    <h5 className="mb-3 d-flex align-items-center gap-2 text-info fw-bold">
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
                                    <Card className="h-100 bg-transparent border-secondary">
                                        <Card.Header className="text-center py-2 border-secondary bg-white bg-opacity-10">
                                            <strong className="text-white">{dayRating.date.display}</strong>
                                        </Card.Header>
                                        <Card.Body className="bg-dark bg-opacity-50">
                                            <div className="d-flex flex-column gap-2">
                                                {/* Alpine */}
                                                <div
                                                    className="p-2 rounded d-flex justify-content-between align-items-center"
                                                    style={{ backgroundColor: alpineRating.color, color: alpineRating.textColor }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>🏔️</span>
                                                        <span className="fw-bold small text-uppercase">Alpine</span>
                                                    </div>
                                                    <span className="fw-bold">{alpineRating.display}</span>
                                                </div>

                                                {/* Treeline */}
                                                <div
                                                    className="p-2 rounded d-flex justify-content-between align-items-center"
                                                    style={{ backgroundColor: treelineRating.color, color: treelineRating.textColor }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>⛰️</span>
                                                        <span className="fw-bold small text-uppercase">Treeline</span>
                                                    </div>
                                                    <span className="fw-bold">{treelineRating.display}</span>
                                                </div>

                                                {/* Below Treeline */}
                                                <div
                                                    className="p-2 rounded d-flex justify-content-between align-items-center"
                                                    style={{ backgroundColor: belowTreelineRating.color, color: belowTreelineRating.textColor }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>🌲</span>
                                                        <span className="fw-bold small text-uppercase">Below TL</span>
                                                    </div>
                                                    <span className="fw-bold">{belowTreelineRating.display}</span>
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
                        <h5 className="mb-3 d-flex align-items-center gap-2 text-info fw-bold">
                            <Wind size={20} />
                            Avalanche Problems
                        </h5>
                        <Row className="g-3">
                            {problems.map((problem, idx) => {
                                // Get color for problem type
                                const problemColors = {
                                    'storm-slab': '#FF9800',
                                    'wind-slab': '#FFC107',
                                    'persistent-slab': '#F44336',
                                    'deep-persistent-slab': '#D32F2F',
                                    'wet-snow': '#2196F3',
                                    'cornice': '#9C27B0',
                                    'loose-dry': '#FFEB3B',
                                    'loose-wet': '#03A9F4'
                                };
                                const problemColor = problemColors[problem.type?.value] || '#FF9800';

                                return (
                                    <Col md={6} key={idx}>
                                        <Card className="h-100 bg-dark bg-opacity-50 border-secondary text-white">
                                            <Card.Body className="position-relative overflow-hidden">
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        bottom: 0,
                                                        width: '4px',
                                                        backgroundColor: problemColor
                                                    }}
                                                />
                                                <div className="ps-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="mb-0 fw-bold" style={{ color: problemColor }}>{problem.type.display}</h6>
                                                        {problem.data?.likelihood && (
                                                            <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '0.65rem' }}>{problem.data.likelihood.display}</Badge>
                                                        )}
                                                    </div>

                                                    {problem.comment && (
                                                        <p className="small text-white-50 mb-3">{formatHighlights(problem.comment)}</p>
                                                    )}

                                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                                        {problem.data?.elevations && problem.data.elevations.map((elev, i) => (
                                                            <Badge key={`elev-${i}`} bg="dark" className="border border-secondary text-secondary">
                                                                {elev.display}
                                                            </Badge>
                                                        ))}
                                                        {problem.data?.aspects && problem.data.aspects.map((aspect, i) => (
                                                            <Badge key={`asp-${i}`} bg="dark" className="border border-secondary text-secondary">
                                                                <Compass size={10} className="me-1" />
                                                                {aspect.display}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {problem.data?.expectedSize && (
                                                        <div className="small border-top border-secondary pt-2 mt-2">
                                                            <span className="text-white-50 me-2">Expected Size:</span>
                                                            <span className="text-warning fw-bold">
                                                                {problem.data.expectedSize.min} - {problem.data.expectedSize.max}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                )}

                {/* Travel Advice */}
                {travelAdvice.length > 0 && (
                    <div className="mb-3">
                        <h5 className="mb-3 border-bottom border-secondary pb-2 text-info fw-bold">Travel & Terrain Advice</h5>
                        <ul className="list-unstyled">
                            {travelAdvice.map((advice, idx) => (
                                <li key={idx} className="mb-3 d-flex align-items-start text-white">
                                    <span className="text-info me-2 mt-1">•</span>
                                    <span style={{ lineHeight: '1.5' }}>{advice}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="border-top border-secondary bg-transparent">
                <Button variant="outline-secondary" onClick={onHide}>
                    Close
                </Button>
                <Button
                    variant="info"
                    href={forecast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fw-bold text-dark"
                >
                    <ExternalLink size={16} className="me-2" />
                    View Full Report
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AvalancheDetailModal;
