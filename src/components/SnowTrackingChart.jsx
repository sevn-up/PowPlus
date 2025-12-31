import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const SnowTrackingChart = ({ hourlyData, elevation, timeRange = 24 }) => {
    // Transform data for chart with running total
    let runningTotal = 0;
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

        const hourlySnow = hourlyData.snowfall ? hourlyData.snowfall[idx] : 0;
        runningTotal += hourlySnow;

        return {
            time: timeLabel,
            snowfall: Math.round(hourlySnow * 10) / 10, // Round to 1 decimal
            accumulation: Math.round(runningTotal * 10) / 10,
            probability: hourlyData.precipitation_probability ? hourlyData.precipitation_probability[idx] : 0
        };
    });

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
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                        {data.time}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#93c5fd', fontWeight: 'bold' }}>
                        Snowfall: {data.snowfall} cm
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#6366f1' }}>
                        Total: {data.accumulation} cm
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#fbbf24' }}>
                        Chance: {data.probability}%
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
                    <ComposedChart
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
                            yAxisId="left"
                            stroke="#9ca3af"
                            style={{ fontSize: '0.7rem' }}
                            tick={{ fill: '#9ca3af' }}
                            label={{
                                value: 'Snowfall (cm)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9ca3af',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#6366f1"
                            style={{ fontSize: '0.7rem' }}
                            tick={{ fill: '#6366f1' }}
                            label={{
                                value: 'Total (cm)',
                                angle: 90,
                                position: 'insideRight',
                                fill: '#6366f1',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Powder threshold reference */}
                        <ReferenceLine
                            yAxisId="left"
                            y={2}
                            stroke="#fbbf24"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                                value: 'Heavy Snow',
                                fill: '#fbbf24',
                                fontSize: 10,
                                position: 'right'
                            }}
                        />

                        {/* Hourly snowfall bars */}
                        <Bar
                            yAxisId="left"
                            dataKey="snowfall"
                            fill="url(#snowGradient)"
                            radius={[4, 4, 0, 0]}
                        />

                        {/* Accumulation line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="accumulation"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            dot={{ fill: '#6366f1', r: 4 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* Gradient for bars */}
                        <defs>
                            <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="d-flex gap-4 justify-content-center mt-3" style={{ fontSize: '0.7rem' }}>
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '12px',
                            height: '12px',
                            background: 'linear-gradient(to bottom, #93c5fd, #3b82f6)',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Hourly Snowfall</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '3px',
                            backgroundColor: '#6366f1',
                            borderRadius: '2px'
                        }}
                    ></div>
                    <span className="text-white-50">Total Accumulation</span>
                </div>
            </div>
        </div>
    );
};

export default SnowTrackingChart;
