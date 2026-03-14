import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsapConfig';

/**
 * useFadeIn — fade + slide-up on mount
 */
export const useFadeIn = (options = {}) => {
  const ref = useRef(null);
  const { delay = 0, duration = 0.5, y = 20 } = options;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
    );
  }, []);

  return ref;
};

/**
 * useStaggerChildren — stagger-animate direct children on mount
 */
export const useStaggerChildren = (selector = '*', stagger = 0.07) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const children = ref.current.querySelectorAll(selector);
    gsap.fromTo(children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger, duration: 0.45, ease: 'power3.out' }
    );
  }, []);

  return ref;
};

/**
 * useMagneticButton — apply magnetic hover effect
 */
export const useMagneticButton = (strength = 0.35) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => {
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        gsap.to(el, {
          x: (e.clientX - cx) * strength,
          y: (e.clientY - cy) * strength,
          duration: 0.3, ease: 'power2.out',
        });
      };
      el.addEventListener('mousemove', onMove);
      el._magnetMove = onMove;
    };

    const onLeave = () => {
      el.removeEventListener('mousemove', el._magnetMove);
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return ref;
};
