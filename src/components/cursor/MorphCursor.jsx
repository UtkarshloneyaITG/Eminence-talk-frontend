import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsapConfig';

const MorphCursor = () => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      gsap.to(inner, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
      gsap.to(outer, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power2.out' });
    };

    // Hover effects on interactive elements
    const onEnter = (e) => {
      const isButton = e.target.closest('button, a, [data-cursor="pointer"]');
      const isText = e.target.closest('p, h1, h2, h3, span, input, textarea');

      if (isButton) {
        gsap.to(outer, { scale: 2, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', duration: 0.3 });
        gsap.to(inner, { scale: 0.5, backgroundColor: '#6366f1', duration: 0.3 });
      } else if (isText) {
        gsap.to(outer, { scale: 0.5, opacity: 0.5, duration: 0.3 });
        gsap.to(inner, { scaleX: 3, scaleY: 0.3, borderRadius: '2px', duration: 0.3 });
      }
    };

    const onLeave = () => {
      gsap.to(outer, { scale: 1, borderColor: 'rgba(99,102,241,0.8)', backgroundColor: 'transparent', opacity: 1, duration: 0.3 });
      gsap.to(inner, { scale: 1, scaleX: 1, scaleY: 1, backgroundColor: '#6366f1', borderRadius: '50%', duration: 0.3 });
    };

    const onClick = () => {
      gsap.to(outer, { scale: 0.7, duration: 0.1, yoyo: true, repeat: 1 });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed z-[9999] w-10 h-10 rounded-full border-2 border-violet-400"
        style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
      />
      <div
        ref={innerRef}
        className="pointer-events-none fixed z-[9999] w-2 h-2 rounded-full bg-violet-400"
        style={{ transform: 'translate(-50%, -50%)', willChange: 'transform', boxShadow: '0 0 8px #6366f1' }}
      />
    </>
  );
};

export default MorphCursor;
