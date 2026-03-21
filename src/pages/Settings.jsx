import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, PaintBrush, CursorClick, Sparkle,
  Monitor, Check, GearSix,
} from '@phosphor-icons/react';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

/* ─── Data ──────────────────────────────────────────────────────────── */
const BG_SCENES = [
  {
    id: 'cosmos', label: 'Cosmos', desc: 'Violet particles & floating orbs', emoji: '🌌',
    colors: ['#6366f1', '#8b5cf6', '#06b6d4'],
    gradient: 'radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.65) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(139,92,246,0.45) 0%, transparent 55%)',
    bgBase: '#050510',
  },
  {
    id: 'aurora', label: 'Aurora', desc: 'Flowing northern lights curtains', emoji: '🌿',
    colors: ['#10b981', '#06b6d4', '#4ade80'],
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.65) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(6,182,212,0.45) 0%, transparent 55%)',
    bgBase: '#020f0a',
  },
  {
    id: 'ember', label: 'Ember', desc: 'Rising fire sparks & embers', emoji: '🔥',
    colors: ['#f97316', '#ef4444', '#fbbf24'],
    gradient: 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.65) 0%, transparent 60%), radial-gradient(ellipse at 80% 55%, rgba(239,68,68,0.45) 0%, transparent 55%)',
    bgBase: '#100502',
  },
  {
    id: 'ocean', label: 'Ocean', desc: 'Bioluminescent deep sea particles', emoji: '🌊',
    colors: ['#3b82f6', '#06b6d4', '#0ea5e9'],
    gradient: 'radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.65) 0%, transparent 60%), radial-gradient(ellipse at 75% 20%, rgba(6,182,212,0.45) 0%, transparent 55%)',
    bgBase: '#020510',
  },
  {
    id: 'neon', label: 'Neon Rain', desc: 'Cyberpunk neon falling rain', emoji: '⚡',
    colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.55) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.55) 0%, transparent 55%)',
    bgBase: '#0a0010',
  },
];

const CURSOR_STYLES = [
  { id: 'none',      label: 'Default',         desc: 'Normal system cursor',                emoji: '🖱️' },
  { id: 'particles', label: 'Particles Trail', desc: 'Leaves colorful particles as you move', emoji: '✨' },
  { id: 'morph',     label: 'Morph Cursor',    desc: 'Morphs shape on hover interactions',  emoji: '🔮' },
  { id: 'magnetic',  label: 'Magnetic',        desc: 'Attracts to interactive elements',     emoji: '🧲' },
  { id: 'gsap',      label: 'GSAP Animated',   desc: 'Rotating ring with dot',               emoji: '⚡' },
];

const ACCENT_COLORS = [
  { label: 'Violet',  value: '#6366f1' },
  { label: 'Purple',  value: '#8b5cf6' },
  { label: 'Pink',    value: '#ec4899' },
  { label: 'Cyan',    value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Orange',  value: '#f97316' },
];

const NAV_SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: PaintBrush },
  { id: 'experience', label: 'Experience', icon: Monitor    },
];

/* ─── Live Preview ───────────────────────────────────────────────────── */
const ThemePreview = ({ accentColor, bgScene, threeBgEnabled }) => {
  const scene = BG_SCENES.find((s) => s.id === bgScene) || BG_SCENES[0];

  const fakeSidebarItems = [
    { name: 'Alice Johnson', msg: 'Hey! How are you?', unread: 2 },
    { name: 'Dev Team',      msg: 'PR review done ✅',  unread: 0, active: true },
    { name: 'Bob Smith',     msg: 'See you tomorrow!', unread: 0 },
    { name: 'Sarah K.',      msg: 'Thanks!',           unread: 1 },
  ];

  const fakeMessages = [
    { id: 1, text: 'Hey! How\'s the new theme?', own: false, time: '2:30 PM' },
    { id: 2, text: 'Love it! Looks amazing 🔥',  own: true,  time: '2:31 PM' },
    { id: 3, text: 'The preview is really cool', own: false, time: '2:31 PM' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.6)]" style={{ aspectRatio: '4/2.5' }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: scene.bgBase }} />

      {/* Scene gradient (simulates 3D bg) */}
      {threeBgEnabled && (
        <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{ background: scene.gradient }} />
      )}

      {/* Subtle particle dots overlay */}
      {threeBgEnabled && (
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, ${scene.colors[0]}40 1px, transparent 1px)`,
            backgroundSize: '18px 18px',
          }}
        />
      )}

      {/* Window chrome (top bar) */}
      <div className="absolute top-0 left-0 right-0 h-5 flex items-center px-2 gap-1 z-20"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500/70" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
        <div className="w-2 h-2 rounded-full bg-green-500/70" />
        <div className="flex-1 mx-2 h-2.5 rounded bg-white/[0.06] flex items-center px-1.5">
          <div className="w-12 h-1 rounded bg-white/20" />
        </div>
      </div>

      {/* App layout */}
      <div className="absolute inset-0 top-5 flex">
        {/* Sidebar */}
        <div className="w-[36%] flex flex-col border-r border-white/[0.07] relative"
          style={{ backgroundColor: 'rgba(8,8,22,0.82)', backdropFilter: 'blur(16px)' }}
        >
          {/* Sidebar header */}
          <div className="px-2 py-2 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border-2 border-white/30" style={{ backgroundColor: accentColor + '60' }} />
              <div className="h-1.5 w-10 rounded-full bg-white/30" />
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-white/10" />
              <div className="w-3 h-3 rounded bg-white/10" style={{ backgroundColor: accentColor + '30' }} />
            </div>
          </div>

          {/* Search bar */}
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07]">
              <div className="w-2 h-2 rounded-sm bg-white/20" />
              <div className="h-1 flex-1 rounded bg-white/10" />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 px-1.5 space-y-0.5 overflow-hidden">
            {fakeSidebarItems.map((item, i) => (
              <div key={i}
                className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg transition-all"
                style={item.active
                  ? { backgroundColor: accentColor + '22', border: `1px solid ${accentColor}40` }
                  : { border: '1px solid transparent' }
                }
              >
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[6px] font-bold text-white"
                  style={{ background: item.active ? accentColor : 'rgba(255,255,255,0.15)' }}
                >
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full mb-0.5"
                    style={{ width: '65%', backgroundColor: item.active ? accentColor + 'cc' : 'rgba(255,255,255,0.3)' }}
                  />
                  <div className="h-1 rounded-full bg-white/10" style={{ width: '80%' }} />
                </div>
                {item.unread > 0 && (
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {item.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-2 py-1.5 border-t border-white/[0.06]">
            <div className="h-1.5 w-14 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-2.5 py-2 border-b border-white/[0.06] flex items-center gap-2"
            style={{ backgroundColor: 'rgba(8,8,22,0.55)', backdropFilter: 'blur(10px)' }}
          >
            <div className="w-5 h-5 rounded-full bg-white/20" />
            <div>
              <div className="h-1.5 w-12 rounded-full bg-white/40 mb-0.5" />
              <div className="h-1 w-8 rounded-full" style={{ backgroundColor: accentColor + '80' }} />
            </div>
            <div className="ml-auto flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-white/[0.07]" />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 px-2.5 py-2 space-y-2 overflow-hidden flex flex-col justify-end">
            {fakeMessages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-1 ${msg.own ? 'justify-end' : 'justify-start'}`}>
                {!msg.own && <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0" />}
                <div className="px-2 py-1 rounded-xl max-w-[72%] flex flex-col gap-0.5"
                  style={msg.own
                    ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 2px 8px ${accentColor}50` }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  <div className="h-1.5 rounded-full bg-white/60" style={{ width: `${50 + msg.id * 20}%` }} />
                  <div className="h-1.5 rounded-full bg-white/40" style={{ width: `${30 + msg.id * 10}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div className="px-2.5 pb-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)' }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
              <div className="flex-1 h-1.5 rounded-full bg-white/10" />
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 2px 6px ${accentColor}60` }}
              >
                <div className="w-0 h-0" style={{
                  borderTop: '3px solid transparent',
                  borderBottom: '3px solid transparent',
                  borderLeft: '5px solid white',
                  marginLeft: '1px',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Section components ─────────────────────────────────────────────── */
const SectionDivider = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <Icon size={14} weight="fill" style={{ color: 'var(--accent)' }} />
      <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

const AppearanceSection = ({ accentColor, onAccentChange, bgScene, onSceneChange, cursorStyle, onCursorChange }) => {
  const activeCursor = CURSOR_STYLES.find((c) => c.id === cursorStyle) || CURSOR_STYLES[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-display font-semibold text-xl mb-1">Appearance</h2>
        <p className="text-white/40 text-sm">Customize colors, background scene, and cursor style.</p>
      </div>

      {/* ── Row 1: Accent (left) + 3D Scene (right) ── */}
      <div className="grid grid-cols-2 gap-5 items-start">

        {/* Accent Color */}
        <div className="space-y-3">
          <SectionDivider icon={PaintBrush} label="Accent Color" />
          <p className="text-white/30 text-xs">Applied to buttons, highlights, and sent messages.</p>

          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onAccentChange(value)}
                title={label}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 flex items-center justify-center ${accentColor === value ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`}
                  style={{ backgroundColor: value, boxShadow: accentColor === value ? `0 0 20px ${value}70` : 'none' }}
                >
                  {accentColor === value && <Check size={14} weight="bold" className="text-white drop-shadow" />}
                </div>
                <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-all">
            <div className="relative">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentChange(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent opacity-0 absolute inset-0"
                title="Custom color"
              />
              <div
                className="w-9 h-9 rounded-xl border-2 border-white/20 flex items-center justify-center pointer-events-none"
                style={{ backgroundColor: accentColor }}
              >
                <PaintBrush size={11} className="text-white/70" />
              </div>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Custom Color</p>
              <p className="text-white/40 text-xs font-mono mt-0.5">{accentColor}</p>
            </div>
            <div className="ml-auto text-white/30 text-xs">Click to pick</div>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="space-y-3">
          <SectionDivider icon={Sparkle} label="3D Scene" />
          <p className="text-white/30 text-xs">Animated background that fills your chat environment.</p>

          <div className="space-y-1.5">
            {BG_SCENES.map(({ id, label, desc, emoji, colors, gradient, bgBase }) => {
              const isActive = bgScene === id;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSceneChange(id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all duration-200"
                  style={isActive ? {
                    borderColor: 'rgba(var(--accent-rgb), 0.4)',
                    backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  } : {
                    borderColor: 'rgba(255,255,255,0.06)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="w-14 h-9 rounded-lg overflow-hidden shrink-0 border border-white/[0.1]" style={{ backgroundColor: bgBase }}>
                    <div className="w-full h-full" style={{ background: gradient }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm leading-none">{emoji}</span>
                      <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/75'}`}>{label}</span>
                    </div>
                    <p className="text-white/30 text-xs truncate">{desc}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {colors.map((c) => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ml-1"
                    style={isActive
                      ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent)' }
                      : { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  >
                    {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>{/* end row-1 grid */}

      {/* ── Row 2: Cursor Style — full width ── */}
      <div className="space-y-3">
        <SectionDivider icon={CursorClick} label="Cursor Style" />

        <div className="flex gap-4">
          {/* Perfect-cube preview box — height driven by the options list */}
          <div
            className="relative w-44 self-stretch shrink-0 rounded-xl border overflow-hidden flex flex-col items-center justify-center gap-2"
            style={{ background: 'rgba(var(--accent-rgb), 0.05)', borderColor: 'rgba(var(--accent-rgb), 0.18)' }}
          >
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <motion.span
              key={activeCursor.id}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-5xl relative z-10"
            >
              {activeCursor.emoji}
            </motion.span>
            <motion.p
              key={activeCursor.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-white/50 font-medium relative z-10 text-center px-2"
            >
              {activeCursor.label}
            </motion.p>
            <motion.p
              key={activeCursor.desc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-white/25 relative z-10 text-center px-3"
            >
              {activeCursor.desc}
            </motion.p>
          </div>

          {/* Options — fill remaining width with 2 columns */}
          <div className="flex-1 grid grid-cols-2 gap-2 content-start">
            {CURSOR_STYLES.map(({ id, label, desc, emoji }) => {
              const isActive = cursorStyle === id;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onCursorChange(id)}
                  className="flex items-center gap-3 px-4 py-3 h-[58px] rounded-xl border text-left transition-all duration-200"
                  style={isActive ? {
                    borderColor: 'rgba(var(--accent-rgb), 0.4)',
                    backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  } : {
                    borderColor: 'rgba(255,255,255,0.06)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={isActive ? { backgroundColor: 'rgba(var(--accent-rgb), 0.18)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/70'}`}>{label}</p>
                    <p className="text-white/30 text-xs mt-0.5 truncate">{desc}</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                    style={isActive
                      ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent)' }
                      : { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  >
                    {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>{/* end cursor row */}
    </div>
  );
};


const ToggleRow = ({ label, desc, value, onToggle }) => (
  <div className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
    <div>
      <p className="text-white/85 text-sm font-medium">{label}</p>
      <p className="text-white/30 text-xs mt-0.5">{desc}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none ${value ? 'bg-violet-600' : 'bg-white/10'}`}
      style={{ width: 44, height: 24 }}
    >
      <motion.div
        layout
        className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ left: value ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    </button>
  </div>
);

const ExperienceSection = ({ threeBgEnabled, soundEnabled, onToggleBg, onToggleSound }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-white font-display font-semibold text-xl mb-1">Experience</h2>
      <p className="text-white/40 text-sm">Control performance-heavy or immersive features.</p>
    </div>
    <div className="space-y-3">
      <ToggleRow
        label="3D Background"
        desc="Animated Three.js particle background scene"
        value={threeBgEnabled}
        onToggle={onToggleBg}
      />
      <ToggleRow
        label="Sound Effects"
        desc="Play sounds for messages and notifications"
        value={soundEnabled}
        onToggle={onToggleSound}
      />
    </div>
  </div>
);

/* ─── Main Settings Page ─────────────────────────────────────────────── */
const Settings = () => {
  const navigate = useNavigate();
  const {
    cursorStyle, setCursorStyle,
    accentColor, setAccentColor,
    soundEnabled, toggleSound,
    threeBgEnabled, toggleThreeBg,
    bgScene, setBgScene,
  } = useUIStore();
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('appearance');

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

  const currentScene = BG_SCENES.find((s) => s.id === bgScene) || BG_SCENES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-base flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.02] flex-shrink-0">
        <motion.button
          whileHover={{ x: -2 }}
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          <span className="text-sm font-medium">Back to Chat</span>
        </motion.button>

        <div className="w-px h-5 bg-white/[0.08]" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-neon">
            <GearSix size={13} weight="fill" className="text-white" />
          </div>
          <h1 className="text-white font-display font-semibold text-base">Settings</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left nav ── */}
        <nav className="w-52 flex-shrink-0 border-r border-white/[0.06] p-3 space-y-1 bg-white/[0.01]">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === id
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <Icon size={15} weight={activeSection === id ? 'fill' : 'regular'} />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Center content ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {activeSection === 'appearance' && (
                  <AppearanceSection
                    accentColor={accentColor} onAccentChange={handleAccentChange}
                    bgScene={bgScene} onSceneChange={setBgScene}
                    cursorStyle={cursorStyle} onCursorChange={handleCursorChange}
                  />
                )}
                {activeSection === 'experience' && (
                  <ExperienceSection
                    threeBgEnabled={threeBgEnabled}
                    soundEnabled={soundEnabled}
                    onToggleBg={toggleThreeBg}
                    onToggleSound={toggleSound}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right preview panel ── */}
        <div className="w-[340px] flex-shrink-0 border-l border-white/[0.06] p-5 overflow-y-auto scrollbar-thin bg-white/[0.01] space-y-5">
          {/* Preview label */}
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Live Preview</p>
            <span className="text-[10px] text-white/25 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.07]">
              Updates live
            </span>
          </div>

          {/* The mini preview */}
          <ThemePreview
            accentColor={accentColor}
            bgScene={bgScene}
            threeBgEnabled={threeBgEnabled}
          />

          {/* Scene description callout */}
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: currentScene.colors[0] + '12',
              borderColor: currentScene.colors[0] + '30',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{currentScene.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: currentScene.colors[0] }}>
                {currentScene.label}
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">{currentScene.desc}</p>
            <div className="flex gap-1.5 mt-2.5">
              {currentScene.colors.map((c) => (
                <div key={c} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                  <span className="text-[10px] font-mono text-white/25">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current theme summary */}
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Current Theme</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-white/35 text-xs">Scene</span>
                <span className="text-white/80 text-xs font-medium">
                  {currentScene.emoji} {currentScene.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/35 text-xs">Accent</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: accentColor }} />
                  <span className="text-white/70 text-xs font-mono">{accentColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/35 text-xs">Cursor</span>
                <span className="text-white/80 text-xs font-medium">
                  {CURSOR_STYLES.find((c) => c.id === cursorStyle)?.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/35 text-xs">3D Background</span>
                <span className={`text-xs font-semibold ${threeBgEnabled ? 'text-emerald-400' : 'text-white/25'}`}>
                  {threeBgEnabled ? 'On' : 'Off'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/35 text-xs">Sound</span>
                <span className={`text-xs font-semibold ${soundEnabled ? 'text-emerald-400' : 'text-white/25'}`}>
                  {soundEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
