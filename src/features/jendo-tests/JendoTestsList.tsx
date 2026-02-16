import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity, Calendar, Heart, ArrowRight } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { jendoTestApi, type JendoTest } from '../../services/jendoTestApi';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';

const resolveUserId = (user: any): number | null => {
    const candidate = user?.userId ?? user?.authUserId ?? user?.id;
    const numeric = Number(candidate);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
};

export const JendoTestsList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [tests, setTests] = useState<JendoTest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            const userId = resolveUserId(user);
            if (!userId) return;
            try {
                setLoading(true);
                const data = await jendoTestApi.getTestsByUserId(userId);
                const sorted = data.sort((a, b) =>
                    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
                );
                setTests(sorted);
            } catch (error: any) {
                showToast(error.message || 'Failed to fetch tests', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [user]);

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high': return 'bg-red-50 text-red-700 border-red-200';
            case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Jendo Tests</h1>
                        <p className="text-sm text-gray-500 mt-1">Track your cardiovascular health history</p>
                    </div>
                    <button
                        onClick={() => showToast('Take new test feature coming soon', 'info')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} />
                        <span>New Test</span>
                    </button>
                </div>

                {/* Tests List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {tests.map(test => (
                            <div
                                key={test.id}
                                onClick={() => navigate(`/jendo-reports/${test.id}`)}
                                className="bg-white rounded-xl border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                                <Heart size={18} className="text-red-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">Jendo Test</h3>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar size={11} />
                                                    {new Date(test.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${getRiskColor(test.riskLevel)}`}>
                                            {test.riskLevel}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Blood Pressure</p>
                                            <p className="text-base font-bold text-gray-900 mt-0.5">
                                                {test.bloodPressureSystolic}/{test.bloodPressureDiastolic}
                                            </p>
                                        </div>
                                        {test.heartRate && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Heart Rate</p>
                                                <p className="text-base font-bold text-gray-900 mt-0.5">{test.heartRate} bpm</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">Score: <span className="font-bold text-gray-700">{test.score}</span></span>
                                        <span className="text-xs text-purple-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                            View Details <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Activity size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No tests found</h3>
                        <p className="text-gray-400 text-center max-w-sm mt-1 mb-6 text-sm">
                            You haven't taken any Jendo tests yet. Start your first test to monitor your heart health.
                        </p>
                        <button
                            onClick={() => showToast('Take new test feature coming soon', 'info')}
                            className="px-6 py-2.5 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
                        >
                            Take First Test
                        </button>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
