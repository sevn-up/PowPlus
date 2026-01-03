import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceArea
} from 'recharts';
import { parseDangerRating } from '../services/avalancheApi';

// Custom Square Dot Component
const CustomSquareDot = ({ cx, cy, color, size = 8 }) => {
    return (
        <rect
            x={cx - size / 2}
            y={cy - size / 2}
            width={size}
            height={size}
            fill={color}
            stroke="#1a1a1a"
            strokeWidth={2}
        />
    );
};

// Custom Diamond Dot Component
const CustomDiamondDot = ({ cx, cy, color, size = 8 }) => {
    const points = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
    return (
        <polygon
            points={points}
            fill={color}
            stroke="#1a1a1a"
            strokeWidth={2}
        />
    );
};

// Custom Legend Renderer
const CustomLegend = ({ payload }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            paddingTop: '10px',
            fontSize: '0.75rem'
        }}>
            {payload.map((entry, index) => {
                let icon;
                if (entry.id === 'belowTreeline') {
                    // Circle
                    icon = (
                        <svg width="14" height="14" style={{ marginRight: '6px' }}>
                            <circle cx="7" cy="7" r="5" fill={entry.color} stroke="#1a1a1a" strokeWidth="2" />
                        </svg>
                    );
                } else if (entry.id === 'treeline') {
                    // Square
                    icon = (
                        <svg width="14" height="14" style={{ marginRight: '6px' }}>
                            <rect x="2" y="2" width="10" height="10" fill={entry.color} stroke="#1a1a1a" strokeWidth="2" />
                        </svg>
                    );
                } else if (entry.id === 'alpine') {
                    // Diamond
                    icon = (
                        <svg width="14" height="14" style={{ marginRight: '6px' }}>
                            <polygon points="7,2 12,7 7,12 2,7" fill={entry.color} stroke="#1a1a1a" strokeWidth="2" />
                        </svg>
                    );
                }

                return (
                    <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        {icon}
                        <span>{entry.value}</span>
                    </div>
                );
            })}
        </div>
    );
};

const AvalancheTrendChart = ({ dangerRatings }) => {
    if (!dangerRatings || dangerRatings.length === 0) {
        return (
            <div className="p-3 text-center text-white-50">
                <p>No danger rating forecast available</p>
            </div>
        );
    }

    // Transform danger ratings data for chart
    const chartData = dangerRatings.map((rating, idx) => {
        // Better date handling to avoid Invalid Date
        let dayLabel;
        if (idx === 0) {
            dayLabel = 'Today';
        } else if (idx === 1) {
            dayLabel = 'Tomorrow';
        } else {
            // For third day and beyond, use a fallback
            try {
                const date = new Date(rating.date);
                if (!isNaN(date.getTime())) {
                    dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                } else {
                    dayLabel = `Day ${idx + 1}`;
                }
            } catch (e) {
                dayLabel = `Day ${idx + 1}`;
            }
        }

        // Parse the ratings - need to access the nested value
        const alpineRating = parseDangerRating(rating.ratings?.alp?.rating?.value);
        const treelineRating = parseDangerRating(rating.ratings?.tln?.rating?.value);
        const belowTreelineRating = parseDangerRating(rating.ratings?.btl?.rating?.value);

        return {
            day: dayLabel,
            alpine: alpineRating.level,
            treeline: treelineRating.level,
            belowTreeline: belowTreelineRating.level,
            // Store display and colors for tooltip and lines
            alpineDisplay: alpineRating.display,
            treelineDisplay: treelineRating.display,
            belowTreelineDisplay: belowTreelineRating.display,
            alpineColor: alpineRating.color,
            treelineColor: treelineRating.color,
            belowTreelineColor: belowTreelineRating.color
        };
    });

    // Determine dominant colors for each elevation (use most common/highest danger rating color)
    const getLineColor = (elevationKey) => {
        const colors = chartData.map(d => d[`${elevationKey}Color`]);
        // Return the color of the highest danger rating found in the series
        const highestDangerColor = colors.find(c => c === '#000000') || // Extreme
            colors.find(c => c === '#F44336') || // High  
            colors.find(c => c === '#FF9800') || // Considerable
            colors.find(c => c === '#FFC107') || // Moderate
            colors.find(c => c === '#4CAF50') || // Low
            '#9E9E9E'; // Default gray
        return highestDangerColor;
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px'
                    }}
                >
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>
                        {data.day}
                    </p>
                    <p style={{ margin: '4px 0 2px 0', fontSize: '0.75rem', color: '#60a5fa' }}>
                        <span style={{ fontWeight: 'bold' }}>Alpine:</span> {data.alpineDisplay}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '0.75rem', color: '#34d399' }}>
                        <span style={{ fontWeight: 'bold' }}>Treeline:</span> {data.treelineDisplay}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#fbbf24' }}>
                        <span style={{ fontWeight: 'bold' }}>Below TL:</span> {data.belowTreelineDisplay}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-3">
            <div style={{ height: window.innerWidth < 768 ? '250px' : '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: window.innerWidth < 768 ? 5 : 15,
                            left: window.innerWidth < 768 ? -20 : -15,
                            bottom: 5
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255, 255, 255, 0.1)"
                        />

                        {/* Danger Zone Background Bands */}
                        <defs>
                            <linearGradient id="lowZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="moderateZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FFC107" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#FFC107" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="considerableZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF9800" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#FF9800" stopOpacity={0.08} />
                            </linearGradient>
                            <linearGradient id="highZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F44336" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#F44336" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="extremeZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#000000" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#000000" stopOpacity={0.15} />
                            </linearGradient>
                        </defs>

                        {/* Horizontal danger zone bands as ReferenceArea */}
                        <ReferenceArea y1={0} y2={1} fill="url(#lowZone)" />
                        <ReferenceArea y1={1} y2={2} fill="url(#moderateZone)" />
                        <ReferenceArea y1={2} y2={3} fill="url(#considerableZone)" />
                        <ReferenceArea y1={3} y2={4} fill="url(#highZone)" />
                        <ReferenceArea y1={4} y2={5} fill="url(#extremeZone)" />

                        <XAxis
                            dataKey="day"
                            stroke="#9ca3af"
                            style={{ fontSize: '0.75rem' }}
                            tick={{ fill: '#9ca3af' }}
                        />

                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '0.75rem' }}
                            tick={{ fill: '#9ca3af' }}
                            domain={[0, 5]}
                            ticks={[0, 1, 2, 3, 4, 5]}
                            tickFormatter={(value) => {
                                const labels = ['N/A', 'Low', 'Mod', 'Cons', 'High', 'Ext'];
                                return labels[value] || '';
                            }}
                            label={{
                                value: 'Danger Level',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9ca3af',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }}
                            iconType="line"
                        />

                        {/* Below Treeline line - Circle dots */}
                        <Line
                            type="monotone"
                            dataKey="belowTreeline"
                            name="Below Treeline"
                            stroke={getLineColor('belowTreeline')}
                            strokeWidth={3}
                            dot={{ r: 5, fill: getLineColor('belowTreeline'), stroke: '#1a1a1a', strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                        />

                        {/* Treeline line - Square dots */}
                        <Line
                            type="monotone"
                            dataKey="treeline"
                            name="Treeline"
                            stroke={getLineColor('treeline')}
                            strokeWidth={3}
                            dot={<CustomSquareDot color={getLineColor('treeline')} />}
                            activeDot={<CustomSquareDot color={getLineColor('treeline')} size={10} />}
                        />

                        {/* Alpine line - Diamond dots */}
                        <Line
                            type="monotone"
                            dataKey="alpine"
                            name="Alpine"
                            stroke={getLineColor('alpine')}
                            strokeWidth={3}
                            dot={<CustomDiamondDot color={getLineColor('alpine')} />}
                            activeDot={<CustomDiamondDot color={getLineColor('alpine')} size={10} />}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AvalancheTrendChart;
