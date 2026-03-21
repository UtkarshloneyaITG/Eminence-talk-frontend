import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsapConfig';

const GsapCursor = () => {
  const outerRef  = useRef(null);
  const innerRef  = useRef(null);
  const dotRef    = useRef(null);
  const auraRef   = useRef(null);
  const trail1Ref = useRef(null);
  const trail2Ref = useRef(null);
  const trail3Ref = useRef(null);

  useEffect(() => {
    const outer  = outerRef.current;
    const inner  = innerRef.current;
    const dot    = dotRef.current;
    const aura   = auraRef.current;
    const t1     = trail1Ref.current;
    const t2     = trail2Ref.current;
    const t3     = trail3Ref.current;

    // ── Continuous rotations ──────────────────────────────────────
    gsap.to(outer, { rotation:  360, duration: 5,   repeat: -1, ease: 'none' });
    gsap.to(inner, { rotation: -360, duration: 1.8, repeat: -1, ease: 'none' });

    // Pulsing aura
    gsap.to(aura, { scale: 2.8, opacity: 0, duration: 1.4, repeat: -1, ease: 'power2.out' });

    // ── Mouse move ───────────────────────────────────────────────
    const onMove = ({ clientX: x, clientY: y }) => {
      gsap.to(dot,   { x, y, duration: 0.04, ease: 'none' });
      gsap.to(aura,  { x, y, duration: 0.04, ease: 'none' });
      gsap.to(inner, { x, y, duration: 0.1,  ease: 'power3.out' });
      gsap.to(outer, { x, y, duration: 0.45, ease: 'power3.out' });
      gsap.to(t1,    { x, y, duration: 0.18, ease: 'power2.out' });
      gsap.to(t2,    { x, y, duration: 0.32, ease: 'power2.out' });
      gsap.to(t3,    { x, y, duration: 0.5,  ease: 'power2.out' });
    };

    // ── Click ────────────────────────────────────────────────────
    const onDown = () => {
      gsap.to(outer, { scale: 0.55, duration: 0.1 });
      gsap.to(inner, { scale: 1.6,  duration: 0.1 });
      gsap.to(dot,   { scale: 3.5,  duration: 0.1 });
      // burst aura flash
      gsap.killTweensOf(aura, 'scale,opacity');
      gsap.set(aura, { scale: 1, opacity: 0.7 });
      gsap.to(aura,  { scale: 3.5, opacity: 0, duration: 0.4, ease: 'power2.out',
        onComplete: () => gsap.to(aura, { scale: 2.8, opacity: 0, duration: 1.4, repeat: -1, ease: 'power2.out' }),
      });
    };

    const onUp = () => {
      gsap.to(outer, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      gsap.to(inner, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      gsap.to(dot,   { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };

    // ── Hover interactive elements ───────────────────────────────
    const onOver = (e) => {
      if (e.target.closest('button, a, input, textarea, select, [data-cursor]')) {
        gsap.to(outer, { scale: 2.2, opacity: 0.6, duration: 0.3, ease: 'power2.out' });
        gsap.to(inner, { scale: 0.4, duration: 0.3 });
        gsap.to(dot,   { scale: 0,   duration: 0.2 });
        gsap.to([t1, t2, t3], { scale: 0, duration: 0.2 });
      }
    };

    const onOut = (e) => {
      if (e.target.closest('button, a, input, textarea, select, [data-cursor]')) {
        gsap.to(outer, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
        gsap.to(inner, { scale: 1, duration: 0.35 });
        gsap.to(dot,   { scale: 1, duration: 0.35 });
        gsap.to([t1, t2, t3], { scale: 1, duration: 0.35 });
      }
    };

    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mousedown',  onDown);
    document.addEventListener('mouseup',    onUp);
    document.addEventListener('mouseover',  onOver);
    document.addEventListener('mouseout',   onOut);

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      gsap.killTweensOf([outer, inner, dot, aura, t1, t2, t3]);
    };
  }, []);

  const base = 'pointer-events-none fixed';

  return (
    <>
      {/* Pulsing aura */}
      <div ref={auraRef} className={`${base} z-[9994] w-10 h-10 rounded-full`}
        style={{ transform: 'translate(-50%,-50%)', backgroundColor: 'var(--accent)', opacity: 0.25 }}
      />

      {/* Trail dots — fading, growing delay */}
      <div ref={trail3Ref} className={`${base} z-[9995] w-2 h-2 rounded-full`}
        style={{ transform: 'translate(-50%,-50%)', backgroundColor: 'var(--accent)', opacity: 0.18 }}
      />
      <div ref={trail2Ref} className={`${base} z-[9996] w-2.5 h-2.5 rounded-full`}
        style={{ transform: 'translate(-50%,-50%)', backgroundColor: 'var(--accent)', opacity: 0.32 }}
      />
      <div ref={trail1Ref} className={`${base} z-[9997] w-3 h-3 rounded-full`}
        style={{ transform: 'translate(-50%,-50%)', backgroundColor: 'var(--accent)', opacity: 0.5 }}
      />

      {/* Outer ring — dashed, slow CW rotation */}
      <div ref={outerRef} className={`${base} z-[9998] w-14 h-14 rounded-full`}
        style={{
          transform: 'translate(-50%,-50%)',
          border: '1.5px dashed var(--accent)',
          boxShadow: '0 0 10px rgba(var(--accent-rgb),0.3)',
        }}
      />

      {/* Inner ring — solid, fast CCW rotation */}
      <div ref={innerRef} className={`${base} z-[9998] w-7 h-7 rounded-full`}
        style={{
          transform: 'translate(-50%,-50%)',
          border: '2px solid var(--accent)',
          borderTopColor: 'transparent',
          borderRightColor: 'rgba(var(--accent-rgb),0.35)',
          boxShadow: '0 0 8px var(--accent), inset 0 0 6px rgba(var(--accent-rgb),0.2)',
        }}
      />

      {/* Center dot */}
      <div ref={dotRef} className={`${base} z-[9999] w-3 h-3 rounded-full bg-white`}
        style={{
          transform: 'translate(-50%,-50%)',
          boxShadow: '0 0 8px var(--accent), 0 0 20px var(--accent), 0 0 40px rgba(var(--accent-rgb),0.4)',
        }}
      />
    </>
  );
};

export default GsapCursor;
