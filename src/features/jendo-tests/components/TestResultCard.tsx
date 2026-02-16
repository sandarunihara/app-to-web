import React from 'react';
import { Activity, Clock, Calendar, ChevronRight } from 'lucide-react';
import type { JendoTest } from '../../../services/jendoTestApi';
import { COLORS } from '../../../config/theme.config';

interface TestResultCardProps {
    test: JendoTest;
    onClick?: (test: JendoTest) => void;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ test, onClick }) => {
    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low': return COLORS.riskLow;
            case 'moderate': return COLORS.riskModerate;
            case 'high': return COLORS.riskHigh;
            default: return COLORS.textSecondary;
        }
    };

    const getRiskBgColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low': return COLORS.riskLowBg;
            case 'moderate': return COLORS.riskModerateBg;
            case 'high': return COLORS.riskHighBg;
            default: return '#f3f4f6';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div
            onClick={() => onClick && onClick(test)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Jendo Health Check</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatDate(test.testDate)}</span>
                            <Clock size={12} className="ml-1" />
                            <span>{test.testTime}</span>
                        </div>
                    </div>
                </div>
                <div
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                        backgroundColor: getRiskBgColor(test.riskLevel),
                        color: getRiskColor(test.riskLevel)
                    }}
                >
                    {test.riskLevel} Risk
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 mb-1">Score</div>
                    <div className="font-bold text-gray-900 text-lg">{test.score}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 mb-1">BP</div>
                    <div className="font-bold text-gray-900 text-lg">{test.bloodPressure || '--'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                    <div className="font-bold text-gray-900 text-lg">{test.heartRate || '--'}</div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-purple-700 font-medium group-hover:underline">
                <span>View Full Report</span>
                <ChevronRight size={16} />
            </div>
        </div>
    );
};
