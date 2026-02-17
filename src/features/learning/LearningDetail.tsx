import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2, Bookmark } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { learningApi } from '../learning/services/learningApi';
import type { LearningMaterial } from '../../types/models';

/**
 * Convert various YouTube URL formats to an embeddable URL.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
 */
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId: string | null = null;

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url.split('?')[0];

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) videoId = shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  if (!videoId) {
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (longMatch) videoId = longMatch[1];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export function LearningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadMaterial();
  }, [id]);

  const loadMaterial = async () => {
    try {
      // Loading material
      const data = await learningApi.getMaterialById(id!);
      setMaterial(data);
      // isBookmarked will be handled as false for now
    } catch (error: any) {
      showToast(error.message || 'Failed to load material', 'error');
      navigate('/learning');
    } finally {
      // Done
    }
  };

  const handleBookmark = async () => {
    if (!material) return;
    try {
      // Bookmark functionality not available in API yet
      setIsBookmarked(!isBookmarked);
      showToast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update bookmark', 'error');
    } finally {
      // Done
    }
  };

  const handleShare = async () => {
    if (!material) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: material.title,
          text: material.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard', 'success');
      } catch (error) {
        showToast('Failed to share', 'error');
      }
    }
  };

  if (!material) {
    return (
      <ScreenWrapper className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </ScreenWrapper>
    );
  }

  const isVideo = material.type?.toUpperCase() === 'VIDEO';
  const isArticle = material.type?.toUpperCase() === 'ARTICLE';
  const embedUrl = isVideo && material.videoUrl ? getYouTubeEmbedUrl(material.videoUrl) : null;

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/learning')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Learning Material</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Content Preview */}
        {/* Video / Image Preview */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {isVideo && embedUrl ? (
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`${embedUrl}?autoplay=1&rel=0`}
                title={material.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : isVideo && material.videoUrl ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <a
                href={material.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-lg hover:underline"
              >
                ▶ Open video in new tab
              </a>
            </div>
          ) : isArticle && material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <div className="text-6xl">📚</div>
            </div>
          )}
        </div>

        {/* Title & Meta */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{material.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-gray-600 mb-4">
                {material.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    <span>{material.duration} min read</span>
                  </div>
                )}
                {material.author && (
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-green-500" />
                    <span>By {material.author}</span>
                  </div>
                )}
                {material.publishedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {new Date(material.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Category & Difficulty */}
              <div className="flex flex-wrap gap-3">
                {material.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {material.category}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition ${isBookmarked
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Bookmark size={24} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{material.description}</p>
        </div>

        {/* Content */}
        {material.content && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Content</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {material.content}
            </div>
          </div>
        )}

        {/* Back & More */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/learning')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-medium"
          >
            Back to Learning
          </button>
          <button
            onClick={() => navigate('/wellness/chatbot')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Ask for Help
          </button>
        </div>
      </div>


    </ScreenWrapper>
  );
}
