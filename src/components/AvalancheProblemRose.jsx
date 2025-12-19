import React from 'react';

const AvalancheProblemRose = ({ aspects = [], color = '#FF9800' }) => {
    const activeAspects = aspects.map(a => a.value?.toLowerCase() || '');

    const renderWedge = (direction, rotation) => {
        const isActive = activeAspects.includes(direction.toLowerCase());

        return (
            <g transform={`rotate(${rotation} 50 50)`} key={direction}>
                <path
                    d="M50 50 L32.8 8.4 A45 45 0 0 1 67.2 8.4 Z"
                    fill={isActive ? color : 'rgba(255,255,255,0.06)'}
                    stroke="#1a1d21"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.2s ease' }}
                />
            </g>
        );
    };

    const directions = [
        { dir: 'n', rot: 0 },
        { dir: 'ne', rot: 45 },
        { dir: 'e', rot: 90 },
        { dir: 'se', rot: 135 },
        { dir: 's', rot: 180 },
        { dir: 'sw', rot: 225 },
        { dir: 'w', rot: 270 },
        { dir: 'nw', rot: 315 },
    ];

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <div style={{ width: '90px', height: '90px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    {/* Directions */}
                    {directions.map(d => renderWedge(d.dir, d.rot))}

                    {/* Simple center */}
                    <circle cx="50" cy="50" r="12" fill="#1a1d21" />
                    <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.08)" />
                </svg>

                {/* Enhanced Cardinal Labels */}
                <div className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none">
                    {/* North */}
                    <div className="position-absolute start-50 translate-middle-x" style={{ top: '-8px' }}>
                        <div className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <span className="fw-bold" style={{ fontSize: '11px', color: '#fff' }}>N</span>
                        </div>
                    </div>
                    {/* East */}
                    <div className="position-absolute top-50 translate-middle-y" style={{ right: '-8px' }}>
                        <div className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <span className="fw-bold" style={{ fontSize: '11px', color: '#fff' }}>E</span>
                        </div>
                    </div>
                    {/* South */}
                    <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '-8px' }}>
                        <div className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <span className="fw-bold" style={{ fontSize: '11px', color: '#fff' }}>S</span>
                        </div>
                    </div>
                    {/* West */}
                    <div className="position-absolute top-50 translate-middle-y" style={{ left: '-8px' }}>
                        <div className="d-flex align-items-center justify-content-center"
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <span className="fw-bold" style={{ fontSize: '11px', color: '#fff' }}>W</span>
                        </div>
                    </div>
                </div>
            </div>
            <small className="text-white-50 fw-bold text-uppercase mt-1"
                style={{ fontSize: '8px', letterSpacing: '1px' }}>
                Aspect
            </small>
        </div>
    );
};

export default AvalancheProblemRose;
