import { useEffect, useRef } from 'react';

const MAX_PARTICLES = 120;

const ParticlesCursor = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const lastIdleSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spawnParticle = (x, y, burst = false) => {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * (burst ? 8 : 4),
        vy: (Math.random() - 0.5) * (burst ? 8 : 4) - (burst ? 1 : 0.5),
        life: 1.0,
        decay: burst
          ? 0.02 + Math.random() * 0.02
          : 0.012 + Math.random() * 0.012,
        size: burst
          ? Math.random() * 6 + 3
          : Math.random() * 5 + 2,
        hue: 240 + Math.random() * 100,   // violet → pink range
        gravity: burst ? 0.12 : 0.04,
        star: Math.random() > 0.55,
        spin: (Math.random() - 0.5) * 0.25,
        angle: Math.random() * Math.PI * 2,
      });
    };

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Dense trail on movement
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) spawnParticle(e.clientX, e.clientY);
    };

    const onMouseClick = (e) => {
      for (let i = 0; i < 22; i++) spawnParticle(e.clientX, e.clientY, true);
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onResize);

    const drawStar = (ctx, x, y, r, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 2.2, Math.sin(a) * r * 2.2);
      }
      ctx.lineWidth = r * 0.7;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Always emit a trickle of particles at cursor position (idle glow)
      const now = Date.now();
      if (now - lastIdleSpawnRef.current > 60) {
        lastIdleSpawnRef.current = now;
        spawnParticle(mouseRef.current.x, mouseRef.current.y);
      }

      // Trim dead particles
      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      }

      particlesRef.current.forEach((p) => {
        if (p.life <= 0) return;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.life -= p.decay;
        p.angle += p.spin;

        const alpha = Math.max(0, p.life);
        const r = p.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.star) {
          ctx.fillStyle = `hsla(${p.hue}, 100%, 78%, 1)`;
          drawStar(ctx, p.x, p.y, r, p.angle);
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.6);
          grad.addColorStop(0, `hsla(${p.hue}, 100%, 95%, 1)`);
          grad.addColorStop(0.4, `hsla(${p.hue}, 100%, 72%, 0.8)`);
          grad.addColorStop(1, `hsla(${p.hue}, 100%, 55%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw cursor dot on canvas
      const { x, y } = mouseRef.current;
      ctx.save();
      const dotGrad = ctx.createRadialGradient(x, y, 0, x, y, 10);
      dotGrad.addColorStop(0, 'rgba(255,255,255,1)');
      dotGrad.addColorStop(0.3, 'rgba(180,160,255,0.9)');
      dotGrad.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();
      // Hard center
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticlesCursor;
