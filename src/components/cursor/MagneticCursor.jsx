import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsapConfig';

const MagneticCursor = () => {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const posHistory = useRef(Array(8).fill({ x: 0, y: 0 }));

  useEffect(() => {
    const cursor = cursorRef.current;

    const onMove = (e) => {
      // Shift history
      posHistory.current = [{ x: e.clientX, y: e.clientY }, ...posHistory.current.slice(0, 7)];

      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' });

      // Update trail
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const pos = posHistory.current[i + 1] || posHistory.current[0];
        const scale = 1 - (i + 1) * 0.1;
        const opacity = 1 - (i + 1) * 0.12;
        gsap.to(trail, {
          x: pos.x, y: pos.y,
          scale, opacity,
          duration: 0.12 + i * 0.03,
          ease: 'none',
        });
      });

      // Magnetic attraction to nearby interactive elements
      const elements = document.querySelectorAll('button, a, [data-magnetic]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - cx, e.clientY - cy);

        if (distance < 60) {
          const pull = (60 - distance) / 60;
          gsap.to(el, {
            x: (e.clientX - cx) * pull * 0.4,
            y: (e.clientY - cy) * pull * 0.4,
            duration: 0.3, ease: 'power2.out',
          });
        } else {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' });
        }
      });
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-[9999] w-5 h-5 rounded-full bg-violet-500"
        style={{ transform: 'translate(-50%, -50%)', boxShadow: '0 0 15px #6366f1, 0 0 30px rgba(99,102,241,0.3)' }}
      />
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="pointer-events-none fixed z-[9998] rounded-full bg-violet-400"
          style={{
            width: `${16 - i * 1.5}px`,
            height: `${16 - i * 1.5}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.8 - i * 0.1,
          }}
        />
      ))}
    </>
  );
};

export default MagneticCursor;
