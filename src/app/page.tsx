export default function Home() {
  return (
    <main className="container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>School Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
        <div style={{ marginTop: '2rem' }}>
          {/* We will implement actual redirect logic later */}
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    </main>
  );
}
