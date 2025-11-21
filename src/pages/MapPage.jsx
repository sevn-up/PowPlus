import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import MapComponent from '../components/MapComponent';
import { locations } from '../data/locationData';

/**
 * MapPage - Full-screen map for exploration and route planning
 */
const MapPage = ({ onLocationSelect }) => {
    return (
        <div className="vh-100 w-100">
            {/* Header */}
            <div className="bg-dark bg-opacity-75 text-white py-3 px-4 border-bottom border-secondary">
                <h4 className="mb-0">Exploration Map</h4>
                <small className="text-muted">Click markers for location details • Toggle layers for avalanche zones and terrain</small>
            </div>

            {/* Full-Screen Map */}
            <div style={{ height: 'calc(100vh - 70px)' }}>
                <MapComponent
                    centerCoords={[51.0, -120.0]}
                    areaGeoJson={null}
                    currentLocationName={null}
                    showAllLocations={true}
                    allLocations={locations}
                    highlightedLocations={[]}
                    onLocationClick={onLocationSelect}
                    onZoneClick={(feature) => console.log('Zone clicked:', feature)}
                />
            </div>
        </div>
    );
};

export default MapPage;
