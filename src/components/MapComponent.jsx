import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, Tooltip, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for highlighted (Top 10) locations
const highlightedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const standardIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map view updates when centerCoords changes
function MapViewController({ centerCoords }) {
    const map = useMap();

    useEffect(() => {
        if (centerCoords && centerCoords.length === 2) {
            map.setView(centerCoords, 10, {
                animate: true,
                duration: 1
            });
        }
    }, [centerCoords, map]);

    return null;
}

// Style function for GeoJSON features based on danger rating
const getFeatureStyle = (feature) => {
    const dangerRating = feature?.properties?.danger_rating?.toLowerCase() || 'unknown';

    const styleMap = {
        'low': {
            color: '#22c55e',
            fillColor: '#86efac',
            fillOpacity: 0.4,
            weight: 2
        },
        'moderate': {
            color: '#f59e0b',
            fillColor: '#fcd34d',
            fillOpacity: 0.4,
            weight: 2
        },
        'considerable': {
            color: '#ef4444',
            fillColor: '#fca5a5',
            fillOpacity: 0.5,
            weight: 2
        },
        'high': {
            color: '#dc2626',
            fillColor: '#f87171',
            fillOpacity: 0.6,
            weight: 3
        },
        'extreme': {
            color: '#991b1b',
            fillColor: '#ef4444',
            fillOpacity: 0.7,
            weight: 3
        },
        'unknown': {
            color: '#6b7280',
            fillColor: '#d1d5db',
            fillOpacity: 0.3,
            weight: 1
        }
    };

    return styleMap[dangerRating] || styleMap['unknown'];
};

// Popup content for each GeoJSON feature
const onEachFeature = (feature, layer, onZoneClick) => {
    if (feature.properties) {
        const { name, danger_rating, elevation_band, polygon_name, mountain_range } = feature.properties;
        const displayName = polygon_name || name || 'Avalanche Area';

        const popupContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${displayName}</h3>
        ${mountain_range ? `<p style="margin: 4px 0;"><strong>Range:</strong> ${mountain_range}</p>` : ''}
        ${danger_rating ? `<p style="margin: 4px 0;"><strong>Danger Rating:</strong> ${danger_rating}</p>` : ''}
        ${elevation_band ? `<p style="margin: 4px 0;"><strong>Elevation:</strong> ${elevation_band}</p>` : ''}
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">Click for detailed forecast</p>
      </div>
    `;
        layer.bindPopup(popupContent);

        // Add hover tooltip
        layer.bindTooltip(displayName, {
            permanent: false,
            direction: 'top',
            className: 'avalanche-zone-tooltip'
        });

        // Add click handler for zones
        if (onZoneClick) {
            layer.on('click', () => {
                onZoneClick(feature);
            });
        }
    }
};

const MapComponent = ({
    centerCoords,
    areaGeoJson,
    currentLocationName,
    showAllLocations = false,
    allLocations = [],
    highlightedLocations = [],
    onLocationClick = null,
    onZoneClick = null,
    showAvalancheZones = true
}) => {
    const [avalancheZones, setAvalancheZones] = useState(null);
    const [loadingZones, setLoadingZones] = useState(false);

    // Fetch avalanche zones from Avalanche Canada API
    useEffect(() => {
        if (showAvalancheZones && showAllLocations) {
            const fetchAvalancheZones = async () => {
                setLoadingZones(true);
                try {
                    console.log('🗺️ Fetching avalanche zones from Avalanche Canada API...');
                    const response = await fetch('https://api.avalanche.ca/forecasts/en/areas');

                    if (!response.ok) {
                        throw new Error(`Failed to fetch avalanche zones: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('✅ Avalanche zones loaded:', data);
                    setAvalancheZones(data);
                } catch (error) {
                    console.error('❌ Failed to load avalanche zones:', error);
                    setAvalancheZones(null);
                } finally {
                    setLoadingZones(false);
                }
            };

            fetchAvalancheZones();
        }
    }, [showAvalancheZones, showAllLocations]);

    // Default center if no coords provided
    const defaultCenter = [51.0, -120.0]; // British Columbia
    const mapCenter = centerCoords && centerCoords.length === 2 ? centerCoords : defaultCenter;
    const defaultZoom = showAllLocations ? 7 : 10;

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
            <MapContainer
                center={mapCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ background: '#1f2937', minHeight: '400px' }}
            >
                <LayersControl position="topright">
                    {/* Base tile layer */}
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            className="map-tiles"
                        />
                    </LayersControl.BaseLayer>

                    {/* Terrain layer option */}
                    <LayersControl.BaseLayer name="Terrain">
                        <TileLayer
                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            maxZoom={17}
                        />
                    </LayersControl.BaseLayer>

                    {/* Avalanche zones overlay */}
                    {avalancheZones && (
                        <LayersControl.Overlay checked name="Avalanche Zones">
                            <GeoJSON
                                data={avalancheZones}
                                style={getFeatureStyle}
                                onEachFeature={(feature, layer) => onEachFeature(feature, layer, onZoneClick)}
                            />
                        </LayersControl.Overlay>
                    )}
                </LayersControl>

                {/* Map view controller */}
                <MapViewController centerCoords={centerCoords} />

                {/* All location markers (for landing page) */}
                {showAllLocations && allLocations.length > 0 && allLocations.map((location) => {
                    const isHighlighted = highlightedLocations.includes(location.name);
                    const icon = isHighlighted ? highlightedIcon : standardIcon;

                    return (
                        <Marker
                            key={location.name}
                            position={[location.coordinates.lat, location.coordinates.lon]}
                            icon={icon}
                            eventHandlers={{
                                click: () => {
                                    if (onLocationClick) {
                                        onLocationClick(location);
                                    }
                                }
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                                <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minWidth: '150px' }}>
                                    <strong style={{ fontSize: '13px' }}>{location.displayName || location.name}</strong>
                                    {isHighlighted && (
                                        <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>
                                            ⭐ Top 10
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                            <Popup>
                                <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    <strong>{location.displayName || location.name}</strong>
                                    <p style={{ margin: '4px 0', fontSize: '12px' }}>
                                        {location.type === 'resort' ? '🎿 Ski Resort' : '⛰️ Backcountry'}
                                    </p>
                                    {location.avalancheZone && (
                                        <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>
                                            Zone: {location.avalancheZone}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => onLocationClick && onLocationClick(location)}
                                        style={{
                                            marginTop: '8px',
                                            padding: '4px 12px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        View Forecast
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Single location marker (for dashboard) */}
                {!showAllLocations && centerCoords && centerCoords.length === 2 && (
                    <Marker position={centerCoords}>
                        <Popup>
                            <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                <strong>{currentLocationName || 'Selected Location'}</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Legend for danger ratings */}
            <div className="position-absolute bottom-0 end-0 m-3 bg-dark bg-opacity-90 p-3 rounded shadow-lg" style={{ fontSize: '0.75rem', zIndex: 1000 }}>
                <h6 className="fw-semibold mb-2 text-white">Avalanche Danger</h6>
                <div className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                        <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#86efac', border: '2px solid #22c55e' }}></div>
                        <span className="text-white-50">Low</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#fcd34d', border: '2px solid #f59e0b' }}></div>
                        <span className="text-white-50">Moderate</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#fca5a5', border: '2px solid #ef4444' }}></div>
                        <span className="text-white-50">Considerable</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#f87171', border: '2px solid #dc2626' }}></div>
                        <span className="text-white-50">High</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', border: '2px solid #991b1b' }}></div>
                        <span className="text-white-50">Extreme</span>
                    </div>
                </div>
                {loadingZones && (
                    <div className="mt-2 text-white-50 small">
                        Loading avalanche zones...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapComponent;
