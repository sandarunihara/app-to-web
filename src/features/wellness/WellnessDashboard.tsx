import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Award, TrendingUp, Sun, Moon, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { wellnessApi } from './services/wellnessApi';
import { wellnessRecommendationApi } from './services/wellnessRecommendationApi';
import { useToast } from '../../providers/ToastProvider';
import type { WellnessTip, WellnessRecommendation } from '../../types/models';

export const WellnessDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [tips, setTips] = useState<WellnessTip[]>([]);
    const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWellnessData();
    }, []);

    const loadWellnessData = async () => {
        try {
            setLoading(true);
            const tipsData = await wellnessApi.getTips();
            setTips(tipsData);

            const recsData = await wellnessRecommendationApi.getByRiskLevel('moderate');
            setRecommendations(recsData);
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

                {/* Featured Tips */}
                {!loading && tips.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-purple-500" />
                                <h3 className="text-base font-bold text-gray-900">Featured Tips</h3>
                            </div>
                            <button
                                onClick={() => navigate('/wellness/diet')}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                See all <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {tips.slice(0, 3).map((tip) => (
                                <div key={tip.id} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all">
                                    <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{tip.description}</p>
                                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 uppercase tracking-wider">
                                        {tip.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {!loading && recommendations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Award size={18} className="text-blue-500" />
                            <h3 className="text-base font-bold text-gray-900">Health Recommendations</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {recommendations.slice(0, 3).map((rec) => (
                                <div key={rec.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200/60 hover:shadow-md transition-all">
                                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{rec.description}</p>
                                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-green-100 text-green-700 capitalize tracking-wider">
                                        {rec.category || 'wellness'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && tips.length === 0 && recommendations.length === 0 && (
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
