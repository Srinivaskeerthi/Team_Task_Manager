import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const { login, loading }    = useAuthStore();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c5cfc]/30 via-[#13131a] to-[#00d4ff]/20" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#7c5cfc]/25 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#00d4ff]/20 rounded-full blur-[80px] animate-float-delayed" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center mx-auto mb-6 glow">
            <Zap size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-3">
            Welcome to <span className="gradient-text">Team Task Manager</span>
          </h2>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Manage Teams. Track Progress. Boost Productivity.
          </p>
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Team Task Manager</span>
          </div>

          <h1 className="text-3xl font-bold mb-1">Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your credentials to access your workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#7c5cfc] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign in <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#7c5cfc] hover:underline font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
