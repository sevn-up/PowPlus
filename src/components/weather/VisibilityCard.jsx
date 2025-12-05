import React from 'react';
import { Card } from 'react-bootstrap';
import { Eye, Wind } from 'lucide-react';

/**
 * VisibilityCard Component
 * Displays visibility conditions and rating
 */
const VisibilityCard = ({ weather }) => {
    if (!weather || !weather.hourly) return null;

    const visibility = weather.hourly.visibility?.[0] || 10000;
    const visibilityKm = (visibility / 1000).toFixed(1);

    // Get visibility rating
    const getVisibilityRating = (visibilityMeters) => {
        if (visibilityMeters >= 10000) return { text: 'Excellent', color: 'text-success' };
        if (visibilityMeters >= 5000) return { text: 'Good', color: 'text-info' };
        if (visibilityMeters >= 2000) return { text: 'Moderate', color: 'text-warning' };
        if (visibilityMeters >= 1000) return { text: 'Poor', color: 'text-danger' };
        return { text: 'Very Poor', color: 'text-danger' };
    };

    const rating = getVisibilityRating(visibility);

    return (
        <Card className="glass-card border-0 h-100 text-white shadow-lg hover-scale transition-all">
            <Card.Body className="d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                    <Eye size={16} /> Visibility
                </div>
                <div>
                    <div className="display-5 fw-bold mb-2 text-shadow-sm">
                        {visibilityKm} <span className="fs-4 fw-normal text-white-50">km</span>
                    </div>
                    <div className={`fw-bold ${rating.color}`}>{rating.text}</div>
                    <small className="text-white-50">Current visibility range</small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default VisibilityCard;
