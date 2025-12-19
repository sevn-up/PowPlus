import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { CloudSnow, Waves, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import './TabNavigation.css';

const TabNavigation = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const tabs = [
        { path: '/weather', icon: CloudSnow, label: 'Weather' },
        { path: '/tides', icon: Waves, label: 'Tides' },
        { path: '/map', icon: MapIcon, label: ' Map' },
        { path: '/planning', icon: RouteIcon, label: 'Planning' }
    ];

    return (
        <>
            {/* Desktop Horizontal Tabs */}
            <Nav className="tab-navigation-desktop d-none d-md-flex align-items-center">
                {/* Logo/Branding */}
                <div className="d-flex align-items-center gap-2 me-4 pe-3" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div className="bg-primary rounded-3 p-2" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CloudSnow size={20} className="text-white" />
                    </div>
                    <h5 className="text-white fw-bold mb-0">POWPLUS</h5>
                </div>

                {/* Navigation Tabs */}
                {tabs.map(({ path, icon: Icon, label }) => (
                    <Nav.Item key={path}>
                        <Nav.Link
                            as={Link}
                            to={path}
                            className={`tab-link ${currentPath === path ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span className="ms-2">{label}</span>
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {/* Mobile Bottom Tab Bar */}
            <div className="tab-navigation-mobile d-md-none">
                {tabs.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`mobile-tab ${currentPath === path ? 'active' : ''}`}
                    >
                        <Icon size={22} />
                        <span className="tab-label">{label}</span>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default TabNavigation;
