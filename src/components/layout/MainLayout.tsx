import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../providers/AuthProvider';
import { ScreenWrapper } from './ScreenWrapper';

const getBreadcrumb = (pathname: string): { label: string; parent?: string } => {
    const segments = pathname.split('/').filter(Boolean);
    const map: Record<string, string> = {
        dashboard: 'Dashboard',
        doctors: 'Doctors',
        tests: 'Jendo Tests',
        'jendo-reports': 'Jendo Tests',
        wellness: 'Wellness',
        records: 'Medical Records',
        'my-reports': 'Medical Records',
        learning: 'Learning',
        profile: 'Profile',
        notifications: 'Notifications',
    };
    const primary = map[segments[0]] || segments[0] || 'Dashboard';
    if (segments.length > 1) {
        const sub = map[segments[1]] || segments[1];
        return { label: sub.charAt(0).toUpperCase() + sub.slice(1), parent: primary };
    }
    return { label: primary };
};

export const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const breadcrumb = getBreadcrumb(location.pathname);

    return (
        <ScreenWrapper className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3 flex items-center justify-between z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden focus:outline-none transition-colors"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-1.5 text-sm">
                            {breadcrumb.parent && (
                                <>
                                    <span className="text-gray-400 font-medium">{breadcrumb.parent}</span>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </>
                            )}
                            <span className="text-gray-700 font-semibold">{breadcrumb.label}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 md:hidden">Jendo</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="hidden lg:flex items-center bg-gray-100/80 rounded-lg px-3 py-2 w-64 group focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:bg-white transition-all border border-transparent focus-within:border-purple-200">
                            <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                            />
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={() => navigate('/notifications')}
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-gray-200"></div>

                        {/* User Avatar */}
                        <div
                            className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => navigate('/profile')}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt="User" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{user?.firstName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-700 leading-tight">
                                    {user?.firstName || 'User'} {user?.lastName?.charAt(0) ? `${user.lastName.charAt(0)}.` : ''}
                                </p>
                                <p className="text-xs text-gray-400 leading-tight">{user?.email ? user.email.split('@')[0] : 'Account'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </ScreenWrapper>
    );
};
