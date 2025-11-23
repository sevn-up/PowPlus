import React, { useEffect, useRef, useState } from 'react';
import { Card, Badge, Spinner, Form } from 'react-bootstrap';
import { MapPin, Layers, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';
import { getAvalancheForecastAreas, getAvalancheForecastProducts, parseDangerRating } from '../services/avalancheApi';
import { getDriveBCEvents, parseEventType, parseSeverity, getRoadNames } from '../services/mapApi';

// Fix for default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
const MapUpdater = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
};

// Create custom icon for road events
const createEventIcon = (eventType) => {
    const typeInfo = parseEventType(eventType);

    return L.divIcon({
        className: 'custom-event-marker',
        html: `
            <div style="
                background-color: ${typeInfo.color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
                ${typeInfo.icon}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
};

const MapCard = ({ location, coordinates, avalancheForecast }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [avalancheAreas, setAvalancheAreas] = useState(null);
    const [avalancheProducts, setAvalancheProducts] = useState(null);
    const [showAvalancheLayer, setShowAvalancheLayer] = useState(true);
    const [driveBCEvents, setDriveBCEvents] = useState([]);
    const [showRoadEventsLayer, setShowRoadEventsLayer] = useState(true);
    const mapRef = useRef(null);

    // Default to Whistler if no coordinates provided
    const center = coordinates
        ? [coordinates.lat, coordinates.lon]
        : [50.1163, -122.9574];

    const locationName = location?.displayName || location?.name || 'Current Location';

    // Fetch avalanche forecast areas
    useEffect(() => {
        const fetchAvalancheData = async () => {
            try {
                const [areas, products] = await Promise.all([
                    getAvalancheForecastAreas(),
                    getAvalancheForecastProducts()
                ]);
                setAvalancheAreas(areas);
                setAvalancheProducts(products);
            } catch (error) {
                console.error('Failed to fetch avalanche data:', error);
            }
        };

        fetchAvalancheData();
    }, []);

    // Fetch DriveBC road events
    useEffect(() => {
        const fetchRoadEvents = async () => {
            try {
                // Fetch events within BC region (approximate bounds)
                const bounds = {
                    north: 60,
                    south: 48,
                    east: -114,
                    west: -139
                };
                const events = await getDriveBCEvents(bounds);
                setDriveBCEvents(events);
            } catch (error) {
                console.error('Failed to fetch DriveBC events:', error);
            }
        };

        fetchRoadEvents();
        // Refresh events every 5 minutes
        const interval = setInterval(fetchRoadEvents, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Simulate loading time for map tiles
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Get danger rating for an area
    const getDangerRatingForArea = (areaId) => {
        if (!avalancheProducts) return null;

        const product = avalancheProducts.find(p => p.area?.id === areaId);
        if (!product || !product.report?.dangerRatings?.[0]) return null;

        // Get alpine rating as the primary indicator
        const alpineRating = product.report.dangerRatings[0].ratings?.alp?.rating?.value;
        return parseDangerRating(alpineRating);
    };

    // Style function for avalanche polygons
    const avalancheStyle = (feature) => {
        const areaId = feature.id;
        const rating = getDangerRatingForArea(areaId);

        return {
            fillColor: rating?.color || '#9E9E9E',
            weight: 2,
            opacity: 0.8,
            color: 'white',
            fillOpacity: 0.3
        };
    };

    // Popup content for avalanche areas
    const onEachAvalancheFeature = (feature, layer) => {
        const areaId = feature.id;
        const areaName = feature.properties?.name || 'Unknown Area';
        const rating = getDangerRatingForArea(areaId);

        if (rating) {
            const popupContent = `
                <div style="min-width: 200px;">
                    <strong style="font-size: 14px;">${areaName}</strong><br/>
                    <div style="margin-top: 8px; padding: 8px; background-color: ${rating.color}; color: ${rating.textColor}; border-radius: 4px; text-align: center;">
                        <strong>Alpine: ${rating.display}</strong>
                    </div>
                    <small style="color: #666; margin-top: 4px; display: block;">Click avalanche card for full details</small>
                </div>
            `;
            layer.bindPopup(popupContent);
        }

        // Highlight on hover
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    fillOpacity: 0.5
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 2,
                    fillOpacity: 0.3
                });
            }
        });
    };

    return (
        <Card className="glass-card border-0 text-white shadow-lg hover-scale transition-all">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                        <MapPin size={16} /> Interactive Map
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Check
                            type="switch"
                            id="avalanche-layer-toggle"
                            label={
                                <span className="d-flex align-items-center gap-1 small text-white">
                                    <AlertTriangle size={12} />
                                    Avalanche
                                </span>
                            }
                            checked={showAvalancheLayer}
                            onChange={(e) => setShowAvalancheLayer(e.target.checked)}
                            className="text-white"
                        />
                        <Form.Check
                            type="switch"
                            id="road-events-layer-toggle"
                            label={
                                <span className="d-flex align-items-center gap-1 small text-white">
                                    🚧 Roads
                                </span>
                            }
                            checked={showRoadEventsLayer}
                            onChange={(e) => setShowRoadEventsLayer(e.target.checked)}
                            className="text-white"
                        />
                        <Badge bg="secondary" className="d-flex align-items-center gap-1">
                            <Layers size={12} />
                            OpenStreetMap
                        </Badge>
                    </div>
                </div>

                <div className="map-container rounded-4 overflow-hidden position-relative" style={{ height: '400px' }}>
                    {isLoading && (
                        <div className="position-absolute top-50 start-50 translate-middle z-3">
                            <Spinner animation="border" variant="light" />
                        </div>
                    )}

                    <MapContainer
                        center={center}
                        zoom={10}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Avalanche forecast areas */}
                        {showAvalancheLayer && avalancheAreas && (
                            <GeoJSON
                                data={avalancheAreas}
                                style={avalancheStyle}
                                onEachFeature={onEachAvalancheFeature}
                            />
                        )}

                        {/* DriveBC road events */}
                        {showRoadEventsLayer && driveBCEvents.map((event, idx) => {
                            // Only show events with valid coordinates
                            if (!event.geography || !event.geography.coordinates) return null;

                            const [lon, lat] = event.geography.coordinates;
                            const eventType = event.event_type || 'INCIDENT';
                            const typeInfo = parseEventType(eventType);
                            const severityInfo = parseSeverity(event.severity);
                            const roadNames = getRoadNames(event);

                            return (
                                <Marker
                                    key={`event-${idx}`}
                                    position={[lat, lon]}
                                    icon={createEventIcon(eventType)}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}>
                                                <span style={{ fontSize: '20px' }}>{typeInfo.icon}</span>
                                                <strong style={{ color: '#333' }}>{typeInfo.label}</strong>
                                            </div>

                                            <div style={{
                                                padding: '6px 10px',
                                                backgroundColor: severityInfo.color,
                                                color: 'white',
                                                borderRadius: '4px',
                                                marginBottom: '8px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {severityInfo.label} Severity
                                            </div>

                                            <div style={{ marginBottom: '8px' }}>
                                                <strong style={{ color: '#666', fontSize: '12px' }}>Road:</strong>
                                                <div style={{ color: '#333' }}>{roadNames}</div>
                                            </div>

                                            {event.headline && (
                                                <div style={{
                                                    color: '#555',
                                                    fontSize: '13px',
                                                    borderTop: '1px solid #eee',
                                                    paddingTop: '8px',
                                                    marginTop: '8px'
                                                }}>
                                                    {event.headline}
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* Current location marker */}
                        <Marker position={center}>
                            <Popup>
                                <div className="text-dark">
                                    <strong>{locationName}</strong>
                                    <br />
                                    <small>
                                        {coordinates?.lat.toFixed(4)}, {coordinates?.lon.toFixed(4)}
                                    </small>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Map updater component */}
                        <MapUpdater center={center} />
                    </MapContainer>
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <small className="text-white-50">
                        Drag to pan • Scroll to zoom • Click areas for details
                    </small>
                    <small className="text-white-50">
                        Lat: {center[0].toFixed(4)}, Lon: {center[1].toFixed(4)}
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default MapCard;
