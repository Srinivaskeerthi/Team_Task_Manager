import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Zap, BarChart3, Users, Shield, Clock, Star, ArrowRight, Menu, X,
  FolderKanban as FolderKanbanIcon, CheckCircle2, Layers, Rocket,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ─── Kanban SVG Icon ──────────────────────────────────────────────────────────
function KanbanIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M8 10v4" /><path d="M12 10v2" /><path d="M16 10v6" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Team Task Manager</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
            How It Works
          </a>
          <Link to="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary text-sm px-5 py-2">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden p-4 space-y-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <a href="#features" className="block text-sm py-2" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-sm py-2" onClick={() => setOpen(false)}>How It Works</a>
          <Link to="/login" className="block text-sm py-2" onClick={() => setOpen(false)}>Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm block text-center" onClick={() => setOpen(false)}>
            Get Started
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c5cfc]/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00d4ff]/15 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c5cfc]/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>

          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 mb-8">
            <Zap size={14} className="text-[#7c5cfc]" />
            <span className="text-sm text-[#9d85fd]">Built for modern teams</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-[var(--color-text-primary)]">Manage Teams.</span><br />
            <span className="gradient-text">Track Progress.</span><br />
            <span className="text-[var(--color-text-primary)]">Boost Productivity.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            The all-in-one platform for teams to collaborate, manage projects, and achieve goals with AI-driven insights and beautiful dashboards.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" id="hero-get-started" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 glow">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" id="hero-sign-in" className="btn-secondary text-base px-8 py-3.5">
              Sign In
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {[
              { icon: KanbanIcon, label: 'Kanban Boards' },
              { icon: Users, label: 'Team Collaboration' },
              { icon: BarChart3, label: 'AI Insights' },
              { icon: Clock, label: 'Focus Mode' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                <Icon size={13} className="text-[#7c5cfc]" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="glass rounded-2xl border border-[var(--color-border)] p-4 glow">
            <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-6 min-h-[300px] flex flex-col gap-6">
              {/* Mock stat row */}
              <div className="grid grid-cols-4 gap-4 w-full">
                {[
                  { label: 'Total Projects', value: '24', color: '#7c5cfc' },
                  { label: 'Tasks Done', value: '189', color: '#10b981' },
                  { label: 'In Progress', value: '42', color: '#00d4ff' },
                  { label: 'Team Members', value: '12', color: '#f59e0b' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center card-hover">
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              {/* Mock kanban mini-preview */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { col: 'To Do', tasks: ['Design mockup', 'API schema'], color: '#8888a0' },
                  { col: 'In Progress', tasks: ['Auth module', 'Dashboard UI'], color: '#00d4ff' },
                  { col: 'Review', tasks: ['RBAC logic'], color: '#7c5cfc' },
                  { col: 'Completed', tasks: ['Project setup', 'DB models', 'CI/CD'], color: '#10b981' },
                ].map(({ col, tasks, color }) => (
                  <div key={col} className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{col}</span>
                    </div>
                    {tasks.map(t => (
                      <div key={t} className="text-[11px] rounded-lg px-2 py-1.5 font-medium truncate"
                        style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                        {t}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: KanbanIcon, title: 'Kanban Boards', desc: 'Drag-and-drop task management with real-time sync across your entire team.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Beautiful charts and insights to track team productivity and project progress.' },
    { icon: Users, title: 'Team Collaboration', desc: 'Role-based access, @mentions, comments, and real-time notifications.' },
    { icon: Shield, title: 'AI Smart Suggestions', desc: 'Intelligent priority, deadline, and assignee recommendations powered by AI.' },
    { icon: Clock, title: 'Focus Mode', desc: 'Pomodoro timer and distraction-free workspace for deep individual work.' },
    { icon: Star, title: 'Gamification', desc: 'Daily streaks, leaderboards, badges, and productivity scores to stay motivated.' },
  ];

  return (
    <section id="features" className="py-24 px-6" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#7c5cfc' }}>
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
            Everything you need to <span className="gradient-text">ship faster</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Powerful, integrated tools to supercharge your team's entire workflow.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 card-hover group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/10 flex items-center justify-center mb-4 group-hover:bg-[#7c5cfc]/20 transition-colors">
                <f.icon size={24} className="text-[#7c5cfc]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Layers,
      title: 'Create a Project',
      desc: 'Sign up and create your first project in seconds. You automatically become the project owner with full control.',
      color: '#7c5cfc',
    },
    {
      number: '02',
      icon: Users,
      title: 'Invite Your Team',
      desc: 'Add team members with a single click. Members get scoped access — they can view tasks and update their own assignments.',
      color: '#00d4ff',
    },
    {
      number: '03',
      icon: Rocket,
      title: 'Track & Ship',
      desc: 'Use Kanban boards, AI insights, and real-time activity feeds to keep your team aligned and deliver on time.',
      color: '#10b981',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#00d4ff' }}>
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
            Up and running in <span className="gradient-text">three steps</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            No steep learning curve. Just a clean, intuitive workflow from day one.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
            style={{ background: 'linear-gradient(90deg, #7c5cfc, #00d4ff, #10b981)', opacity: 0.3 }} />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.55 }}
              className="glass rounded-2xl p-8 card-hover relative"
            >
              {/* Number bubble */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                style={{ background: `${step.color}18`, border: `1.5px solid ${step.color}40` }}>
                <step.icon size={26} style={{ color: step.color }} />
              </div>

              <span className="absolute top-6 right-6 text-4xl font-black opacity-[0.06]"
                style={{ color: step.color, lineHeight: 1 }}>
                {step.number}
              </span>

              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass rounded-3xl p-12 border border-[#7c5cfc]/20 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#7c5cfc]/15 rounded-full blur-[60px]" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={28} className="text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to take your team to the <span className="gradient-text">next level?</span>
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Create your workspace, invite your team, and start shipping — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" id="cta-get-started" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 glow">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login" id="cta-sign-in" className="btn-secondary text-base px-8 py-3.5">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t py-12 px-6" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Team Task Manager</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          © 2026 Team Task Manager. A project management application.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="text-sm hover:text-[#7c5cfc] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
}
