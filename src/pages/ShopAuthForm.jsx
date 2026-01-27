export function ShopAuthForm({ mode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      minHeight: '400px'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px'
      }}>
        
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: '16px',
        letterSpacing: '0.5px'
      }}>
        You're in!
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        marginBottom: '12px',
        maxWidth: '400px'
      }}>
        The Moondala shop app isn't ready yet.
      </p>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        fontWeight: '600'
      }}>
        We'll notify you as soon as it's live.
      </p>
    </div>
  );
}

export default ShopAuthForm;
