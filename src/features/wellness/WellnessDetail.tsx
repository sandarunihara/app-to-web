import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, TrendingUp, MessageCircle } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { wellnessApi } from '../wellness/services/wellnessApi';
import { wellnessRecommendationApi } from '../wellness/services/wellnessRecommendationApi';
import type { WellnessTip, WellnessRecommendation } from '../../types/models';
// State management removed

export function WellnessDetail() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tips, setTips] = useState<WellnessTip[]>([]);
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'tips' | 'recommendations'>('tips');

  useEffect(() => {
    if (!category) return;
    loadWellnessData();
  }, [category]);

  const loadWellnessData = async () => {
    try {
      // Loading wellness content
      
      // Load tips for the category
      const tipsData = await wellnessApi.getTips(category as any);
      setTips(tipsData);

      // Load recommendations based on a default risk level (could be from user profile)
      const recsData = await wellnessRecommendationApi.getByRiskLevel('moderate');
      setRecommendations(recsData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load wellness content', 'error');
    } finally {
      // Done
    }
  };

  const getCategoryIcon = () => {
    switch (category?.toLowerCase()) {
      case 'diet':
        return '🥗';
      case 'exercise':
        return '💪';
      case 'sleep':
        return '😴';
      case 'stress':
        return '🧘';
      default:
        return '❤️';
    }
  };

  const getCategoryColor = () => {
    switch (category?.toLowerCase()) {
      case 'diet':
        return 'from-green-500 to-emerald-600';
      case 'exercise':
        return 'from-orange-500 to-red-600';
      case 'sleep':
        return 'from-indigo-500 to-purple-600';
      case 'stress':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-pink-500 to-rose-600';
    }
  };

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor()} text-white sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/wellness')} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="text-4xl mb-2">{getCategoryIcon()}</div>
              <h1 className="text-3xl font-bold capitalize">{category} Wellness</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-4 px-4 font-medium border-b-2 transition ${
                activeTab === 'tips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                Tips & Advice
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-4 px-4 font-medium border-b-2 transition ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart size={20} />
                Recommendations
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {tips.length > 0 ? (
              tips.map((tip) => (
                <div key={tip.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-gray-600 mb-4">{tip.description}</p>
                      
                      {tip.content && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-2">Content:</p>
                          <p className="text-sm text-blue-800">{tip.content}</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Category: <span className="font-medium text-gray-700 capitalize">{tip.category}</span></span>
                        <span>Created: {new Date(tip.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-600">No tips available for this category yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Wellness Tip</p>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{rec.description}</p>

                    {/* Recommendation Actions */}
                    <div className="space-y-3 mb-4">
                      {rec.description && (
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      )}
                      {false && [].map((action: any, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700">{action}</p>
                        </div>
                      ))}
                    </div>

                    {/* Risk Level Badge */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Risk Level: Moderate</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Priority: {rec.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-600">No recommendations available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Chat Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-8 border border-blue-100">
          <div className="flex items-center gap-4 mb-4">
            <MessageCircle size={32} className="text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need Personal Advice?</h3>
              <p className="text-gray-600">Chat with our AI wellness assistant</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/wellness/chatbot')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Open Chatbot
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/wellness')}
          className="mt-8 w-full py-3 px-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Wellness Dashboard
        </button>
      </div>
    </ScreenWrapper>
  );
}
