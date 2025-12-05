import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import WeatherHeader from '../components/weather/WeatherHeader';

/**
 * Location Detail Page
 * Deep dive into a single location with extended data
 * Route: /location/:name
 */
const LocationDetail = () => {
    const { name } = useParams();
    const { setSelectedLocation } = useLocation();

    // Set the location from URL params
    React.useEffect(() => {
        if (name) {
            setSelectedLocation(name);
        }
    }, [name, setSelectedLocation]);

    return (
        <div className="flex-grow-1 overflow-auto p-4 p-md-5" style={{ height: '100vh' }}>
            <Container fluid="lg" className="mt-5 mt-md-0">
                <div className="text-center text-white mb-5">
                    <h1 className="display-4 fw-bold">Location Details: {name}</h1>
                    <p className="text-white-50">Extended forecast and historical data</p>
                </div>

                {/* Placeholder - Will be implemented in future */}
                <div className="glass-card p-5 text-center text-white">
                    <h3>🚧 Coming Soon</h3>
                    <p>
                        This page will feature:
                        <ul className="list-unstyled mt-3">
                            <li>📊 Historical weather charts</li>
                            <li>📈 Season statistics</li>
                            <li>📷 Webcam integration</li>
                            <li>⛷️ Trail status (for resorts)</li>
                            <li>💬 User reviews & trip reports</li>
                        </ul>
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default LocationDetail;
