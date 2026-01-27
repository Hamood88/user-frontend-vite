import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SellOnMoondala() {
  const nav = useNavigate();

  return (
    <div style={{
      background: '#09090b',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <button
          onClick={() => nav(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#22c55e',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: '900',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Why Sell on Moondala?
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          lineHeight: '1.8',
        }}>
          [Add your introduction text here]
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}>
        {/* Section 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              🌍 Global Reach
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.05)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>

        {/* Section 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
          direction: 'rtl',
        }}>
          <div style={{ direction: 'ltr' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              💰 Better Payouts
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.05)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>

        {/* Section 3 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              📊 Advanced Analytics
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.05)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>

        {/* Section 4 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
          direction: 'rtl',
        }}>
          <div style={{ direction: 'ltr' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              🎨 Custom Mall Builder
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.05)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>

        {/* Section 5 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              🤝 Community & Support
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.05)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>

        {/* Section 6 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '120px',
          direction: 'rtl',
        }}>
          <div style={{ direction: 'ltr' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '16px',
              color: '#22c55e',
            }}>
              💎 Transparent Pricing
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8',
              marginBottom: '16px',
            }}>
              [Add your benefit description here]
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.8',
            }}>
              [Add additional details or key points]
            </p>
          </div>
          <div style={{
            width: '100%',
            height: '300px',
            border: '2px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34, 197, 94, 0.5)',
            color: 'rgba(34, 197, 94, 0.5)',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            padding: '20px',
          }}>
            [Add Photo Here]
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        borderTop: '1px solid rgba(34, 197, 94, 0.2)',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
        padding: 'clamp(40px, 8vw, 80px) 20px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: '900',
            marginBottom: '24px',
          }}>
            Ready to Start Selling?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '32px',
            lineHeight: '1.8',
          }}>
            [Add your call-to-action message here]
          </p>
          <button
            onClick={() => nav('/shop/landing')}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Register Your Shop Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
      }}>
        <p>© 2026 Moondala. All rights reserved.</p>
      </div>
    </div>
  );
}
