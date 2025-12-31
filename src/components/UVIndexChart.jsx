import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const UVIndexChart = ({ hourlyData, elevation, timeRange = 24 }) => {
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
            uv: hourlyData.uv_index ? hourlyData.uv_index[idx] : 0
        };
    });

    // Helper: Get UV risk level and color
    const getUVRiskLevel = (uv) => {
        if (uv < 3) return { level: 'Low', color: '#22c55e' };
        if (uv < 6) return { level: 'Moderate', color: '#fbbf24' };
        if (uv < 8) return { level: 'High', color: '#f97316' };
        if (uv < 11) return { level: 'Very High', color: '#ef4444' };
        return { level: 'Extreme', color: '#a855f7' };
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const risk = getUVRiskLevel(data.uv);

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
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: risk.color, fontWeight: 'bold' }}>
                        UV Index: {data.uv.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: risk.color }}>
                        Risk: {risk.level}
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
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                                <stop offset="30%" stopColor="#ef4444" stopOpacity={0.6} />
                                <stop offset="60%" stopColor="#f97316" stopOpacity={0.4} />
                                <stop offset="80%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>

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
                            domain={[0, 12]}
                            label={{
                                value: 'UV Index',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9ca3af',
                                style: { fontSize: '0.7rem' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Risk zone reference lines */}
                        <ReferenceLine
                            y={3}
                            stroke="#22c55e"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                        />
                        <ReferenceLine
                            y={6}
                            stroke="#fbbf24"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                        />
                        <ReferenceLine
                            y={8}
                            stroke="#f97316"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                        />
                        <ReferenceLine
                            y={11}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                        />

                        {/* UV Index area */}
                        <Area
                            type="monotone"
                            dataKey="uv"
                            stroke="#a855f7"
                            strokeWidth={2}
                            fill="url(#uvGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="d-flex gap-3 justify-content-center mt-3 flex-wrap" style={{ fontSize: '0.65rem' }}>
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '2px' }}></div>
                    <span className="text-white-50">Low (0-2)</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#fbbf24', borderRadius: '2px' }}></div>
                    <span className="text-white-50">Moderate (3-5)</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '2px' }}></div>
                    <span className="text-white-50">High (6-7)</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                    <span className="text-white-50">Very High (8-10)</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#a855f7', borderRadius: '2px' }}></div>
                    <span className="text-white-50">Extreme (11+)</span>
                </div>
            </div>
        </div>
    );
};

export default UVIndexChart;
