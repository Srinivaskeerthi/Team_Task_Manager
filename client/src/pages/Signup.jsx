import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Password strength checker
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)                                                      score++;
  if (/[A-Z]/.test(pw))                                                   score++;
  if (/[a-z]/.test(pw))                                                   score++;
  if (/[0-9]/.test(pw))                                                   score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))                 score++;
  return score;
}

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

function PasswordStrength({ password }) {
  const score = useMemo(() => getStrength(password), [password]);
  if (!password) return null;
  const missing = [
    password.length < 8             && '8+ characters',
    !/[A-Z]/.test(password)         && 'uppercase letter',
    !/[a-z]/.test(password)         && 'lowercase letter',
    !/[0-9]/.test(password)         && 'number',
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && 'special character',
  ].filter(Boolean);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? strengthColor[score] : 'var(--color-border)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: score === 5 ? strengthColor[5] : 'var(--color-text-muted)' }}>
        {score === 5 ? '✓ Strong password' : `${strengthLabel[score]} — needs: ${missing.join(', ')}`}
      </p>
    </div>
  );
}

export default function Signup() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const { register, loading }   = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getStrength(password) < 5) {
      toast.error('Please use a stronger password.');
      return;
    }
    try {
      await register({ name, email, password });   // role not sent — backend assigns 'member'
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/20 via-[#13131a] to-[#7c5cfc]/30" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#00d4ff]/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#7c5cfc]/25 rounded-full blur-[80px] animate-float-delayed" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7c5cfc] flex items-center justify-center mx-auto mb-6 glow">
            <Zap size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-3">Join <span className="gradient-text">Team Task Manager</span></h2>
          <p className="text-base mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            Collaborate with your team in minutes.
          </p>
          <div className="glass rounded-2xl p-6 text-left space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Role-Based Access
            </p>
            <div className="flex items-start gap-3">
              <span className="text-xl">👑</span>
              <div>
                <p className="text-sm font-semibold text-[#7c5cfc]">Admin</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Creates projects, assigns tasks, manages team
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🧑‍💻</span>
              <div>
                <p className="text-sm font-semibold text-[#00d4ff]">Member</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Views assigned projects, updates task progress
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Team Task Manager</span>
          </div>

          <h1 className="text-3xl font-bold mb-1">Create account</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Get started with Team Task Manager for free
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" className="input-field pl-10" required autoFocus />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8+ chars, uppercase, number, special"
                  className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <button type="submit" disabled={loading || getStrength(password) < 5}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              style={{ opacity: getStrength(password) < 5 ? 0.6 : 1 }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Account <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-[#7c5cfc] hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
