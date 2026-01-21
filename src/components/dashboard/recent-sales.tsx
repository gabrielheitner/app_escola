export function RecentSales() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ height: '36px', width: '36px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>OM</span>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Olivia Martin</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>olivia.martin@email.com</p>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>+R$ 1.999,00</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ height: '36px', width: '36px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>JL</span>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Jackson Lee</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>jackson.lee@email.com</p>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>+R$ 39,00</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ height: '36px', width: '36px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>IN</span>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Isabella Nguyen</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>isabella.nguyen@email.com</p>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>+R$ 299,00</div>
            </div>
        </div>
    )
}
