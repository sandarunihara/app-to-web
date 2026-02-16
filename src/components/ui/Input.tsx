import React from 'react';
import { COLORS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../../config/theme.config';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
    containerStyle?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    left,
    right,
    containerStyle,
    style,
    className,
    ...props
}) => {
    return (
        <div style={{ width: '100%', ...containerStyle }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: SPACING.xs,
                        fontSize: TYPOGRAPHY.fontSize.sm,
                        color: COLORS.textSecondary,
                    }}
                >
                    {label}
                </label>
            )}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: COLORS.surfaceSecondary,
                    borderRadius: BORDER_RADIUS.md,
                    border: `1px solid ${error ? COLORS.error : 'transparent'}`,
                    padding: `0 ${SPACING.md}px`,
                    height: '56px', // Standard height from React Native Paper
                    transition: 'border-color 0.2s',
                }}
            >
                {left && <div style={{ marginRight: SPACING.sm }}>{left}</div>}
                <input
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        height: '100%',
                        fontSize: TYPOGRAPHY.fontSize.lg,
                        color: COLORS.text,
                        width: '100%',
                        ...style,
                    }}
                    {...props}
                />
                {right && <div style={{ marginLeft: SPACING.sm }}>{right}</div>}
            </div>
            {error && (
                <span
                    style={{
                        color: COLORS.error,
                        fontSize: TYPOGRAPHY.fontSize.xs,
                        marginTop: SPACING.xs,
                        display: 'block',
                    }}
                >
                    {error}
                </span>
            )}
        </div>
    );
};
