import React from 'react'

export function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`card ${className || ''}`} style={style}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} className={className}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 'none', letterSpacing: '-0.025em' }} className={className}>
            {children}
        </h3>
    )
}

export function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}
