import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const WindChart = ({ hourlyData, elevation, timeRange = 24 }) => {
    // Transform data for chart
    const chartData = hourlyData.time.slice(0, timeRange).map((time, idx) => {
        const hour = new Date(time);
        let timeLabel;

        // Include date for multi-day views
        if (timeRange > 24) {
            timeLabel = hour.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                hour12: true
            });
        } else {
            timeLabel = hour.toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
            });
        }

        return {
            time: timeLabel,
            speed: Math.round(hourlyData.wind_speed_10m[idx]),
            gusts: Math.round(hourlyData.wind_gusts_10m[idx]),
            direction: hourlyData.wind_direction_10m[idx]
        };
    });

    // Helper: Convert degrees to compass direction
    const getWindDirection = (degrees) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const speedData = payload.find(p => p.dataKey === 'speed');
            const gustsData = payload.find(p => p.dataKey === 'gusts');
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
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                        {data.time}
                    </p>
                    {speedData && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 'bold' }}>
                            Speed: {speedData.value} km/h
                        </p>
                    )}
                    {gustsData && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#f87171' }}>
                            Gusts: {gustsData.value} km/h
                        </p>
                    )}
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#fbbf24' }}>
                        Direction: {getWindDirection(data.direction)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-3">
            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255, 255, 255, 0.1)"
                        />

                        <XAxis
                            dataKey="time"
                            stroke="#9ca3af"
                            style={{ fontSize: '0.7rem' }}
                            tick={{ fill: '#9ca3af' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />

                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '0.7rem' }}
                            tick={{ fill: '#9ca3af' }}
                            label={{
                                value: 'Wind Speed (km/h)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9ca3af',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* High wind warning line */}
                        <ReferenceLine
                            y={40}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                                value: 'High Wind',
                                fill: '#ef4444',
                                fontSize: 10,
                                position: 'right'
                            }}
                        />

                        {/* Wind speed line */}
                        <Line
                            type="monotone"
                            dataKey="speed"
                            stroke="#60a5fa"
                            strokeWidth={2.5}
                            dot={{ fill: '#60a5fa', r: 4 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* Gusts line */}
                        <Line
                            type="monotone"
                            dataKey="gusts"
                            stroke="#f87171"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="d-flex gap-4 justify-content-center mt-3" style={{ fontSize: '0.7rem' }}>
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '3px',
                            backgroundColor: '#60a5fa',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Wind Speed</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '2px',
                            background: 'repeating-linear-gradient(to right, #f87171 0, #f87171 5px, transparent 5px, transparent 10px)',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Gusts</span>
                </div>
            </div>
        </div>
    );
};

export default WindChart;
