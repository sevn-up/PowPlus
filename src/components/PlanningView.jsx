import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Route as RouteIcon } from 'lucide-react';

const PlanningView = () => {
    return (
        <Container fluid className="p-4">
            <Card className="glass-card border-0 text-white shadow-lg">
                <Card.Body className="text-center py-5">
                    <RouteIcon size={64} className="text-primary mb-3" />
                    <h2 className="mb-3">📋 Trip Planning & Route Charting</h2>
                    <p className="text-white-50 mb-4">
                        Coming Soon: Route planning, trip comparison, and decision aids
                    </p>
                    <small className="text-white-50">
                        Focus: Route charting for backcountry tours and ski traverses
                    </small>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PlanningView;
