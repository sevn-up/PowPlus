import React from 'react';
import { Alert } from 'react-bootstrap';
import { CloudSnow } from 'lucide-react';

/**
 * Powder Alert Banner Component
 * Shows powder day alert when significant snowfall occurs
 */
const PowderAlertBanner = ({ powderScore }) => {
    if (!powderScore || !powderScore.isPowderDay) {
        return null;
    }

    return (
        <Alert
            variant="info"
            className="glass-card border-0 shadow-lg d-flex align-items-center gap-3 mb-4 hover-scale transition-all"
        >
            <CloudSnow size={32} className="text-info" />
            <div className="flex-grow-1">
                <h5 className="mb-1 fw-bold text-white">🎿 Powder Alert!</h5>
                <p className="mb-0 text-white-50">
                    {powderScore.snowfall24h}cm of fresh snow in the last 24 hours. Powder
                    score: <strong className="text-info">{powderScore.score}/10</strong> (
                    {powderScore.rating})
                </p>
            </div>
        </Alert>
    );
};

export default PowderAlertBanner;
