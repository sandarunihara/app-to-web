import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../../config/theme.config';

interface ScoreHistoryItem {
    date: string;
    value: number;
}

interface JendoScoreChartProps {
    data: ScoreHistoryItem[];
    containerStyle?: React.CSSProperties;
}

export const JendoScoreChart: React.FC<JendoScoreChartProps> = ({ data, containerStyle }) => {
    // Guard against empty or invalid data
    const isValidData = data && data.length > 0 && data.every(item =>
        typeof item.value === 'number' && !isNaN(item.value) && item.date
    );

    const chartData = useMemo(() => {
        if (!isValidData) return [];
        return data.map(item => ({
            ...item,
            formattedDate: item.date, // Already formatted short date
        }));
    }, [data, isValidData]);

    if (!isValidData || chartData.length === 0) {
        return (
            <div style={{
                height: 180,
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...containerStyle
            }}>
                <span style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                    No score data available
                </span>
            </div>
        );
    }

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values) + 10;
    const minValue = Math.max(0, Math.min(...values) - 10);

    return (
        <div style={{
            height: 180,
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: '16px 16px 0 0', // Right padding less for chart
            ...containerStyle
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="formattedDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: COLORS.textSecondary, fontSize: 10, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: COLORS.textSecondary, fontSize: 11, fontWeight: 500 }}
                        domain={[minValue, maxValue]}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: COLORS.white,
                            borderRadius: 12,
                            border: `1px solid ${COLORS.primary}`,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 20 }}
                        labelStyle={{ color: COLORS.textMuted, fontSize: 10, marginBottom: 4 }}
                        formatter={(value: any) => [value, 'Score']}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        dot={{ r: 4, fill: COLORS.primary, stroke: COLORS.white, strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: COLORS.primary, stroke: COLORS.white, strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
