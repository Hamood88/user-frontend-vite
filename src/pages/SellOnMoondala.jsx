import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/moondala-logo.png';
import { ShopAuthForm } from './ShopAuthForm'; // Reuse existing form
// import '../pages/ShopLoginRegister.css'; // REMOVED: File does not exist

// Placeholders for user screenshots
// Please rename your photos to these names and put them in src/assets
import feedImg from '../assets/screenshot-feed.png';
import mallImg from '../assets/screenshot-mall.png';
import analyticsImg from '../assets/screenshot-analytics.png';
import editorImg from '../assets/screenshot-editor.png';
import earningsImg from '../assets/screenshot-earnings.png';

export default function SellOnMoondala() {
  const nav = useNavigate();
  const formRef = useRef(null);
  const featuresRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Reusable Feature Component (Moved Inside)
  function FeatureSection({ badge, title, desc, imgUrl, align = 'left' }) {
    const isRight = align === 'right';
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'clamp(40px, 6vw, 80px)',
        alignItems: 'center',
        marginBottom: 'clamp(80px, 10vw, 160px)',
      }}>
        {/* Text Content */}
        <div style={{ order: isRight ? 2 : 1 }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#d8b4fe', // Light purple
            letterSpacing: '2px',
            marginBottom: '16px',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}>
            {badge}
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '800',
            marginBottom: '20px',
            lineHeight: '1.2',
            background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.8',
            marginBottom: '32px',
          }}>
            {desc}
          </p>
        </div>

        {/* Image Content */}
        <div style={{ 
          order: isRight ? 1 : 2,
          position: 'relative',
        }}>
          {/* Decorative elements behind image */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: isRight ? '-20px' : '20px',
            right: isRight ? '20px' : '-20px',
            bottom: '-20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            zIndex: 0,
          }}></div>
          
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
            background: 'transparent',
            minHeight: '200px',
            cursor: 'zoom-in',
          }} onClick={() => setSelectedImage(imgUrl)}>
            <img 
              src={imgUrl} 
              alt={title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '24px',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            {/* Overlay gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none',
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div style={{
      background: '#09090b',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, sans-serif',
      paddingBottom: '80px',
    }}>
      {/* Navbar / Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => nav(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            ← Back
          </button>

           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <img src={logo} alt="Moondala" style={{ height: '40px', width: 'auto' }} />
             <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>Seller Central</span>
           </div>

           <div style={{ width: '60px' }}></div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        padding: 'clamp(60px, 10vw, 100px) 24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2) 0%, rgba(9, 9, 11, 0) 70%)',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <img 
            src={logo} 
            alt="Moondala" 
            style={{ 
              height: '180px', 
              width: 'auto',
              marginBottom: '48px',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 60px rgba(168, 85, 247, 0.3))'
            }} 
          />
          <br />
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: '999px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#d8b4fe',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '32px',
            letterSpacing: '1px',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)'
          }}>
            NOW ACCEPTING NEW SHOPS
          </div>
          
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '24px',
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff 0%, #e9d5ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(168, 85, 247, 0.2)'
          }}>
            This is not another marketplace
          </h1>
          
          <p style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Moondala replaces ads and algorithms with social discovery, targeted malls, and fair growth — built for shops that want real customers, not traffic.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={scrollToFeatures}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.6)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(168, 85, 247, 0.4)'; }}
            >
              Why Moondala works →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Banner: REMOVED as requested */}

      {/* Features Grid */}
      <div ref={featuresRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', marginTop: '100px', scrollMarginTop: '100px' }}>
        
        {/* Feature 0 (New) */}
        <FeatureSection
          badge="PROFIT SHARING"
          title="Customers buy more when they earn"
          desc={
            <>
              On Moondala, a portion of each transaction is shared back with users.
              That means every purchase increases their earnings — giving them a real reason to shop more, return often, and choose Moondala over other platforms.
              <br /><br />
              When users earn by shopping, your sales don’t stop at one checkout — they multiply.
            </>
          }
          imgUrl={earningsImg}
          align="left"
        />

        {/* Feature 1 */}
        <FeatureSection
          badge="SMART MALL"
          title="Your products appear only to the right buyers"
          desc={
            <>
              Moondala is not a traditional marketplace. Each user has a personalized mall, and your products are shown only to users who match your targeting — based on interests, location, and behavior.
              <br /><br />
              That means no wasted exposure, no competing for attention, and higher conversion from day one.
            </>
          }
          imgUrl={mallImg}
          align="right"
        />

        {/* Feature 3 */}
        <FeatureSection
          badge="ACTIONABLE INSIGHTS"
          title="See what actually drives your sales"
          desc={
            <>
              Moondala analytics show you which products convert, which users become buyers, and how your shop spreads through social sharing.
              <br /><br />
              Instead of guessing, you see what’s working, who’s engaging, and where your next sales will come from.
            </>
          }
          imgUrl={analyticsImg}
          align="left"
        />

        {/* Feature 4 */}
        <FeatureSection
          badge="YOUR SPACE"
          title="Your shop isn’t a listing. It’s a destination."
          desc={
            <>
              On Moondala, you don’t disappear in a feed of competitors.
              You build your own mall space — designed your way — where users arrive already interested in what you sell.
              <br /><br />
              Your brand, your layout, your story — inside a social commerce ecosystem built to convert.
            </>
          }
          imgUrl={editorImg}
          align="right"
        />

        {/* Feature 5 */}
        <FeatureSection
          badge="SOCIAL COMMERCE"
          title="Your shop doesn’t sell alone"
          desc={
            <>
              On Moondala, shops and users interact in real time.
              Post updates, feature products, and engage with people who already follow your shop.
              <br /><br />
              Every post is a touchpoint. Every interaction builds trust.
              And trust turns followers into buyers.
            </>
          }
          imgUrl={feedImg}
          align="left"
        />

        {/* Feature 6 */}
        <FeatureSection
          badge="FAIR GROWTH"
          title="Growth without gatekeepers"
          desc={
            <>
              Moondala doesn’t hide visibility behind algorithms or paid boosts.
              Your growth comes from real engagement — users who discover, follow, and share your shop because they want to.
              <br /><br />
              No favoritism. No pay-to-win.
              Just transparent growth driven by people, not platforms.
            </>
          }
          imgUrl="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop"
          align="right"
        />

      </div>

      {/* Big CTA with Integrated Form */}
      <div 
        ref={formRef}
        style={{
          marginTop: '120px',
          padding: '24px',
          textAlign: 'center',
          scrollMarginTop: '100px'
        }}
      >
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          background: 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.15) 0%, rgba(9, 9, 11, 0.8) 100%)',
          borderRadius: '32px',
          padding: 'clamp(40px, 8vw, 80px) 24px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(168, 85, 247, 0.1)'
        }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: '#a855f7', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>

          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '900',
            marginBottom: '16px',
            color: '#fff',
            position: 'relative'
          }}>
            Join the Seller Waitlist
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '40px',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative'
          }}>
            Register your shop details below. We'll review your application and notify you as soon as your store is ready to go live.
          </p>
          
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '32px', 
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'left'
          }}>
            <ShopAuthForm mode="signup" onModeChange={() => {}} />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '80px',
        paddingTop: '60px',
        textAlign: 'center',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', opacity: 0.5 }}>
          <img src={logo} alt="Moondala" style={{ height: '24px', filter: 'grayscale(100%)' }} />
          <span style={{ fontWeight: 600 }}>Moondala</span>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
          © 2026 Moondala Inc. All rights reserved.
        </p>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={selectedImage} 
              alt="Feature Preview" 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()} 
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                opacity: 0.7,
                padding: '10px' // hit area
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.7}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

