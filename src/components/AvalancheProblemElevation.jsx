import React from 'react';

const AvalancheProblemElevation = ({ elevations = [], color = '#FF9800' }) => {
    const activeElevations = elevations.map(e => e.value?.toLowerCase() || '');

    const isAlpine = activeElevations.some(e => e.includes('alp'));
    const isTreeline = activeElevations.some(e => e.includes('tln'));
    const isBelow = activeElevations.some(e => e.includes('btl'));

    const inactiveColor = 'rgba(255,255,255,0.06)';

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <div style={{ width: '90px', height: '75px', position: 'relative' }}>
                <svg viewBox="0 0 120 100" width="100%" height="100%">
                    {/* Alpine (Top Triangle) */}
                    <path
                        d="M60 10 L44 38 L76 38 Z"
                        fill={isAlpine ? color : inactiveColor}
                        stroke="#1a1d21"
                        strokeWidth="1.5"
                        style={{ transition: 'all 0.2s ease' }}
                    />

                    {/* Treeline (Middle Trapezoid) */}
                    <path
                        d="M44 38 L28 66 L92 66 L76 38 Z"
                        fill={isTreeline ? color : inactiveColor}
                        stroke="#1a1d21"
                        strokeWidth="1.5"
                        style={{ transition: 'all 0.2s ease' }}
                    />

                    {/* Below Treeline (Bottom Trapezoid) */}
                    <path
                        d="M28 66 L12 94 L108 94 L92 66 Z"
                        fill={isBelow ? color : inactiveColor}
                        stroke="#1a1d21"
                        strokeWidth="1.5"
                        style={{ transition: 'all 0.2s ease' }}
                    />
                </svg>
            </div>
            <small className="text-white-50 fw-bold text-uppercase mt-1"
                style={{ fontSize: '8px', letterSpacing: '1px' }}>
                Elevation
            </small>
        </div>
    );
};

export default AvalancheProblemElevation;
