import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Lightning, SpeakerHigh, SpeakerSlash, Monitor, PaintBrush, CursorClick, Sparkle } from '@phosphor-icons/react';
import { gsap } from '@/animations/gsapConfig';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const BG_SCENES = [
  { id: 'cosmos', label: 'Cosmos',    desc: 'Violet particles & floating orbs',   emoji: '🌌', colors: ['#6366f1', '#8b5cf6', '#06b6d4'] },
  { id: 'aurora', label: 'Aurora',    desc: 'Flowing northern lights curtains',    emoji: '🌿', colors: ['#10b981', '#06b6d4', '#4ade80'] },
  { id: 'ember',  label: 'Ember',     desc: 'Rising fire sparks & embers',         emoji: '🔥', colors: ['#f97316', '#ef4444', '#fbbf24'] },
  { id: 'ocean',  label: 'Ocean',     desc: 'Bioluminescent deep sea particles',   emoji: '🌊', colors: ['#3b82f6', '#06b6d4', '#0ea5e9'] },
  { id: 'neon',   label: 'Neon Rain', desc: 'Cyberpunk neon falling rain',         emoji: '⚡', colors: ['#ec4899', '#8b5cf6', '#06b6d4'] },
];

const CURSOR_STYLES = [
  { id: 'particles', label: 'Particles Trail', desc: 'Leaves colorful particles as you move', emoji: '✨' },
  { id: 'morph', label: 'Morph Cursor', desc: 'Morphs shape on hover interactions', emoji: '🔮' },
  { id: 'magnetic', label: 'Magnetic', desc: 'Attracts to interactive elements', emoji: '🧲' },
  { id: 'gsap', label: 'GSAP Animated', desc: 'Rotating ring with dot', emoji: '⚡' },
];

const ACCENT_COLORS = [
  { label: 'Violet', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Orange', value: '#f97316' },
];

const Settings = ({ onClose }) => {
  const { cursorStyle, setCursorStyle, accentColor, setAccentColor, soundEnabled, toggleSound, threeBgEnabled, toggleThreeBg, bgScene, setBgScene } = useUIStore();
  const { user, updateUser } = useAuthStore();
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  }, []);

  const handleAccentChange = async (color) => {
    setAccentColor(color);
    try {
      await api.patch('/api/users/profile', { theme: { accentColor: color } });
      updateUser({ theme: { ...user?.theme, accentColor: color } });
    } catch {}
  };

  const handleCursorChange = async (style) => {
    setCursorStyle(style);
    try {
      await api.patch('/api/users/profile', { theme: { cursorStyle: style } });
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-xl"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div ref={containerRef} className="w-full max-w-lg backdrop-blur-xl bg-white/[0.05] border border-white/[0.09] rounded-2xl shadow-glass overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Lightning size={15} weight="fill" className="text-white" />
            </div>
            <h2 className="text-white font-display font-semibold text-lg">Settings</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-6 space-y-7 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* 3D Scene */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkle size={15} weight="fill" className="text-violet-400" />
              <h3 className="text-white/80 font-medium text-sm">3D Scene</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BG_SCENES.map(({ id, label, desc, emoji, colors }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setBgScene(id)}
                  className={`p-3 rounded-xl text-left border transition-all ${bgScene === id ? 'border-violet-500/50 bg-violet-600/15' : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl leading-none">{emoji}</span>
                    <div className="flex gap-1">
                      {colors.map((c) => (
                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm font-medium ${bgScene === id ? 'text-violet-300' : 'text-white/70'}`}>{label}</p>
                  <p className="text-white/30 text-xs mt-0.5 leading-snug">{desc}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Cursor style */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CursorClick size={15} className="text-violet-400" />
              <h3 className="text-white/80 font-medium text-sm">Cursor Style</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CURSOR_STYLES.map(({ id, label, desc, emoji }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCursorChange(id)}
                  className={`p-3 rounded-xl text-left border transition-all ${cursorStyle === id ? 'border-violet-500/50 bg-violet-600/15' : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]'}`}
                >
                  <span className="text-2xl mb-2 block">{emoji}</span>
                  <p className={`text-sm font-medium ${cursorStyle === id ? 'text-violet-300' : 'text-white/70'}`}>{label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Accent color */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <PaintBrush size={15} weight="fill" className="text-violet-400" />
              <h3 className="text-white/80 font-medium text-sm">Accent Color</h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {ACCENT_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleAccentChange(value)}
                  title={label}
                  className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${accentColor === value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: value, boxShadow: accentColor === value ? `0 0 16px ${value}60` : 'none' }}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                title="Custom color"
              />
            </div>
          </section>

          {/* Toggle options */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={15} weight="fill" className="text-violet-400" />
              <h3 className="text-white/80 font-medium text-sm">Experience</h3>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="3D Background"
                desc="Animated Three.js particle background"
                value={threeBgEnabled}
                onToggle={toggleThreeBg}
              />
              <ToggleRow
                label="Sound Effects"
                desc="Play sounds for messages and notifications"
                value={soundEnabled}
                onToggle={toggleSound}
              />
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const ToggleRow = ({ label, desc, value, onToggle }) => (
  <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
    <div>
      <p className="text-white/80 text-sm font-medium">{label}</p>
      <p className="text-white/30 text-xs">{desc}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 ${value ? 'bg-violet-600' : 'bg-white/10'}`}
      style={{ height: '22px' }}
    >
      <motion.div
        layout
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
        animate={{ left: value ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    </button>
  </div>
);

export default Settings;
