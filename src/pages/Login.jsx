import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeSlash, Lightning, Lock, EnvelopeSimple } from '@phosphor-icons/react';
import { gsap, pageEnter, createRipple } from '@/animations/gsapConfig';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const containerRef = useRef(null);
  const formRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/chat', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    pageEnter(containerRef.current);
    // Animate floating orbs
    gsap.to('.auth-orb-1', { y: -30, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.auth-orb-2', { y: 20, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 });
    gsap.to('.auth-orb-3', { y: -15, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createRipple(e, formRef.current);
    if (!validate()) return;

    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/chat');
    } else {
      toast.error(result.error);
      gsap.to(formRef.current, { x: -8, duration: 0.07, yoyo: true, repeat: 5, ease: 'none' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-base flex items-center justify-center relative overflow-hidden px-4"
    >
      {/* Animated Background Orbs */}
      <div className="auth-orb-1 absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="auth-orb-2 absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="auth-orb-3 absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-pink-600/8 blur-3xl pointer-events-none" />

      {/* Glass Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent blur-xl" />

        <div
          ref={formRef}
          className="relative backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 shadow-glass"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Lightning size={32} weight="fill" className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
            <p className="text-white/50 text-sm">Sign in to Eminence-Talk</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={`w-full bg-white/[0.06] border ${errors.email ? 'border-red-500/60' : 'border-white/[0.1]'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.08] transition-all duration-200`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs mt-1.5">{errors.email}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password field */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  autoComplete="current-password"
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full bg-white/[0.06] border ${errors.password ? 'border-red-500/60' : 'border-white/[0.1]'} rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.08] transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs mt-1.5">{errors.password}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-neon disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
