import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, Clock, Search, Bookmark, BookOpen, ArrowRight } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { learningApi } from './services/learningApi';
import { useToast } from '../../providers/ToastProvider';
import type { LearningMaterial } from '../../types/models';

export const LearningFeed: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const data = await learningApi.getAllMaterials();
                setMaterials(data);
            } catch (error: any) {
                showToast(error.message || 'Failed to fetch learning materials', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const categories = ['All', ...(materials ? Array.from(new Set(materials.map(m => m.category || 'Other'))) : ['Heart Health', 'Fitness', 'Nutrition', 'Mental Health'])];

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            showToast('Added to bookmarks', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to bookmark', 'error');
        }
    };

    const featuredItem = filteredMaterials[0];
    const restItems = filteredMaterials.slice(1);

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Health Learning</h1>
                        <p className="text-sm text-gray-500 mt-1">Educational resources for a healthier you</p>
                    </div>
                    {!loading && (
                        <p className="text-sm text-gray-400 font-medium">{filteredMaterials.length} resources available</p>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search articles, videos..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-purple-700 text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Materials */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
                                <div className="h-44 bg-gray-100 animate-pulse"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-50 rounded w-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMaterials.length > 0 ? (
                    <div className="space-y-6">
                        {/* Featured Item */}
                        {featuredItem && (
                            <div
                                onClick={() => navigate(`/learning/${featuredItem.id}`)}
                                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group grid grid-cols-1 lg:grid-cols-2"
                            >
                                <div className="relative h-56 lg:h-auto overflow-hidden bg-gray-100">
                                    {featuredItem.thumbnailUrl ? (
                                        <img
                                            src={featuredItem.thumbnailUrl}
                                            alt={featuredItem.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center min-h-[200px]">
                                            <BookOpen size={48} className="text-purple-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                                        Featured
                                    </div>
                                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md flex items-center gap-1">
                                        {featuredItem.type === 'video' ? <PlayCircle size={12} /> : <FileText size={12} />}
                                        <span className="capitalize">{featuredItem.type}</span>
                                    </div>
                                </div>
                                <div className="p-6 lg:p-8 flex flex-col justify-center">
                                    {featuredItem.category && (
                                        <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-2">{featuredItem.category}</span>
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">{featuredItem.title}</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{featuredItem.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{featuredItem.author || 'Unknown'}</span>
                                        {featuredItem.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>{featuredItem.duration} min read</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-sm text-purple-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read More <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rest of the Grid */}
                        {restItems.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {restItems.map(material => (
                                    <div
                                        key={material.id}
                                        onClick={() => navigate(`/learning/${material.id}`)}
                                        className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all group cursor-pointer"
                                    >
                                        <div className="relative h-44 overflow-hidden bg-gray-100">
                                            {material.thumbnailUrl ? (
                                                <img
                                                    src={material.thumbnailUrl}
                                                    alt={material.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                                                    <BookOpen size={32} className="text-purple-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                                                {material.type === 'video' ? <PlayCircle size={11} /> : <FileText size={11} />}
                                                <span className="capitalize">{material.type}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleBookmark(e)}
                                                className="absolute top-3 left-3 p-1.5 bg-white/90 hover:bg-white rounded-lg transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Bookmark size={14} className="text-purple-600" />
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            {material.category && (
                                                <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">{material.category}</span>
                                            )}
                                            <h3 className="font-bold text-gray-900 text-sm mt-1.5 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                                {material.title}
                                            </h3>
                                            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
                                                {material.description}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                                                <span className="truncate">{material.author || 'Unknown'}</span>
                                                {material.duration && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Clock size={11} />
                                                        <span>{material.duration} min</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-base mb-4">No materials found matching your search.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('All');
                            }}
                            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
