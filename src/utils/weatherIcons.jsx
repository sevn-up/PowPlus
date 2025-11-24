import React from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudFog, CloudSnow, Zap } from 'lucide-react';

// Helper function to get weather icon based on WMO code
export const getWeatherIcon = (code, size = 20) => {
    const iconProps = { size, className: "drop-shadow-md" };
    if (code === 0) return <Sun {...iconProps} className="text-warning drop-shadow-md" />;
    if (code === 1) return <Sun {...iconProps} className="text-warning opacity-75 drop-shadow-md" />;
    if (code === 2) return <Cloud {...iconProps} className="text-white-50 drop-shadow-md" />;
    if (code === 3) return <Cloud {...iconProps} className="text-white drop-shadow-md" />;
    if (code >= 45 && code <= 48) return <CloudFog {...iconProps} className="text-white-50 drop-shadow-md" />;
    if (code >= 51 && code <= 57) return <CloudDrizzle {...iconProps} className="text-info drop-shadow-md" />;
    if (code >= 61 && code <= 67) return <CloudRain {...iconProps} className="text-info drop-shadow-md" />;
    if (code >= 71 && code <= 77) return <CloudSnow {...iconProps} className="text-white drop-shadow-md" />;
    if (code >= 80 && code <= 82) return <CloudRain {...iconProps} className="text-info drop-shadow-md" />;
    if (code >= 85 && code <= 86) return <CloudSnow {...iconProps} className="text-white drop-shadow-md" />;
    if (code >= 95 && code <= 99) return <Zap {...iconProps} className="text-warning drop-shadow-md" />;
    return <Sun {...iconProps} className="text-warning opacity-50 drop-shadow-md" />;
};

// Helper function to get wind speed color
export const getWindColor = (speed) => {
    if (speed < 20) return '#10b981'; // Green - Calm
    if (speed < 40) return '#fbbf24'; // Yellow - Breezy
    if (speed < 60) return '#f97316'; // Orange - Windy
    return '#ef4444'; // Red - Very windy
};
