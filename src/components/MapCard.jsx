import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, Badge, Spinner, Form } from 'react-bootstrap';
import { MapPin, Layers, AlertTriangle, Mountain } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';
import { getAvalancheForecastAreas, getAvalancheForecastProducts, parseDangerRating } from '../services/avalancheApi';
import { getDriveBCEvents, parseEventType, parseSeverity, getRoadNames, prioritizeEvents, getNextUpdate } from '../services/mapApi';
import { getTerrainLayerConfig } from '../services/terrainLayers';
import RoadEventModal from './RoadEventModal';

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
    const [showTerrainLayer, setShowTerrainLayer] = useState(false);
    const [showRoadEventModal, setShowRoadEventModal] = useState(false);
    const [selectedRoadEvent, setSelectedRoadEvent] = useState(null);
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

        // Get the full product for this area to access all danger ratings
        const product = avalancheProducts?.find(p => p.area?.id === areaId);
        const dangerRatings = product?.report?.dangerRatings?.[0]?.ratings;

        if (dangerRatings) {
            const alpineRating = parseDangerRating(dangerRatings.alp?.rating?.value);
            const treelineRating = parseDangerRating(dangerRatings.tln?.rating?.value);
            const belowTreelineRating = parseDangerRating(dangerRatings.btl?.rating?.value);

            const popupContent = `
                <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                    <strong style="font-size: 16px; color: #f5f5f5; display: block; margin-bottom: 12px;">${areaName}</strong>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 12px; color: #e0e0e0; font-weight: 600;">Alpine</span>
                            <span style="font-size: 11px; color: #bbb;">2500m+</span>
                        </div>
                        <div style="padding: 6px 10px; background-color: ${alpineRating.color}; color: ${alpineRating.textColor}; border-radius: 4px; text-align: center; font-weight: bold; font-size: 13px;">
                            ${alpineRating.display}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 12px; color: #e0e0e0; font-weight: 600;">Treeline</span>
                            <span style="font-size: 11px; color: #bbb;">1500-2500m</span>
                        </div>
                        <div style="padding: 6px 10px; background-color: ${treelineRating.color}; color: ${treelineRating.textColor}; border-radius: 4px; text-align: center; font-weight: bold; font-size: 13px;">
                            ${treelineRating.display}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 12px; color: #e0e0e0; font-weight: 600;">Below Treeline</span>
                            <span style="font-size: 11px; color: #bbb;">&lt;1500m</span>
                        </div>
                        <div style="padding: 6px 10px; background-color: ${belowTreelineRating.color}; color: ${belowTreelineRating.textColor}; border-radius: 4px; text-align: center; font-weight: bold; font-size: 13px;">
                            ${belowTreelineRating.display}
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px; margin-top: 8px;">
                        <small style="color: #ccc; font-size: 11px; display: block; text-align: center;">
                            📊 Click avalanche card for full forecast details
                        </small>
                    </div>
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
    }, [avalancheProducts]);

    // Memoize DriveBC markers to prevent re-rendering - MEMORY LEAK FIX: Use cached icons
    const driveBCMarkers = useMemo(() => {
        if (!showRoadEventsLayer) return null;

        const markers = [];

        // Render DriveBC road events
        const eventMarkers = driveBCEvents.map((event, idx) => {
            // Only show events with valid coordinates
            if (!event.geography || !event.geography.coordinates) return null;

            // Handle different geometry types (Point vs LineString)
            let lon, lat;
            if (event.geography.type === 'LineString') {
                // For LineString, use the middle point or first point
                const coords = event.geography.coordinates;
                const midIndex = Math.floor(coords.length / 2);
                [lon, lat] = coords[midIndex] || coords[0];
            } else {
                // Default to Point
                [lon, lat] = event.geography.coordinates;
            }

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
            const nextUpdate = getNextUpdate(event.description);

            return (
                <Marker
                    key={`event-${event.id || idx}`}
                    position={[parsedLat, parsedLon]}
                    icon={getEventIcon(eventType)}
                >
                    <Popup>
                        <div style={{ minWidth: '240px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '10px',
                                paddingBottom: '8px',
                                borderBottom: `3px solid ${typeInfo.color}`
                            }}>
                                <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
                                <div>
                                    <strong style={{ color: '#f5f5f5', fontSize: '15px', display: 'block' }}>{typeInfo.label}</strong>
                                    <span style={{ fontSize: '11px', color: '#ccc' }}>Road Event</span>
                                </div>
                            </div>

                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: severityInfo.color,
                                color: 'white',
                                borderRadius: '6px',
                                marginBottom: '10px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {severityInfo.label} Severity
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '11px', color: '#ddd', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Location</div>
                                <div style={{ color: '#f5f5f5', fontSize: '13px', fontWeight: '500' }}>{roadNames}</div>
                            </div>

                            <div style={{
                                color: '#f0f0f0',
                                fontSize: '12px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                lineHeight: '1.4'
                            }}>
                                {event.description ? (
                                    event.description.length > 120
                                        ? `${event.description.substring(0, 120)}...`
                                        : event.description
                                ) : event.headline}
                            </div>

                            {nextUpdate && (
                                <div style={{
                                    fontSize: '11px',
                                    color: '#FFC107',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    📅 Next Update: {nextUpdate}
                                </div>
                            )}

                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedRoadEvent(event);
                                        setShowRoadEventModal(true);
                                    }}
                                    style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'background-color 0.2s',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                                >
                                    View Full Report ↗
                                </button>
                            </div>

                            {event.updated && (
                                <div style={{
                                    fontSize: '10px',
                                    color: '#ccc',
                                    textAlign: 'right',
                                    marginTop: '8px',
                                    paddingTop: '8px',
                                    borderTop: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    🕐 Updated: {new Date(event.updated).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
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
                        <Form.Check
                            type="switch"
                            id="terrain-layer-toggle"
                            label={
                                <span className="d-flex align-items-center gap-1 small text-white">
                                    <Mountain size={12} />
                                    Terrain
                                </span>
                            }
                            checked={showTerrainLayer}
                            onChange={(e) => setShowTerrainLayer(e.target.checked)}
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

                        {/* Terrain overlay layer */}
                        {showTerrainLayer && (
                            <TileLayer
                                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                maxZoom={17}
                                opacity={0.6}
                            />
                        )}

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
                                <div style={{ minWidth: '220px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    <div style={{
                                        marginBottom: '10px',
                                        paddingBottom: '8px',
                                        borderBottom: '2px solid #4A90E2'
                                    }}>
                                        <strong style={{ fontSize: '16px', color: '#f5f5f5', display: 'block' }}>{locationName}</strong>
                                        <span style={{ fontSize: '11px', color: '#ccc' }}>📍 Selected Location</span>
                                    </div>

                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '11px', color: '#ddd', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Coordinates</div>
                                        <div style={{ fontSize: '12px', color: '#f0f0f0', fontFamily: 'monospace' }}>
                                            {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°W
                                        </div>
                                    </div>

                                    {location?.elevation && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <div style={{ fontSize: '11px', color: '#ddd', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Elevation</div>
                                            <div style={{ fontSize: '12px', color: '#f0f0f0' }}>
                                                ⛰️ Base: {location.elevation.base}m
                                                {location.elevation.summit && ` | Summit: ${location.elevation.summit}m`}
                                            </div>
                                        </div>
                                    )}

                                    {location?.avalancheZone && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '8px 12px',
                                            backgroundColor: '#D84315',
                                            borderLeft: '4px solid #FF6F00',
                                            borderRadius: '4px'
                                        }}>
                                            <div style={{ fontSize: '10px', color: '#FFE0B2', fontWeight: '600', marginBottom: '3px', letterSpacing: '0.5px' }}>AVALANCHE ZONE</div>
                                            <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '600' }}>{location.avalancheZone}</div>
                                        </div>
                                    )}
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
                    <div className="text-white-50 small">
                        Lat: {center[0].toFixed(4)}, Lon: {center[1].toFixed(4)}
                    </div>
                </div>
            </Card.Body>

            <RoadEventModal
                show={showRoadEventModal}
                onHide={() => setShowRoadEventModal(false)}
                event={selectedRoadEvent}
            />
        </Card>
    );
};

export default MapCard;
