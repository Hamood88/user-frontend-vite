export function ShopAuthForm({ mode }) {
  // Always show Coming Soon - no form, no submission needed
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
        🛠️
      </div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: '16px',
        letterSpacing: '0.5px'
      }}>
        Shop Dashboard Coming Soon
      </h3>
      <p style={{
        fontSize: '15px',
        color: '#94a3b8',
        lineHeight: '1.7',
        maxWidth: '380px'
      }}>
        Seller login will be available once the shop app is live.
      </p>
    </div>
  );
}

export default ShopAuthForm;
