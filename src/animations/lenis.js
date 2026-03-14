import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis = null;

export const initLenis = () => {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  // Connect to GSAP ticker for perfect sync
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Sync with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  return lenis;
};

export const getLenis = () => lenis;

export const destroyLenis = () => {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
};

export const scrollTo = (target, options = {}) => {
  lenis?.scrollTo(target, { duration: 1, easing: (t) => 1 - Math.pow(1 - t, 4), ...options });
};
