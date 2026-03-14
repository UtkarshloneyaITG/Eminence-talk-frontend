import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsapConfig';

const GsapCursor = () => {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;

    // Animate ring continuously
    gsap.to(ring, {
      rotation: 360,
      duration: 3,
      repeat: -1,
      ease: 'none',
    });

    // Pulsing glow
    gsap.to(glow, {
      scale: 1.5,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: 'power2.out',
    });

    const onMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none' });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
      gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none' });
    };

    const onDown = () => {
      gsap.to(ring, { scale: 0.7, duration: 0.1 });
      gsap.to(dot, { scale: 2, backgroundColor: '#ec4899', duration: 0.1 });
    };

    const onUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' });
      gsap.to(dot, { scale: 1, backgroundColor: '#6366f1', duration: 0.3, ease: 'elastic.out(1, 0.3)' });
    };

    const onEnterInteractive = (e) => {
      if (e.target.closest('button, a, input, textarea, [data-cursor]')) {
        gsap.to(ring, { scale: 1.8, borderColor: '#ec4899', duration: 0.3 });
        gsap.to(dot, { scale: 0, duration: 0.3 });
      }
    };

    const onLeaveInteractive = (e) => {
      if (e.target.closest('button, a, input, textarea, [data-cursor]')) {
        gsap.to(ring, { scale: 1, borderColor: '#6366f1', duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onEnterInteractive);
    document.addEventListener('mouseout', onLeaveInteractive);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onEnterInteractive);
      document.removeEventListener('mouseout', onLeaveInteractive);
    };
  }, []);

  return (
    <>
      {/* Pulsing glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed z-[9996] w-8 h-8 rounded-full bg-violet-500"
        style={{ transform: 'translate(-50%, -50%)', opacity: 0.3 }}
      />
      {/* Rotating ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9998] w-10 h-10 rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
          border: '2px solid #6366f1',
          borderTopColor: 'transparent',
          borderRightColor: 'rgba(99,102,241,0.5)',
        }}
      />
      {/* Center dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9999] w-2.5 h-2.5 rounded-full bg-violet-400"
        style={{ transform: 'translate(-50%, -50%)', boxShadow: '0 0 6px #6366f1' }}
      />
    </>
  );
};

export default GsapCursor;
