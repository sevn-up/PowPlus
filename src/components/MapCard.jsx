import React, { useRef, useState, useEffect } from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import { MapPin, Layers, AlertTriangle, Mountain } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapCard.css';

import { MAPBOX_TOKEN, MAP_STYLES, AVALANCHE_COLORS } from '../config/mapbox';
import { getAvalancheForecastAreas, getAvalancheForecastProducts, parseDangerRating } from '../services/avalancheApi';
import { getDriveBCEvents, parseEventType, prioritizeEvents } from '../services/mapApi';
import RoadEventModal from './RoadEventModal';

/**
 * MapCard Component - Native Mapbox GL Implementation
 * Direct mapbox-gl usage (no React wrapper) for maximum compatibility
 * 
 * Features:
 * - WebGL vector tile rendering
 * - Avalanche forecast layers with color-coded danger ratings
 * - Road event markers from DriveBC
 * - 3D terrain visualization toggle
 * - Optimized performance (30min refresh vs 10min)
 */
const MapCard = ({ location, coordinates, avalancheForecast }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    // Layer toggles - avalanche and roads ON by default
    const [showAvalancheLayer, setShowAvalancheLayer] = useState(true);
    const [showRoadEventsLayer, setShowRoadEventsLayer] = useState(true);
    const [showTerrainLayer, setShowTerrainLayer] = useState(false);

    // Data states
    const [avalancheAreas, setAvalancheAreas] = useState(null);
    const [avalancheProducts, setAvalancheProducts] = useState(null);
    const [driveBCEvents, setDriveBCEvents] = useState([]);
    const [markers, setMarkers] = useState([]);

    // UI states
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mapError, setMapError] = useState(null);

    // Check for valid token
    const hasToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'PASTE_YOUR_TOKEN_HERE' && MAPBOX_TOKEN.startsWith('pk.');

    // If no valid token, show error message instead of crashing
    if (!hasToken) {
        return (
            <Card className="glass-card border-0 text-white shadow-lg">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                            <MapPin size={16} /> Interactive Map
                        </div>
                        <Badge bg="warning" className="d-flex align-items-center gap-1">
                            <AlertTriangle size={12} />
                            Setup Required
                        </Badge>
                    </div>

                    <div className="map-container rounded-4 overflow-hidden p-5 text-center" style={{ height: '400px', background: 'rgba(255, 255, 255, 0.05)' }}>
                        <AlertTriangle size={48} className="text-warning mb-3" />
                        <h5 className="text-white mb-3">Mapbox Token Required</h5>
                        <p className="text-white-50 mb-3">
                            To display the interactive map, you need a free Mapbox access token.
                        </p>
                        <div className="text-start bg-dark bg-opacity-50 p-3 rounded">
                            <small className="text-white-50">
                                <strong className="text-info d-block mb-2">Quick Setup (2 minutes):</strong>
                                1. Get FREE token: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-info">account.mapbox.com/access-tokens</a><br />
                                2. Copy your "Default public token"<br />
                                3. Paste in <code>.env</code> file: <code className="text-warning">VITE_MAPBOX_TOKEN=pk.your_token_here</code><br />
                                4. Restart dev server: <code className="text-info">npm run dev</code>
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // Initialize map
    useEffect(() => {
        if (map.current) return; // Initialize only once

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLES.outdoors,
            center: [coordinates?.lon || -122.9574, coordinates?.lat || 50.1163],
            zoom: 10,
            pitch: 0,
            bearing: 0,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl());

        // Add location marker
        new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([coordinates?.lon || -122.9574, coordinates?.lat || 50.1163])
            .setPopup(
                new mapboxgl.Popup().setHTML(
                    `<strong>${location?.displayName || location?.name || 'Location'}</strong><br/>
           ${coordinates?.lat?.toFixed(4) || ''}°N, ${coordinates?.lon?.toFixed(4) || ''}°W`
                )
            )
            .addTo(map.current);

        map.current.on('load', () => {
            setIsLoading(false);

            // Add terrain source for 3D
            map.current.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.terrain-rgb',
                tileSize: 512,
                maxzoom: 14,
            });
        });

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update map center when coordinates change
    useEffect(() => {
        if (map.current && coordinates) {
            map.current.flyTo({
                center: [coordinates.lon, coordinates.lat],
                zoom: 10,
                duration: 1500,
            });
        }
    }, [coordinates]);

    // Fetch avalanche data
    useEffect(() => {
        let isMounted = true;

        const fetchAvalancheData = async () => {
            try {
                const [areas, products] = await Promise.all([
                    getAvalancheForecastAreas(),
                    getAvalancheForecastProducts(),
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

    // Fetch road events (showing ALL events, no filtering)
    useEffect(() => {
        let isMounted = true;

        const fetchRoadEvents = async () => {
            if (!isMounted) return;

            try {
                // Fetch province-wide events
                const events = await getDriveBCEvents(null, 50);

                if (isMounted && events.length > 0) {
                    // DON'T filter - show ALL events (was filtering 50 → 2)
                    setDriveBCEvents(events);
                    console.log(`DriveBC: Loaded ${events.length} road events to map`);
                } else {
                    console.log(`DriveBC: No events available`);
                    setDriveBCEvents([]);
                }
            } catch (error) {
                console.error('Failed to fetch DriveBC events:', error);
                setDriveBCEvents([]);
            }
        };

        fetchRoadEvents();
        // Fetch once per hour
        const interval = setInterval(fetchRoadEvents, 60 * 60 * 1000);

        return () => {
            clearInterval(interval);
            isMounted = false;
        };
    }, []);

    // Add/remove avalanche layer  
    useEffect(() => {
        if (!map.current || !map.current.loaded()) return;
        if (!avalancheAreas || !avalancheProducts) return;

        const layerId = 'avalanche-areas';
        const sourceId = 'avalanche-source';

        // Batch updates to prevent jank
        const updateLayers = () => {
            if (showAvalancheLayer) {
                // Create rating map
                const ratingMap = {};
                avalancheProducts.forEach((product) => {
                    if (product.area?.id && product.report?.dangerRatings?.[0]) {
                        const alpineRating = product.report.dangerRatings[0].ratings?.alp?.rating?.value;
                        const ratingInfo = parseDangerRating(alpineRating);
                        ratingMap[product.area.id] = ratingInfo;
                    }
                });

                // Add features with danger ratings
                const enhancedAreas = {
                    ...avalancheAreas,
                    features: avalancheAreas.features.map((feature) => {
                        const rating = ratingMap[feature.id];
                        return {
                            ...feature,
                            properties: {
                                ...feature.properties,
                                color: rating?.color || '#9E9E9E',
                                level: rating?.level || 'N/A',
                            },
                        };
                    }),
                };

                // Only add if doesn't exist
                if (!map.current.getSource(sourceId)) {
                    map.current.addSource(sourceId, {
                        type: 'geojson',
                        data: enhancedAreas,
                    });

                    map.current.addLayer({
                        id: layerId,
                        type: 'fill',
                        source: sourceId,
                        paint: {
                            'fill-color': ['get', 'color'],
                            'fill-opacity': 0.3,
                        },
                        layout: {
                            'visibility': 'visible'
                        }
                    });

                    map.current.addLayer({
                        id: `${layerId}-border`,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 2,
                            'line-opacity': 0.8,
                        },
                        layout: {
                            'visibility': 'visible'
                        }
                    });
                } else {
                    // Update existing source
                    map.current.getSource(sourceId).setData(enhancedAreas);
                    // Make visible
                    if (map.current.getLayer(layerId)) {
                        map.current.setLayoutProperty(layerId, 'visibility', 'visible');
                        map.current.setLayoutProperty(`${layerId}-border`, 'visibility', 'visible');
                    }
                }
            } else {
                // Hide layers instead of removing them
                if (map.current.getLayer(layerId)) {
                    map.current.setLayoutProperty(layerId, 'visibility', 'none');
                    map.current.setLayoutProperty(`${layerId}-border`, 'visibility', 'none');
                }
            }
        };

        // Small delay to batch updates and reduce jank
        const timeout = setTimeout(updateLayers, 50);
        return () => clearTimeout(timeout);
    }, [showAvalancheLayer, avalancheAreas, avalancheProducts]);

    // Add/remove road event markers with coordinate validation
    useEffect(() => {
        if (!map.current || !map.current.loaded()) return;

        // Clear existing markers first
        markers.forEach(marker => marker.remove());

        if (!showRoadEventsLayer || driveBCEvents.length === 0) {
            setMarkers([]);
            console.log(`Road events: layer ${showRoadEventsLayer ? 'ON' : 'OFF'}, ${driveBCEvents.length} events available`);
            return;
        }

        console.log(`Creating markers for ${driveBCEvents.length} DriveBC events...`);

        const newMarkers = [];
        let skippedCount = 0;

        driveBCEvents.forEach((event, index) => {
            // Robust coordinate extraction
            let lon, lat;

            if (event.geography?.type === 'Point' && Array.isArray(event.geography.coordinates)) {
                [lon, lat] = event.geography.coordinates;
            } else if (event.geography?.type === 'LineString' && Array.isArray(event.geography.coordinates) && event.geography.coordinates.length > 0) {
                // For LineString, use first point
                [lon, lat] = event.geography.coordinates[0];
            }

            // Validate coordinates are valid numbers
            if (!lon || !lat || isNaN(lon) || isNaN(lat)) {
                console.warn(`Event ${index} has invalid coordinates:`, event.geography);
                skippedCount++;
                return;
            }

            const typeInfo = parseEventType(event.event_type, event.description || '');

            // Wrapper element for Mapbox positioning
            const wrapper = document.createElement('div');
            wrapper.className = 'marker-wrapper';
            wrapper.style.cursor = 'pointer';
            wrapper.style.zIndex = '1000'; // Ensure high z-index

            // Inner element for styling and hover effect
            const el = document.createElement('div');
            el.className = 'road-event-marker';
            el.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: ${typeInfo.color};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                border: 3px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                transition: transform 0.2s ease-out;
            `;
            el.textContent = typeInfo.icon;

            // Hover effect on inner element to avoid conflicting with Mapbox positioning
            wrapper.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.2)';
                wrapper.style.zIndex = '1001'; // Bring to front on hover
            });
            wrapper.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
                wrapper.style.zIndex = '1000';
            });

            wrapper.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent map click
                setSelectedEvent(event);
                setShowEventModal(true);
            });

            wrapper.appendChild(el);

            try {
                const marker = new mapboxgl.Marker({ element: wrapper })
                    .setLngLat([lon, lat])
                    .addTo(map.current);
                newMarkers.push(marker);
            } catch (error) {
                console.error(`Failed to create marker for event ${index}:`, error);
                skippedCount++;
            }
        });

        setMarkers(newMarkers);
        console.log(`✅ Created ${newMarkers.length} markers successfully${skippedCount > 0 ? `, skipped ${skippedCount} invalid` : ''}`);

        // Cleanup on unmount or toggle
        return () => {
            newMarkers.forEach(marker => marker.remove());
        };
    }, [showRoadEventsLayer, driveBCEvents]);

    // Toggle terrain (WITHOUT changing base style to preserve avalanche layers)
    useEffect(() => {
        if (!map.current || isLoading) return;

        // Wait for map to be fully loaded
        if (!map.current.loaded()) return;

        try {
            if (showTerrainLayer) {
                // Only set terrain if source exists
                if (!map.current.getSource('mapbox-dem')) {
                    console.warn('Terrain source not ready yet');
                    return;
                }
                map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                // DON'T change style - it removes avalanche layers
                // map.current.setStyle(MAP_STYLES.satellite);
            } else {
                map.current.setTerrain(null);
                // DON'T change style - it removes avalanche layers
                // map.current.setStyle(MAP_STYLES.outdoors);
            }
        } catch (error) {
            console.error('Error toggling terrain:', error);
            setMapError(error.message);
        }
    }, [showTerrainLayer, isLoading]);

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
                            Mapbox
                        </Badge>
                    </div>
                </div>

                <div
                    ref={mapContainer}
                    className="map-container rounded-4 overflow-hidden"
                    style={{ height: '400px' }}
                />

                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <small className="text-white-50">
                        Drag to pan • Scroll to zoom • Click markers for details
                    </small>
                    <small className="text-white-50">
                        Powered by Mapbox GL
                    </small>
                </div>
            </Card.Body>

            {/* Road Event Modal */}
            <RoadEventModal
                show={showEventModal}
                onHide={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                }}
                event={selectedEvent}
            />
        </Card>
    );
};

export default MapCard;
