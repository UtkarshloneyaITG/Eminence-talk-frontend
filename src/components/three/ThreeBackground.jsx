import { useEffect, useRef } from 'react';
import { EminenceBackground } from '@/animations/threeBackground';
import useUIStore from '@/store/uiStore';

const ThreeBackground = () => {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const threeBgEnabled = useUIStore((s) => s.threeBgEnabled);

  useEffect(() => {
    if (!threeBgEnabled || !canvasRef.current) return;
    bgRef.current = new EminenceBackground(canvasRef.current);
    return () => bgRef.current?.destroy();
  }, [threeBgEnabled]);

  if (!threeBgEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ThreeBackground;
