import { useEffect, useRef } from 'react';
import useUIStore from '@/store/uiStore';
import ParticlesCursor from './ParticlesCursor';
import MorphCursor from './MorphCursor';
import MagneticCursor from './MagneticCursor';
import GsapCursor from './GsapCursor';

const CursorManager = () => {
  const cursorStyle = useUIStore((s) => s.cursorStyle);

  // Hide native cursor globally
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = 'auto'; };
  }, []);

  const cursors = {
    particles: <ParticlesCursor />,
    morph: <MorphCursor />,
    magnetic: <MagneticCursor />,
    gsap: <GsapCursor />,
  };

  return cursors[cursorStyle] || cursors.particles;
};

export default CursorManager;
