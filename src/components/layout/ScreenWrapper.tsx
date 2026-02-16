import React from 'react';
import type { ReactNode } from 'react';

interface ScreenWrapperProps {
    children: ReactNode;
    scrollable?: boolean;
    padded?: boolean;
    style?: React.CSSProperties;
    backgroundColor?: string;
    className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`w-full ${className}`}>
            {children}
        </div>
    );
};
