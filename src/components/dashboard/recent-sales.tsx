interface RecentSale {
    id: string
    name: string
    email: string
    amount: number
}

interface RecentSalesProps {
    sales: RecentSale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
    if (sales.length === 0) {
        return <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma venda recente.</div>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sales.map((sale) => (
                <div key={sale.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ height: '36px', width: '36px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>
                            {sale.name.substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{sale.name}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{sale.email}</p>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                    </div>
                </div>
            ))}
        </div>
    )
}
