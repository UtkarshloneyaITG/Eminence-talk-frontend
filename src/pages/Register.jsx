import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, User, Lock, Mail, CheckCircle } from 'lucide-react';
import { gsap, pageEnter, createRipple } from '@/animations/gsapConfig';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

// ─── Field must live OUTSIDE Register so React never remounts it on re-render ───
const Field = ({ name, label, type = 'text', icon: Icon, placeholder, value, onChange, error, extra, showPassword, onTogglePassword }) => (
  <div>
    <label className="text-white/70 text-sm font-medium mb-2 block">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === 'password' || name === 'confirm' ? 'new-password' : name}
        className={`w-full bg-white/[0.06] border ${
          error ? 'border-red-500/60' : 'border-white/[0.1]'
        } rounded-xl pl-10 ${type === 'password' ? 'pr-10' : 'pr-4'} py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all duration-200`}
      />
      {type === 'password' && name === 'password' && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {name === 'confirm' && value && !error && (
        <CheckCircle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-red-400 text-xs mt-1.5"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
    {extra}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const containerRef = useRef(null);
  const formRef = useRef(null);

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const strength = passwordStrength(form.password);

  useEffect(() => {
    pageEnter(containerRef.current);
    gsap.to('.reg-orb-1', { y: -25, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.reg-orb-2', { y: 30, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 });
  }, []);

  const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.username || form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Only letters, numbers, underscores';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createRipple(e, formRef.current);
    if (!validate()) return;

    const result = await register(form.username, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome to Eminence-Talk!');
      navigate('/chat');
    } else {
      toast.error(result.error);
      gsap.to(formRef.current, { x: -8, duration: 0.07, yoyo: true, repeat: 5, ease: 'none' });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-space-950 flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="reg-orb-1 absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="reg-orb-2 absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-cyan-600/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent blur-xl" />
        <div ref={formRef} className="relative backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 shadow-glass">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">Create account</h1>
            <p className="text-white/50 text-sm">Join Eminence-Talk today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              name="username"
              label="Username"
              icon={User}
              placeholder="yourname"
              value={form.username}
              onChange={set('username')}
              error={errors.username}
            />
            <Field
              name="email"
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
            <Field
              name="password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              extra={
                form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= strength ? strengthColors[strength] : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${strength >= 3 ? 'text-emerald-400' : 'text-white/40'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )
              }
            />
            <Field
              name="confirm"
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-neon disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
