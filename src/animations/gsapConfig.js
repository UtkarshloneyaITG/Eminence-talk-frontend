import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);

// Custom eases
CustomEase.create('elastic', 'M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1 0.37,0.985 0.414,0.873 0.455,0.811 0.51,0.726 0.573,1.006 0.6,1 0.637,0.985 0.682,1.005 0.703,1 0.72,0.997 0.762,1.003 0.783,1 0.89,1 1,1 1,1');
CustomEase.create('bouncy', 'M0,0 C0.31,-0.01 0.525,0.16 0.55,0.34 0.58,0.535 0.487,0.698 0.545,0.82 0.604,0.944 0.725,0.977 0.79,1.003 0.85,1.025 1,1 1,1');
CustomEase.create('liquid', 'M0,0 C0.38,0 0.58,0.96 0.65,1.02 0.72,1.08 0.78,0.96 0.85,1.01 0.9,1.05 0.95,0.99 1,1');

// Page transition presets
export const pageEnter = (element) =>
  gsap.fromTo(
    element,
    { opacity: 0, y: 30, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
  );

export const pageExit = (element) =>
  gsap.to(element, { opacity: 0, y: -20, scale: 0.97, duration: 0.4, ease: 'power2.in' });

// Message appear animation
export const messageAppear = (element, isSelf) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: isSelf ? 40 : -40,
      scale: 0.9,
    },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.45,
      ease: 'elastic',
    }
  );
};

// Stagger list animation
export const staggerIn = (elements, staggerDelay = 0.07) =>
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, stagger: staggerDelay, duration: 0.5, ease: 'power3.out' }
  );

// Hover tilt effect
export const applyMagneticEffect = (element, strength = 0.4) => {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  return (mouseX, mouseY) => {
    const dx = (mouseX - cx) * strength;
    const dy = (mouseY - cy) * strength;
    gsap.to(element, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  };
};

export const resetMagnetic = (element) =>
  gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });

// Morphing text reveal
export const typewriterReveal = (element, text) => {
  gsap.to(element, { duration: text.length * 0.05, text, ease: 'none' });
};

// Ripple effect on click
export const createRipple = (event, container) => {
  const ripple = document.createElement('span');
  const rect = container.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `
    position:absolute; border-radius:50%; pointer-events:none;
    width:${size}px; height:${size}px;
    left:${event.clientX - rect.left - size / 2}px;
    top:${event.clientY - rect.top - size / 2}px;
    background:rgba(99,102,241,0.3);
  `;
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.appendChild(ripple);

  gsap.fromTo(
    ripple,
    { scale: 0, opacity: 1 },
    {
      scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out',
      onComplete: () => ripple.remove(),
    }
  );
};

export { gsap };
