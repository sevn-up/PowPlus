import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, Badge, Spinner, Form } from 'react-bootstrap';
import { MapPin, Layers, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';
import { getAvalancheForecastAreas, getAvalancheForecastProducts, parseDangerRating } from '../services/avalancheApi';
import { getDriveBCEvents, parseEventType, parseSeverity, getRoadNames, prioritizeEvents } from '../services/mapApi';

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

// Create custom icon for road events - Moved outside component to prevent recreation
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

// Icon cache to prevent recreation - MEMORY LEAK FIX
const eventIconCache = new Map();

const getEventIcon = (eventType) => {
    if (!eventIconCache.has(eventType)) {
        eventIconCache.set(eventType, createEventIcon(eventType));
    }
    return eventIconCache.get(eventType);
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
    const center = useMemo(() => coordinates
        ? [coordinates.lat, coordinates.lon]
        : [50.1163, -122.9574], [coordinates]);

    const locationName = location?.displayName || location?.name || 'Current Location';

    // Fetch avalanche forecast areas
    useEffect(() => {
        let isMounted = true;
        const fetchAvalancheData = async () => {
            try {
                const [areas, products] = await Promise.all([
                    getAvalancheForecastAreas(),
                    getAvalancheForecastProducts()
                ]);
                if (isMounted) {
                    setAvalancheAreas(areas);
                    setAvalancheProducts(products);
                }
            } catch (error) {
                console.error('Failed to fetch avalanche data:', error);
            }
        };

        fetchAvalancheData();
        return () => { isMounted = false; };
    }, []);

    // Fetch DriveBC road events - MEMORY LEAK FIX: Reduced frequency and event count
    useEffect(() => {
        let isMounted = true;
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
                if (isMounted) {
                    // Prioritize and limit to 50 most severe events to reduce memory usage
                    const prioritized = prioritizeEvents(events, 50);
                    setDriveBCEvents(prioritized);
                }
            } catch (error) {
                console.error('Failed to fetch DriveBC events:', error);
            }
        };

        fetchRoadEvents();
        // Refresh events every 10 minutes (reduced from 5 to minimize memory churn)
        const interval = setInterval(fetchRoadEvents, 10 * 60 * 1000);
        return () => {
            clearInterval(interval);
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        // Simulate loading time for map tiles
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Get danger rating for an area - Memoized via useCallback isn't strictly necessary for this helper,
    // but good if passed down. Since it's used in render props, we'll keep it simple or wrap if needed.
    // For now, it's used inside other callbacks.

    const getDangerRatingForArea = useCallback((areaId) => {
        if (!avalancheProducts) return null;

        const product = avalancheProducts.find(p => p.area?.id === areaId);
        if (!product || !product.report?.dangerRatings?.[0]) return null;

        // Get alpine rating as the primary indicator
        const alpineRating = product.report.dangerRatings[0].ratings?.alp?.rating?.value;
        return parseDangerRating(alpineRating);
    }, [avalancheProducts]);

    // Style function for avalanche polygons - Memoized
    const avalancheStyle = useCallback((feature) => {
        const areaId = feature.id;
        const rating = getDangerRatingForArea(areaId);

        return {
            fillColor: rating?.color || '#9E9E9E',
            weight: 2,
            opacity: 0.8,
            color: 'white',
            fillOpacity: 0.3
        };
    }, [getDangerRatingForArea]);

    // Popup content for avalanche areas - Memoized - MEMORY LEAK FIX: Added cleanup
    const onEachAvalancheFeature = useCallback((feature, layer) => {
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

        // Highlight on hover - with proper cleanup
        const handleMouseOver = (e) => {
            const layer = e.target;
            layer.setStyle({
                weight: 3,
                fillOpacity: 0.5
            });
        };

        const handleMouseOut = (e) => {
            const layer = e.target;
            layer.setStyle({
                weight: 2,
                fillOpacity: 0.3
            });
        };

        layer.on({
            mouseover: handleMouseOver,
            mouseout: handleMouseOut
        });

        // Clean up event listeners when layer is removed
        layer.on('remove', () => {
            layer.off('mouseover', handleMouseOver);
            layer.off('mouseout', handleMouseOut);
        });
    }, [getDangerRatingForArea]);

    // Memoize DriveBC markers to prevent re-rendering - MEMORY LEAK FIX: Use cached icons
    const driveBCMarkers = useMemo(() => {
        if (!showRoadEventsLayer) return null;

        const markers = [];

        // Render DriveBC road events
        const eventMarkers = driveBCEvents.map((event, idx) => {
            // Only show events with valid coordinates
            if (!event.geography || !event.geography.coordinates) return null;

            // Parse coordinates - API sometimes returns strings instead of numbers
            const [lon, lat] = event.geography.coordinates;
            const parsedLat = typeof lat === 'string' ? parseFloat(lat) : lat;
            const parsedLon = typeof lon === 'string' ? parseFloat(lon) : lon;

            // Validate coordinates are valid numbers
            if (typeof parsedLat !== 'number' || typeof parsedLon !== 'number' ||
                isNaN(parsedLat) || isNaN(parsedLon)) {
                return null;
            }

            const eventType = event.event_type || 'INCIDENT';
            const typeInfo = parseEventType(eventType);
            const severityInfo = parseSeverity(event.severity);
            const roadNames = getRoadNames(event);

            return (
                <Marker
                    key={`event-${event.id || idx}`}
                    position={[parsedLat, parsedLon]}
                    icon={getEventIcon(eventType)}
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
        });

        return eventMarkers.filter(m => m !== null);
    }, [driveBCEvents, showRoadEventsLayer]);

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

                        {/* Avalanche forecast areas - MEMORY LEAK FIX: Added key prop */}
                        {showAvalancheLayer && avalancheAreas && (
                            <GeoJSON
                                key="avalanche-areas"
                                data={avalancheAreas}
                                style={avalancheStyle}
                                onEachFeature={onEachAvalancheFeature}
                            />
                        )}

                        {/* DriveBC road events */}
                        {driveBCMarkers}

                        {/* Current location marker */}
                        <Marker position={center}>
                            <Popup>
                                <div className="text-dark">
                                    <strong>{locationName}</strong>
                                    <br />
                                    <small>
                                        {center[0].toFixed(4)}, {center[1].toFixed(4)}
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
