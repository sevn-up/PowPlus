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

const HourlyForecastChart = ({ hourlyData, elevation }) => {
    // Transform data for chart
    const chartData = hourlyData.time.slice(0, 24).map((time, idx) => {
        const hour = new Date(time);
        const timeLabel = hour.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });

        return {
            time: timeLabel,
            temp: Math.round(hourlyData.temperature_2m[idx]),
            feels: hourlyData.apparent_temperature
                ? Math.round(hourlyData.apparent_temperature[idx])
                : Math.round(hourlyData.temperature_2m[idx])
        };
    });

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            // Find the correct values by dataKey to prevent misalignment
            const tempData = payload.find(p => p.dataKey === 'temp');
            const feelsData = payload.find(p => p.dataKey === 'feels');

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
                        {payload[0].payload.time}
                    </p>
                    {tempData && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>
                            Temp: {tempData.value}°C
                        </p>
                    )}
                    {feelsData && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#fbbf24' }}>
                            Feels: {feelsData.value}°C
                        </p>
                    )}
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
                        />

                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '0.7rem' }}
                            tick={{ fill: '#9ca3af' }}
                            label={{
                                value: 'Temperature (°C)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9ca3af',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Freezing line reference */}
                        <ReferenceLine
                            y={0}
                            stroke="#6bcf7f"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                                value: 'Freezing',
                                fill: '#6bcf7f',
                                fontSize: 10,
                                position: 'right'
                            }}
                        />

                        {/* Temperature line */}
                        <Line
                            type="monotone"
                            dataKey="temp"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* Feels-like line */}
                        <Line
                            type="monotone"
                            dataKey="feels"
                            stroke="#fbbf24"
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
                            backgroundColor: '#3b82f6',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Temperature</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '2px',
                            background: 'repeating-linear-gradient(to right, #fbbf24 0, #fbbf24 5px, transparent 5px, transparent 10px)',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Feels Like</span>
                </div>
            </div>
        </div>
    );
};

export default HourlyForecastChart;
