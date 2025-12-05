import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, AlertTriangle, Settings } from 'lucide-react';
import './MobileBottomNav.css';

/**
 * MobileBottomNav Component
 * Persistent bottom navigation for mobile devices
 * Shows on screens < 768px wide
 */
const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/map', icon: Map, label: 'Map' },
        { path: '/avalanche', icon: AlertTriangle, label: 'Safety' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="mobile-bottom-nav d-md-none">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <button
                        key={item.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                    >
                        <Icon size={24} />
                        <span className="label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
