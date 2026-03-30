import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const messages = [
  '🚧  We are currently experiencing a technical issue. Some features may be temporarily unavailable.',
  '⚠️  Online booking & payments are temporarily disabled. Walk-ins are still welcome!',
  '🔧  Our team is working hard to resolve the issue and restore full service. Thank you for your patience.',
  '📞  For urgent appointments, please call us directly at our salon.',
  '✅  All in-person services are fully operational. We apologise for any inconvenience.',
];

const MaintenanceBanner = () => {
  const tickerRef = useRef(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let animationId;
    let startTime = null;
    const speed = 60; // px per second

    const totalWidth = ticker.scrollWidth / 2; // we duplicate content so half = one set

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const offset = (elapsed * speed) % totalWidth;
      ticker.style.transform = `translateX(-${offset}px)`;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const allMessages = [...messages, ...messages]; // duplicate for seamless loop

  return (
    <div
      className="maintenance-banner"
      style={{
        position: 'fixed',
        top: '84px', // navbar pill: mt-4(16px) + ~68px height = ~84px
        left: 0,
        right: 0,
        zIndex: 48,
        background: 'linear-gradient(90deg, #7c2d12 0%, #991b1b 50%, #b91c1c 100%)',
        borderTop: '1px solid rgba(255,120,60,0.3)',
        borderBottom: '1px solid rgba(255,120,60,0.2)',
        overflow: 'hidden',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 6px 30px rgba(185,28,28,0.45)',
      }}
    >
      {/* Left icon badge */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 14px',
          height: '100%',
          background: 'rgba(0,0,0,0.25)',
          borderRight: '1px solid rgba(255,150,80,0.2)',
          zIndex: 2,
        }}
      >
        <AlertTriangle size={14} color="#fdba74" />
        <span style={{ color: '#fdba74', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          Maintenance
        </span>
      </div>

      {/* Scrolling ticker */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', background: 'linear-gradient(to right, #9a3412, transparent)', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', background: 'linear-gradient(to left, #9a3412, transparent)', zIndex: 1, pointerEvents: 'none' }} />

        <div
          ref={tickerRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {allMessages.map((msg, i) => (
            <span
              key={i}
              style={{
                color: '#fecaca',
                fontSize: '13px',
                fontWeight: 500,
                padding: '0 48px',
                letterSpacing: '0.02em',
              }}
            >
              {msg}
              <span style={{ marginLeft: '48px', color: 'rgba(255,180,120,0.35)', fontSize: '10px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
