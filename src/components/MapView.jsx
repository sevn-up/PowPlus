import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Map as MapIcon } from 'lucide-react';

const MapView = () => {
    return (
        <Container fluid className="p-4">
            <Card className="glass-card border-0 text-white shadow-lg">
                <Card.Body className="text-center py-5">
                    <MapIcon size={64} className="text-primary mb-3" />
                    <h2 className="mb-3">🗺️ Interactive Map</h2>
                    <p className="text-white-50 mb-4">
                        Coming Soon: Full-screen map with all locations, avalanche zones, and weather layers
                    </p>
                    <small className="text-white-50">
                        Expand MapCard to full-screen with layer controls
                    </small>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MapView;
