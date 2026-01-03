import React from 'react';
import { List, LineChart } from 'lucide-react';

/**
 * Reusable card toggle buttons component with theme support
 * @param {Object} props
 * @param {'cards'|'charts'} props.view - Current view state
 * @param {Function} props.setView - Set view function
 * @param {'primary'|'warning'|'success'|'danger'} props.theme - Color theme (default: 'primary')
 * @param {'normal'|'high'} props.emphasis - Visual emphasis level (default: 'normal')
 * @param {boolean} props.stopPropagation - Stop click event propagation (default: false)
 */
const CardToggleButtons = ({
    view,
    setView,
    theme = 'primary',
    emphasis = 'normal',
    stopPropagation = false
}) => {
    // Theme color configurations
    const themes = {
        primary: {
            base: '59, 130, 246',      // Blue
            color: '#fff'
        },
        warning: {
            base: '251, 191, 36',      // Yellow/Warning
            color: '#fbbf24'
        },
        success: {
            base: '34, 197, 94',       // Green
            color: '#22c55e'
        },
        danger: {
            base: '239, 68, 68',       // Red
            color: '#ef4444'
        }
    };

    const selectedTheme = themes[theme];
    const isHighEmphasis = emphasis === 'high';

    // Button styles factory
    const getButtonStyle = (isActive) => ({
        padding: isHighEmphasis ? '4px 10px' : '0.35rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        background: isActive
            ? `rgba(${selectedTheme.base}, 0.3)`
            : `rgba(${selectedTheme.base}, 0.05)`,
        border: isActive
            ? `1px solid rgba(${selectedTheme.base}, 0.5)`
            : `1px solid rgba(${selectedTheme.base}, 0.2)`,
        color: isHighEmphasis ? selectedTheme.color : '#fff',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: isHighEmphasis ? '0' : '4px'
    });

    const handleClick = (newView, e) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        setView(newView);
    };

    const iconStyle = isHighEmphasis ? { marginRight: '4px' } : {};

    return (
        <div
            className={isHighEmphasis ? 'd-flex gap-2' : 'd-flex gap-2'}
            style={{ fontSize: '0.7rem' }}
        >
            <button
                className={!isHighEmphasis ? 'btn btn-sm' : undefined}
                style={getButtonStyle(view === 'cards')}
                onClick={(e) => handleClick('cards', e)}
            >
                <List size={12} style={iconStyle} />
                Cards
            </button>
            <button
                className={!isHighEmphasis ? 'btn btn-sm' : undefined}
                style={getButtonStyle(view === 'charts')}
                onClick={(e) => handleClick('charts', e)}
            >
                <LineChart size={12} style={iconStyle} />
                Charts
            </button>
        </div>
    );
};

export default CardToggleButtons;
