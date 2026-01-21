'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Settings, LogOut } from 'lucide-react'
// If you want a specific style for nav, we can create a module or use inline for now.
// For speed/consistency with current vanilla approach, I'll use a module.

export function MainNav() {
    const pathname = usePathname()

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/payments', label: 'Pagamentos', icon: CreditCard },
        { href: '/dashboard/integrations', label: 'Integrações', icon: Settings },
    ]

    return (
        <nav style={{
            width: '240px',
            borderRight: '1px solid var(--border)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'var(--background)',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div>
                <div style={{ marginBottom: '2rem', paddingLeft: '1rem', fontWeight: 700, fontSize: '1.25rem' }}>
                    Escola App
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                    background: isActive ? 'var(--surface-hover)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div style={{ paddingLeft: '1rem' }}>
                <form action="/auth/signout" method="post">
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}>
                        <LogOut size={18} />
                        Sair
                    </button>
                </form>
            </div>
        </nav>
    )
}
