import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Waves } from 'lucide-react';

const TidesView = () => {
    return (
        <Container fluid className="p-4">
            <Card className="glass-card border-0 text-white shadow-lg">
                <Card.Body className="text-center py-5">
                    <Waves size={64} className="text-primary mb-3" />
                    <h2 className="mb-3">🌊 Tides & Ocean Conditions</h2>
                    <p className="text-white-50 mb-4">
                        Coming Soon: Tide predictions, solunar data, and coastal weather integration
                    </p>
                    <small className="text-white-50">
                        Future passion project - comprehensive coastal planning tools
                    </small>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TidesView;
