import { useEffect, useRef } from 'react';
import useUIStore from '@/store/uiStore';
import ParticlesCursor from './ParticlesCursor';
import MorphCursor from './MorphCursor';
import MagneticCursor from './MagneticCursor';
import GsapCursor from './GsapCursor';

const CursorManager = () => {
  const cursorStyle = useUIStore((s) => s.cursorStyle);

  // Hide native cursor only when a custom cursor is active
  useEffect(() => {
    document.body.style.cursor = cursorStyle === 'none' ? 'auto' : 'none';
    return () => { document.body.style.cursor = 'auto'; };
  }, [cursorStyle]);

  if (cursorStyle === 'none') return null;

  const cursors = {
    particles: <ParticlesCursor />,
    morph: <MorphCursor />,
    magnetic: <MagneticCursor />,
    gsap: <GsapCursor />,
  };

  return cursors[cursorStyle] || null;
};

export default CursorManager;
