import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';
import { getResorts, getBackcountryZones } from '../../data/locationData';

/**
 * Location Sidebar Component
 * Desktop sidebar with location search and quick selection
 */
const LocationSidebar = ({ currentLocation, onLocationSelect, searchValue, onSearchChange, onSearchSubmit }) => {
    return (
        <div
            className="d-none d-md-flex flex-column p-4 glass-sidebar"
            style={{ width: '320px', height: '100vh' }}
        >
            <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-4 text-white">
                    <img
                        src="/logo.png"
                        alt="PowPlus Logo"
                        className="rounded-circle shadow-sm"
                        style={{ width: '40px', height: '40px' }}
                    />
                    <span className="fw-bold fs-4 tracking-tight text-shadow-sm">
                        POWPLUS
                    </span>
                </div>

                <Form onSubmit={onSearchSubmit} className="position-relative">
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={onSearchChange}
                        className="bg-transparent text-white border-secondary rounded-pill ps-5 shadow-sm"
                        style={{ backdropFilter: 'blur(5px)' }}
                    />
                    <Search
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"
                        size={16}
                    />
                </Form>
            </div>

            <div className="flex-grow-1 overflow-auto custom-scrollbar">
                <small className="text-uppercase text-white-50 fw-bold mb-3 d-block px-2">
                    Ski Resorts
                </small>
                <div className="d-flex flex-column gap-2 mb-4">
                    {getResorts().map((loc) => (
                        <Button
                            key={loc.name}
                            variant="link"
                            onClick={() => onLocationSelect(loc.name)}
                            className={`text-decoration-none text-start px-3 py-2 rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale ${currentLocation === loc.name
                                    ? 'bg-primary bg-opacity-50 text-white shadow-md'
                                    : 'text-white-50 hover-bg-white-10'
                                }`}
                        >
                            <div className="d-flex flex-column">
                                <span className="fw-medium">{loc.name}</span>
                                {loc.resortInfo && (
                                    <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                        {loc.resortInfo.verticalDrop}m vertical
                                    </small>
                                )}
                            </div>
                            {currentLocation === loc.name && (
                                <div
                                    className="bg-white rounded-circle shadow-sm"
                                    style={{ width: '8px', height: '8px' }}
                                ></div>
                            )}
                        </Button>
                    ))}
                </div>

                <small className="text-uppercase text-white-50 fw-bold mb-3 d-block px-2">
                    Backcountry
                </small>
                <div className="d-flex flex-column gap-2">
                    {getBackcountryZones().map((loc) => (
                        <Button
                            key={loc.name}
                            variant="link"
                            onClick={() => onLocationSelect(loc.name)}
                            className={`text-decoration-none text-start px-3 py-2 rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale ${currentLocation === loc.name
                                    ? 'bg-primary bg-opacity-50 text-white shadow-md'
                                    : 'text-white-50 hover-bg-white-10'
                                }`}
                        >
                            <div className="d-flex flex-column">
                                <span className="fw-medium">{loc.name}</span>
                                {loc.backcountryInfo && (
                                    <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                                        {loc.backcountryInfo.difficulty}
                                    </small>
                                )}
                            </div>
                            {currentLocation === loc.name && (
                                <div
                                    className="bg-white rounded-circle shadow-sm"
                                    style={{ width: '8px', height: '8px' }}
                                ></div>
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationSidebar;
