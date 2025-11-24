import React from 'react';
import { Modal, Button, Badge, Card } from 'react-bootstrap';
import { AlertTriangle, Clock, MapPin, Calendar, ExternalLink, Construction, Info, Snowflake, Camera } from 'lucide-react';
import { parseEventType, parseSeverity } from '../services/mapApi';

const RoadEventModal = ({ show, onHide, event }) => {
    if (!event) return null;

    const typeInfo = parseEventType(event.event_type, event.description);
    const severityInfo = parseSeverity(event.severity);

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Construct public URL
    // API ID format: "drivebc.ca/DBC-76914" -> Public URL needs "DBC-76914"
    const getPublicUrl = () => {
        if (!event.id) return 'https://www.drivebc.ca/';
        const idParts = event.id.split('/');
        const eventId = idParts[idParts.length - 1];
        return `https://www.drivebc.ca/mobile/pub/events/id/${eventId}.html`;
    };

    // Extract Next Update time from description
    const getNextUpdate = (desc) => {
        if (!desc) return null;
        const match = desc.match(/Next update time (.*?)\./);
        return match ? match[1] : null;
    };

    const nextUpdate = getNextUpdate(event.description);

    return (
        <Modal show={show} onHide={onHide} size="xl" centered className="road-event-modal">
            <Modal.Header closeButton className="bg-dark text-white border-0">
                <Modal.Title className="d-flex align-items-center gap-3 w-100">
                    <span style={{ fontSize: '28px' }}>{typeInfo.icon}</span>
                    <div className="flex-grow-1">
                        <div className="fw-bold" style={{ fontSize: '20px' }}>{typeInfo.label}</div>
                        <small
                            className="fw-semibold"
                            style={{
                                fontSize: '12px',
                                color: typeInfo.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                            }}
                        >
                            {typeInfo.category || event.event_type}
                        </small>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-dark text-white">
                {/* Severity Badge */}
                <div className="mb-4">
                    <div
                        className="d-inline-block px-3 py-2 rounded fw-bold"
                        style={{
                            backgroundColor: severityInfo.color,
                            color: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {severityInfo.label} Severity
                    </div>
                </div>

                {/* Description */}
                <Card className="bg-white bg-opacity-10 border-0 mb-4">
                    <Card.Body>
                        <h6 className="text-white-50 mb-2 d-flex align-items-center gap-2">
                            <Info size={16} /> Description
                        </h6>
                        <p className="mb-0" style={{ lineHeight: '1.6' }}>
                            {event.description}
                        </p>
                    </Card.Body>
                </Card>

                {/* Location Details */}
                {event.roads && event.roads.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-white-50 mb-2 d-flex align-items-center gap-2">
                            <MapPin size={16} /> Location
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                            {event.roads.map((road, idx) => (
                                <Badge key={idx} bg="secondary" className="p-2">
                                    {road.name} {road.direction ? `(${road.direction})` : ''}
                                    {road.from ? ` • ${road.from}` : ''}
                                    {road.to ? ` → ${road.to}` : ''}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule / Timing */}
                <div className="row g-3">
                    <div className="col-md-6">
                        <Card className="bg-transparent border-secondary h-100">
                            <Card.Body className="py-3">
                                <small className="text-white-50 d-block mb-1">Last Updated</small>
                                <div className="d-flex align-items-center gap-2">
                                    <Clock size={16} className="text-info" />
                                    <strong>{formatDate(event.updated)}</strong>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    {nextUpdate && (
                        <div className="col-md-6">
                            <Card className="bg-transparent border-secondary h-100">
                                <Card.Body className="py-3">
                                    <small className="text-white-50 d-block mb-1">Next Update</small>
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={16} className="text-warning" />
                                        <strong>{nextUpdate}</strong>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Webcam Section - Placeholder for Future Integration */}
                <Card className="bg-white bg-opacity-10 border-0 mb-4">
                    <Card.Body>
                        <h6 className="text-white-50 mb-3 d-flex align-items-center gap-2">
                            <Camera size={16} /> Live Webcam
                            <Badge bg="warning" className="ms-2" style={{ fontSize: '9px' }}>COMING SOON</Badge>
                        </h6>
                        <div
                            className="bg-dark border border-secondary rounded d-flex align-items-center justify-content-center"
                            style={{ height: '200px' }}
                        >
                            <div className="text-center text-white-50">
                                <Camera size={48} className="mb-2 opacity-50" />
                                <div className="small">Webcam feed will display here</div>
                                <div className="text-white-50" style={{ fontSize: '11px' }}>
                                    Showing nearest DriveBC webcam to advisory location
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

            </Modal.Body>

            <Modal.Footer className="bg-dark border-0">
                <Button
                    variant="outline-light"
                    href={getPublicUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLink size={16} className="me-2" />
                    View on DriveBC
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoadEventModal;
