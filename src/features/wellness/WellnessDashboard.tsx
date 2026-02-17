import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Award, TrendingUp, Sun, Moon, MessageCircle } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { wellnessRecommendationApi } from '../../services/wellnessRecommendationApi';
import type { DailyAiTipsResponse } from '../../services/wellnessRecommendationApi';
import { useToast } from '../../providers/ToastProvider';
import { useAuth } from '../../providers/AuthProvider';

export const WellnessDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [dailyTips, setDailyTips] = useState<DailyAiTipsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWellnessData();
    }, [user]);

    const loadWellnessData = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            const tipsData = await wellnessRecommendationApi.getDailyAiTipsForUser(userId);
            setDailyTips(tipsData);
        } catch (error: any) {
            showToast(error.message || 'Failed to load wellness data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'diet', label: 'Diet & Nutrition', icon: Leaf, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', textColor: 'text-green-700' },
        { id: 'exercise', label: 'Exercise', icon: TrendingUp, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', textColor: 'text-orange-700' },
        { id: 'sleep', label: 'Sleep Quality', icon: Moon, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', textColor: 'text-blue-700' },
        { id: 'stress', label: 'Stress Management', icon: Sun, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', textColor: 'text-yellow-700' },
    ];

    return (
        <ScreenWrapper>
            <div className="space-y-8">
                {/* Hero / Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Wellness Center</h1>
                        <p className="text-sm text-gray-500 mt-1">Personalized health recommendations tailored for you</p>
                    </div>
                    <button
                        onClick={() => navigate('/wellness/chatbot')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
                    >
                        <MessageCircle size={16} />
                        <span>AI Health Chat</span>
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/wellness/${cat.id}`)}
                            className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:shadow-md hover:border-purple-100 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <cat.icon size={22} className={cat.textColor} />
                            </div>
                            <span className="font-medium text-gray-700 text-sm">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3 animate-pulse"></div>
                                <div className="h-3 bg-gray-50 rounded w-full mb-2 animate-pulse"></div>
                                <div className="h-3 bg-gray-50 rounded w-3/4 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Daily AI Tips by Category */}
                {!loading && dailyTips && (
                    <>
                        {/* Diet Tips */}
                        {dailyTips.diet && dailyTips.diet.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Leaf size={18} className="text-green-500" />
                                    <h3 className="text-base font-bold text-gray-900">Diet & Nutrition</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dailyTips.diet.map((tip, index) => (
                                        <div key={`diet-${index}`} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-green-100 transition-all">
                                            <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-3">{tip.description}</p>
                                            {tip.longDescription && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{tip.longDescription}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exercise Tips */}
                        {dailyTips.exercise && dailyTips.exercise.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp size={18} className="text-orange-500" />
                                    <h3 className="text-base font-bold text-gray-900">Exercise</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dailyTips.exercise.map((tip, index) => (
                                        <div key={`exercise-${index}`} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all">
                                            <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-3">{tip.description}</p>
                                            {tip.longDescription && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{tip.longDescription}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sleep Tips */}
                        {dailyTips.sleep && dailyTips.sleep.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Moon size={18} className="text-blue-500" />
                                    <h3 className="text-base font-bold text-gray-900">Sleep Quality</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dailyTips.sleep.map((tip, index) => (
                                        <div key={`sleep-${index}`} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all">
                                            <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-3">{tip.description}</p>
                                            {tip.longDescription && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{tip.longDescription}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stress Management Tips */}
                        {dailyTips.stress && dailyTips.stress.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sun size={18} className="text-yellow-500" />
                                    <h3 className="text-base font-bold text-gray-900">Stress Management</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dailyTips.stress.map((tip, index) => (
                                        <div key={`stress-${index}`} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-yellow-100 transition-all">
                                            <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-3">{tip.description}</p>
                                            {tip.longDescription && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{tip.longDescription}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && !dailyTips && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <Award size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No recommendations available at the moment.</p>
                    </div>
                )}

                {/* Chatbot CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <MessageCircle size={28} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold mb-1">Need Personalized Advice?</h3>
                            <p className="text-blue-100 text-sm">Chat with our AI wellness assistant for custom health recommendations based on your profile</p>
                        </div>
                        <button
                            onClick={() => navigate('/wellness/chatbot')}
                            className="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex-shrink-0 shadow-lg"
                        >
                            Start Chat →
                        </button>
                    </div>
                </div>
            </div>
        </ScreenWrapper>
    );
};
