export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <h1 style={{margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '3rem'}}>404</h1>
        <h2 style={{margin: '0 0 1rem 0', color: '#333'}}>Halaman Tidak Ditemukan</h2>
        <p style={{margin: '0 0 2rem 0', color: '#666'}}>Maaf, halaman yang Anda cari tidak ada.</p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          textDecoration: 'none',
        }}>
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
