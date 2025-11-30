'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error to console
  if (typeof window !== 'undefined') {
    console.error(error);
  }

  return (
    <html lang="id">
      <body style={{margin: 0, padding: 0}}>
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
            <h1 style={{margin: '0 0 1rem 0', color: '#1a1a1a'}}>Terjadi Kesalahan</h1>
            <p style={{margin: '0 0 1rem 0', color: '#666'}}>Mohon maaf, ada kesalahan pada aplikasi.</p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
