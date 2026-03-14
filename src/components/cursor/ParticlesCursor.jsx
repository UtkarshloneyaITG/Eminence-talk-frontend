import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 20;

const ParticlesCursor = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 30 + i * 2,
      size: Math.random() * 4 + 2,
      hue: 240 + Math.random() * 60,
    }));

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Spawn particles on move
      particlesRef.current.forEach((p, i) => {
        if (i % 3 === 0 && p.life <= 0) {
          p.x = e.clientX;
          p.y = e.clientY;
          p.vx = (Math.random() - 0.5) * 3;
          p.vy = (Math.random() - 0.5) * 3 - 1;
          p.life = p.maxLife;
        }
      });
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        if (p.life <= 0) return;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.vx *= 0.98;
        p.life--;

        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{ mixBlendMode: 'screen' }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9998] w-3 h-3 rounded-full bg-violet-400"
        style={{
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.05s, top 0.05s',
          boxShadow: '0 0 10px #6366f1',
        }}
        id="cursor-dot"
      />
    </>
  );
};

export default ParticlesCursor;
