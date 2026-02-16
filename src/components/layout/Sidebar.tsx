import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Stethoscope,
    Activity,
    FileText,
    Heart,
    BookOpen,
    User,
    LogOut,
    X,
    Settings
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/doctors', label: 'Doctors', icon: Stethoscope },
        { path: '/tests', label: 'Jendo Tests', icon: Activity },
        { path: '/wellness', label: 'Wellness', icon: Heart },
        { path: '/records', label: 'Medical Records', icon: FileText },
        { path: '/learning', label: 'Learning', icon: BookOpen },
    ];

    const bottomItems = [
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/profile/security', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-white transition-transform duration-300 transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none border-r border-gray-200/80 flex flex-col`}
            >
                {/* Logo / Header */}
                <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-base shadow-md shadow-purple-200">
                            J
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-tight">Jendo Health</h1>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Cardiovascular Care</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
                    <div className="space-y-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 relative
                                        ${isActive
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-purple-600 rounded-r-full" />
                                            )}
                                            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                                            <span>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                        <div className="space-y-0.5">
                            {bottomItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150
                                            ${isActive
                                                ? 'bg-purple-50 text-purple-700'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Footer / User Card + Logout */}
                <div className="border-t border-gray-100 p-3">
                    {/* User Card */}
                    <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg bg-gray-50/80">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate leading-tight">
                                {user?.firstName || 'User'} {user?.lastName || ''}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate leading-tight">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
