import { useEffect, useRef } from 'react';
import { EminenceBackground } from '@/animations/threeBackground';
import { AuroraBackground, EmberBackground, OceanBackground, NeonRainBackground } from '@/animations/threeScenes';
import useUIStore from '@/store/uiStore';

const SCENE_MAP = {
  cosmos: EminenceBackground,
  aurora: AuroraBackground,
  ember:  EmberBackground,
  ocean:  OceanBackground,
  neon:   NeonRainBackground,
};

const ThreeBackground = () => {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const threeBgEnabled = useUIStore((s) => s.threeBgEnabled);
  const bgScene = useUIStore((s) => s.bgScene);

  useEffect(() => {
    if (!threeBgEnabled || !canvasRef.current) return;
    const SceneClass = SCENE_MAP[bgScene] ?? EminenceBackground;
    bgRef.current = new SceneClass(canvasRef.current);
    return () => {
      bgRef.current?.destroy();
      bgRef.current = null;
    };
  }, [threeBgEnabled, bgScene]);

  if (!threeBgEnabled) return null;

  return (
    <canvas
      key={bgScene}
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ThreeBackground;
