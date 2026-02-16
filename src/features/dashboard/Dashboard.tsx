import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Heart, Activity, AlertCircle, HelpCircle, TrendingUp, TrendingDown, Leaf,
    ArrowRight, BarChart3, Droplets, Wind
} from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS } from '../../config/theme.config';
import { JendoScoreChart } from './components/JendoScoreChart';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';
import { jendoTestApi, type JendoTest } from '../../services/jendoTestApi';
import { wellnessRecommendationApi, type WellnessRecommendation } from '../../services/wellnessRecommendationApi';

const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '--';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const formatShortDate = (dateString: string): string => {
    if (!dateString) return '--';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const capitalizeRiskLevel = (level: string): string => {
    if (!level) return 'Unknown';
    return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
};

const getRiskColor = (level: string): string => {
    switch (level?.toLowerCase()) {
        case 'low': return '#4CAF50';
        case 'moderate': return '#FF9800';
        case 'high': return '#F44336';
        default: return COLORS.textSecondary;
    }
};

const getRiskBg = (level: string): string => {
    switch (level?.toLowerCase()) {
        case 'low': return 'bg-green-50 border-green-200';
        case 'moderate': return 'bg-amber-50 border-amber-200';
        case 'high': return 'bg-red-50 border-red-200';
        default: return 'bg-gray-50 border-gray-200';
    }
};

const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
        case 'low': return <Activity size={20} color="#4CAF50" />;
        case 'moderate': return <AlertCircle size={20} color="#FF9800" />;
        case 'high': return <AlertCircle size={20} color="#F44336" />;
        default: return <HelpCircle size={20} color={COLORS.textSecondary} />;
    }
};

const calculateBMI = (weight?: number, height?: number): { value: string; status: string; color: string } => {
    if (!weight || !height) {
        return { value: '--', status: 'Not set', color: COLORS.textSecondary };
    }
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiValue = bmi.toFixed(1);

    if (bmi < 18.5) return { value: bmiValue, status: 'Underweight', color: '#FF9800' };
    if (bmi < 25) return { value: bmiValue, status: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { value: bmiValue, status: 'Overweight', color: '#FF9800' };
    return { value: bmiValue, status: 'Obese', color: '#F44336' };
};

const calculateProfileCompletion = (user: any): number => {
    if (!user) return 0;
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'nationality'];
    let completedFields = 0;
    for (const field of requiredFields) {
        if (user[field] !== undefined && user[field] !== null && user[field] !== '') completedFields++;
    }
    // Check health parameters too
    if (user.healthParameters?.weight) completedFields++;
    if (user.healthParameters?.height) completedFields++;
    const totalFields = requiredFields.length + 2; // +2 for weight and height
    return Math.round((completedFields / totalFields) * 100);
};

const calculateScoreTrend = (tests: JendoTest[]): string => {
    if (tests.length < 2) return '--';
    const recent = tests[0].score;
    const older = tests[tests.length - 1].score;
    const diff = ((recent - older) / older) * 100;
    if (diff > 0) return `+${diff.toFixed(1)}%`;
    return `${diff.toFixed(1)}%`;
};

const resolveUserId = (user: any): number | null => {
    const candidate = user?.userId ?? user?.authUserId ?? user?.id;
    const numeric = Number(candidate);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const hasShownCompleteToast = useRef(false);

    const [jendoTests, setJendoTests] = useState<JendoTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [wellnessRecommendations, setWellnessRecommendations] = useState<WellnessRecommendation[]>([]);

    const bmiData = useMemo(() => calculateBMI(user?.healthParameters?.weight, user?.healthParameters?.height), [user?.healthParameters?.weight, user?.healthParameters?.height]);
    const profileComplete = useMemo(() => calculateProfileCompletion(user), [user]);

    const fetchJendoTests = useCallback(async () => {
        const resolvedUserId = resolveUserId(user);
        if (!isAuthenticated || !resolvedUserId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const tests = await jendoTestApi.getTestsByUserId(resolvedUserId);
            const sortedTests = tests.sort((a, b) => {
                const dateTimeA = new Date(`${a.testDate}T${a.testTime || '00:00:00'}`).getTime();
                const dateTimeB = new Date(`${b.testDate}T${b.testTime || '00:00:00'}`).getTime();
                return dateTimeB - dateTimeA;
            });
            setJendoTests(sortedTests);
        } catch (error) {
            console.error('Failed to fetch Jendo tests:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        fetchJendoTests();
    }, [fetchJendoTests]);

    const fetchWellnessRecommendations = useCallback(async () => {
        const userId = resolveUserId(user);
        if (!userId) {
            setWellnessRecommendations([]);
            return;
        }
        try {
            const recommendations = await wellnessRecommendationApi.getForUser(userId);
            setWellnessRecommendations(recommendations.slice(0, 12));
        } catch (error) {
            console.error('Failed to fetch wellness recommendations:', error);
            setWellnessRecommendations([]);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchWellnessRecommendations();
    }, [fetchWellnessRecommendations]);

    useEffect(() => {
        if (profileComplete === 100 && !hasShownCompleteToast.current) {
            hasShownCompleteToast.current = true;
            showToast('Your profile is completed!', 'success');
        } else if (profileComplete < 100) {
            hasShownCompleteToast.current = false;
        }
    }, [profileComplete, showToast]);

    const latestTest = jendoTests[0] || null;
    const scoreHistory = useMemo(() => {
        return jendoTests.slice(0, 6).reverse().map(test => ({
            date: formatShortDate(test.testDate),
            value: test.score,
        }));
    }, [jendoTests]);

    const scoreTrend = useMemo(() => calculateScoreTrend(jendoTests.slice(0, 6)), [jendoTests]);
    const hasTestData = jendoTests.length > 0;

    const dashboardData = {
        userName: user?.firstName || 'User',
        profileComplete,
        riskLevel: latestTest ? capitalizeRiskLevel(latestTest.riskLevel) : 'Unknown',
        lastTestDate: latestTest ? formatDateForDisplay(latestTest.testDate) : 'No tests yet',
        scoreHistory,
        scoreTrend,
        healthOverview: {
            bloodPressure: {
                value: latestTest?.bloodPressure || '--',
                status: latestTest ? 'Recent' : 'No data',
            },
            spo2: {
                value: latestTest?.spo2 ? `${latestTest.spo2}%` : '--',
                status: latestTest?.spo2 ? (latestTest.spo2 >= 95 ? 'Normal' : 'Low') : 'No data',
                color: latestTest?.spo2 ? (latestTest.spo2 >= 95 ? '#4CAF50' : '#FF9800') : COLORS.textSecondary
            },
            bmi: { value: bmiData.value, status: bmiData.status, color: bmiData.color },
            heartRate: {
                value: latestTest?.heartRate ? `${latestTest.heartRate} bpm` : '--',
                status: latestTest?.heartRate ? 'Latest' : 'No data'
            },
        },
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Greeting Banner */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {getGreeting()}, {dashboardData.userName} 👋
                        </h1>
                        <p className="text-gray-500 mt-1">Here's your cardiovascular health summary</p>
                    </div>
                    {profileComplete < 100 && (
                        <button
                            onClick={() => navigate('/profile/personal')}
                            className="flex items-center gap-3 bg-white border border-purple-200 rounded-xl px-5 py-3 hover:shadow-md transition-all group"
                        >
                            <div className="relative w-10 h-10">
                                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7B2D8E" strokeWidth="3"
                                        strokeDasharray={`${profileComplete}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-purple-700">{profileComplete}%</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">Complete Profile</p>
                                <p className="text-xs text-gray-400">Fill in your details</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform ml-2" />
                        </button>
                    )}
                </div>

                {/* Top Cards Row */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-100">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Risk Level Card */}
                        <div className={`rounded-xl p-6 border ${getRiskBg(dashboardData.riskLevel)} transition-shadow hover:shadow-md`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                                {getRiskIcon(dashboardData.riskLevel)}
                            </div>
                            <p className="text-3xl font-bold" style={{ color: getRiskColor(dashboardData.riskLevel) }}>
                                {dashboardData.riskLevel}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Last test: {dashboardData.lastTestDate}</p>
                        </div>

                        {/* Latest Score Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-500">Jendo Score</p>
                                <BarChart3 size={20} className="text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{latestTest?.score ?? '--'}</p>
                            {hasTestData && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    {scoreTrend.startsWith('+')
                                        ? <TrendingUp size={14} className="text-green-500" />
                                        : <TrendingDown size={14} className="text-red-500" />}
                                    <span className={`text-xs font-semibold ${scoreTrend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                        {scoreTrend} from history
                                    </span>
                                </div>
                            )}
                            {!hasTestData && <p className="text-xs text-gray-400 mt-1">No tests taken yet</p>}
                        </div>

                        {/* BMI Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-500">Body Mass Index</p>
                                <User size={20} className="text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{dashboardData.healthOverview.bmi.value}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dashboardData.healthOverview.bmi.color }}></span>
                                <span className="text-xs font-medium" style={{ color: dashboardData.healthOverview.bmi.color }}>
                                    {dashboardData.healthOverview.bmi.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Score History — takes 2 cols */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Score History</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Your Jendo test scores over time</p>
                            </div>
                            {hasTestData && (
                                <button onClick={() => navigate('/tests')} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                    View all <ArrowRight size={14} />
                                </button>
                            )}
                        </div>

                        {hasTestData && scoreHistory.length > 0 ? (
                            <JendoScoreChart data={scoreHistory} />
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center text-gray-400">
                                <Activity size={40} className="mb-3 opacity-40" />
                                <p className="text-sm">No test history yet. Take your first test to see scores here.</p>
                            </div>
                        )}
                    </div>

                    {/* Health Vitals — takes 1 col */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Health Vitals</h3>
                        <p className="text-xs text-gray-400 mb-5">Latest readings from your tests</p>

                        <div className="space-y-4">
                            {/* Blood Pressure */}
                            <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <Heart size={18} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">Blood Pressure</p>
                                    <p className="text-lg font-bold text-gray-900">{dashboardData.healthOverview.bloodPressure.value}</p>
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">{dashboardData.healthOverview.bloodPressure.status}</span>
                            </div>

                            {/* SpO2 */}
                            <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Droplets size={18} className="text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">SpO2</p>
                                    <p className="text-lg font-bold text-gray-900">{dashboardData.healthOverview.spo2.value}</p>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-md"
                                    style={{
                                        color: dashboardData.healthOverview.spo2.color,
                                        backgroundColor: dashboardData.healthOverview.spo2.status === 'Normal' ? '#E8F5E9' : '#FFF3E0'
                                    }}>
                                    {dashboardData.healthOverview.spo2.status}
                                </span>
                            </div>

                            {/* Heart Rate */}
                            <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Wind size={18} className="text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">Heart Rate</p>
                                    <p className="text-lg font-bold text-gray-900">{dashboardData.healthOverview.heartRate.value}</p>
                                </div>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{dashboardData.healthOverview.heartRate.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wellness Recommendations */}
                {wellnessRecommendations.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Personalized Tips</h3>
                                <p className="text-xs text-gray-400 mt-0.5">AI-powered recommendations for your health</p>
                            </div>
                            <button onClick={() => navigate('/wellness')} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                View all <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {wellnessRecommendations.slice(0, 6).map((rec, index) => (
                                <div
                                    key={rec.id || index}
                                    className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all hover:border-purple-100 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Leaf size={18} className="text-purple-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-purple-700 transition-colors">{rec.title}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{rec.description}</p>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                                                    {rec.category || 'Wellness'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
