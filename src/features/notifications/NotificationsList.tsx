import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    BellOff,
    TrendingUp,
    Activity,
    Calendar,
    Heart,
    Stethoscope,
    BookOpen,
    Info,
    CheckCheck,
    Trash2,
} from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';
import { notificationApi, type NotificationResponse } from './services/notificationApi';

type NotificationType = string;

const getNotificationIcon = (type: NotificationType) => {
    const normalizedType = type?.toUpperCase() || 'SYSTEM';
    switch (normalizedType) {
        case 'RISK_ALERT': return TrendingUp;
        case 'TEST_REMINDER': return Activity;
        case 'APPOINTMENT':
        case 'APPOINTMENT_REMINDER': return Calendar;
        case 'WELLNESS_TIP': return Heart;
        case 'DOCTOR_RECOMMENDATION': return Stethoscope;
        case 'LEARNING_UPDATE': return BookOpen;
        case 'SYSTEM': return Info;
        default: return Bell;
    }
};

const getNotificationColor = (type: NotificationType): string => {
    const normalizedType = type?.toUpperCase() || 'SYSTEM';
    switch (normalizedType) {
        case 'RISK_ALERT': return '#E74C3C';
        case 'TEST_REMINDER': return '#6C5CE7';
        case 'APPOINTMENT':
        case 'APPOINTMENT_REMINDER': return '#3498DB';
        case 'WELLNESS_TIP': return '#27AE60';
        case 'DOCTOR_RECOMMENDATION': return '#9B59B6';
        case 'LEARNING_UPDATE': return '#F39C12';
        case 'SYSTEM': return '#7F8C8D';
        default: return '#6C5CE7';
    }
};

const formatTime = (dateString: string): string => {
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(utcDateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationTitle = (type: NotificationType): string => {
    const normalizedType = type?.toUpperCase() || 'SYSTEM';
    switch (normalizedType) {
        case 'RISK_ALERT': return 'Risk Alert';
        case 'TEST_REMINDER': return 'Test Reminder';
        case 'APPOINTMENT':
        case 'APPOINTMENT_REMINDER': return 'Appointment';
        case 'WELLNESS_TIP': return 'Wellness Tip';
        case 'DOCTOR_RECOMMENDATION': return 'Doctor Recommendation';
        case 'LEARNING_UPDATE': return 'New Learning Content';
        case 'SYSTEM': return 'System Notification';
        default: return 'Notification';
    }
};

export const NotificationsList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            const [notifs, count] = await Promise.all([
                notificationApi.getByUserId(Number(user.id)),
                notificationApi.getUnreadCount(Number(user.id)),
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notification: NotificationResponse) => {
        if (notification.isRead) return;

        const result = await notificationApi.markAsRead(notification.id);
        if (result) {
            setNotifications(prev =>
                prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id || unreadCount === 0) return;

        const success = await notificationApi.markAllAsRead(Number(user.id));
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            showToast('All notifications marked as read', 'success');
        }
    };

    const handleDelete = async (notificationId: number) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        const success = await notificationApi.delete(notificationId);
        if (success) {
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            showToast('Notification deleted', 'success');
        }
    };

    if (loading) {
        return (
            <ScreenWrapper className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto p-4 md:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                            <CheckCheck size={16} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notification List */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <BellOff size={56} className="mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
                        <p className="text-sm text-gray-500 text-center max-w-xs">
                            You're all caught up! Check back later for updates about your health journey.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notification => {
                            const Icon = getNotificationIcon(notification.type);
                            const color = getNotificationColor(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification)}
                                    className={`bg-white rounded-xl border p-4 md:p-5 cursor-pointer transition-all hover:shadow-md group ${!notification.isRead
                                            ? 'border-purple-200 bg-purple-50/30'
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `${color}15` }}
                                        >
                                            <Icon size={20} style={{ color }} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                                                    {getNotificationTitle(notification.type)}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-1.5">
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notification.id);
                                            }}
                                            className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                            title="Delete notification"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Footer hint */}
                        <p className="text-center text-xs text-gray-400 pt-4 pb-2">
                            Hover over a notification to see the delete option
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
