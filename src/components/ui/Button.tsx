import React from 'react';
import { Loader2 } from 'lucide-react';
import { COLORS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../../config/theme.config';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    mode = 'contained',
    loading = false,
    icon,
    fullWidth = false,
    className = '',
    disabled,
    onPress,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: `${SPACING.sm}px ${SPACING.md}px`,
        borderRadius: BORDER_RADIUS.md,
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold, // '600'
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        opacity: disabled || loading ? 0.6 : 1,
    };

    const getVariantStyle = (): React.CSSProperties => {
        switch (mode) {
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.primary,
                };
            case 'text':
                return {
                    backgroundColor: 'transparent',
                    color: COLORS.primary,
                    padding: `${SPACING.xs}px ${SPACING.sm}px`,
                };
            case 'contained':
            default:
                return {
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                };
        }
    };

    return (
        <button
            disabled={disabled || loading}
            style={{ ...baseStyle, ...getVariantStyle() }}
            onClick={onPress || props.onClick}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {!loading && icon}
            {title}
        </button>
    );
};
