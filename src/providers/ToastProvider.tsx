import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { COLORS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, SPACING } from '../config/theme.config';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>('info');

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    const showToast = useCallback((msg: string, type: ToastType = 'info', dur: number = 3000) => {
        setMessage(msg);
        setToastType(type);
        setVisible(true);

        if (dur > 0) {
            setTimeout(() => {
                setVisible(false);
            }, dur);
        }
    }, []);

    const getBackgroundColor = (type: ToastType) => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            case 'info':
            default: return COLORS.primary;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {visible && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: getBackgroundColor(toastType),
                    color: '#FFFFFF',
                    padding: `${SPACING.sm}px ${SPACING.md}px`,
                    borderRadius: BORDER_RADIUS.md,
                    boxShadow: SHADOWS.md,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: '300px',
                    maxWidth: '90%',
                    justifyContent: 'space-between',
                    animation: 'slideUp 0.3s ease-out',
                }}>
                    <span style={{ fontSize: TYPOGRAPHY.fontSize.md, flex: 1 }}>{message}</span>
                    <button
                        onClick={hideToast}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '18px',
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
            <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    );
};
