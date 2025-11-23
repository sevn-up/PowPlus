import React from 'react';
import { Modal, Button, Badge, Card } from 'react-bootstrap';
import { AlertTriangle, Clock, MapPin, Calendar, ExternalLink, Construction, Info, Snowflake } from 'lucide-react';
import { parseEventType, parseSeverity } from '../services/mapApi';

const RoadEventModal = ({ show, onHide, event }) => {
    if (!event) return null;

    const typeInfo = parseEventType(event.event_type);
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="road-event-modal">
            <Modal.Header closeButton className="bg-dark text-white border-0">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
                    <div>
                        <div className="fw-bold">{typeInfo.label}</div>
                        <small className="text-white-50" style={{ fontSize: '14px' }}>{event.headline}</small>
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
                    {event.created && (
                        <div className="col-md-6">
                            <Card className="bg-transparent border-secondary h-100">
                                <Card.Body className="py-3">
                                    <small className="text-white-50 d-block mb-1">Created</small>
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={16} className="text-info" />
                                        <strong>{formatDate(event.created)}</strong>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </div>

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
