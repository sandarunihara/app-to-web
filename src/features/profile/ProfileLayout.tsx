import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, Shield, Activity } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useAuth } from '../../providers/AuthProvider';

export const ProfileLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/profile/personal', label: 'Personal Details', icon: User },
        { path: '/profile/health', label: 'Health Profile', icon: Activity },
        { path: '/profile/security', label: 'Security', icon: Shield },
    ];

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <ScreenWrapper>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        {/* User Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center border border-gray-100">
                            <div className="relative inline-block mb-4">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-50"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold border-4 border-purple-50 mx-auto">
                                        {getInitials(user?.firstName || '', user?.lastName || '')}
                                    </div>
                                )}
                                {/* <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors shadow-sm">
                                    <Camera size={16} />
                                </button> */}
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                            <div className="mt-3 inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                                Member
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-h-[500px]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ScreenWrapper>
    );
};
