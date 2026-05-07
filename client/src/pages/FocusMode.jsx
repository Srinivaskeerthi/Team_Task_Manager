import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowLeft, Maximize, Minimize, Coffee, Target, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODES = [
  { label: 'Focus', minutes: 25, color: '#7c5cfc' },
  { label: 'Short Break', minutes: 5, color: '#10b981' },
  { label: 'Long Break', minutes: 15, color: '#00d4ff' },
];

export default function FocusModePage() {
  const [mode, setMode] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            if (mode === 0) setSessions(p => p + 1);
            // Auto switch to break
            const nextMode = mode === 0 ? (sessions > 0 && (sessions + 1) % 4 === 0 ? 2 : 1) : 0;
            setMode(nextMode);
            return MODES[nextMode].minutes * 60;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running, mode]);

  const switchMode = (idx) => {
    setMode(idx);
    setSeconds(MODES[idx].minutes * 60);
    setRunning(false);
  };

  const reset = () => {
    setSeconds(MODES[mode].minutes * 60);
    setRunning(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - (seconds / (MODES[mode].minutes * 60));
  const circumference = 2 * Math.PI * 140;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[150px] animate-float" style={{ background: `${MODES[mode].color}15` }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[120px] animate-float-delayed" style={{ background: `${MODES[mode].color}10` }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl glass hover:bg-[var(--color-bg-tertiary)] transition-all">
          <ArrowLeft size={16} /> Back
        </Link>
        <button onClick={toggleFullscreen} className="p-2 rounded-xl glass hover:bg-[var(--color-bg-tertiary)] transition-all">
          {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-12">
        {MODES.map((m, i) => (
          <button key={m.label} onClick={() => switchMode(i)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${i === mode ? 'text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
            style={i === mode ? { background: m.color } : {}}
          >
            {i === 0 ? <Target size={14} className="inline mr-1.5" /> : i === 1 ? <Coffee size={14} className="inline mr-1.5" /> : <Coffee size={14} className="inline mr-1.5" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-80 h-80 flex items-center justify-center mb-12"
      >
        <svg className="absolute inset-0 -rotate-90" width="320" height="320">
          <circle cx="160" cy="160" r="140" fill="none" stroke="var(--color-border)" strokeWidth="4" />
          <circle
            cx="160" cy="160" r="140" fill="none"
            stroke={MODES[mode].color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 10px ${MODES[mode].color}40)` }}
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-7xl font-bold tracking-wider font-mono" style={{ color: MODES[mode].color }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{MODES[mode].label}</p>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="p-3 rounded-xl glass hover:bg-[var(--color-bg-tertiary)] transition-all">
          <RotateCcw size={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
          style={{ background: MODES[mode].color, boxShadow: `0 0 30px ${MODES[mode].color}40` }}
        >
          {running ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button className="p-3 rounded-xl glass hover:bg-[var(--color-bg-tertiary)] transition-all">
          <Volume2 size={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Session Count */}
      <div className="mt-8 flex items-center gap-2">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sessions completed:</p>
        <div className="flex gap-1">
          {[...Array(Math.min(sessions, 8))].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ background: MODES[0].color }} />
          ))}
          {[...Array(Math.max(0, 4 - Math.min(sessions, 4)))].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ background: 'var(--color-border)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
