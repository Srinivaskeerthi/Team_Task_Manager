import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Bell, Shield, Save, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { updateProfileAPI, changePasswordAPI } from '../api/users';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'purple', label: 'Cosmic Purple', primary: '#7c5cfc', accent: '#00d4ff' },
  { id: 'blue', label: 'Ocean Blue', primary: '#3b82f6', accent: '#06b6d4' },
  { id: 'green', label: 'Emerald', primary: '#10b981', accent: '#34d399' },
  { id: 'rose', label: 'Rose Gold', primary: '#f43f5e', accent: '#fb7185' },
  { id: 'amber', label: 'Sunset', primary: '#f59e0b', accent: '#fbbf24' },
];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Change password state
  const [showPwForm, setShowPwForm]     = useState(false);
  const [currentPw, setCurrentPw]       = useState('');
  const [newPw, setNewPw]               = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [pwLoading, setPwLoading]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfileAPI({ name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (e) { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('New passwords do not match'); return; }
    setPwLoading(true);
    try {
      await changePasswordAPI({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully! 🔒');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={18} /> Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-xl font-bold text-white">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#7c5cfc]/10 text-[#7c5cfc] capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Theme Mode</label>
            <div className="flex gap-3">
              {['dark', 'light'].map(t => (
                <button key={t} onClick={theme !== t ? toggleTheme : undefined} className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${theme === t ? 'bg-[#7c5cfc]/15 text-[#7c5cfc] border border-[#7c5cfc]/30' : 'btn-secondary'}`}>
                  {t} Mode
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Accent Color</label>
            <div className="flex gap-3">
              {THEMES.map(t => (
                <button key={t.id} className="group flex flex-col items-center gap-1" title={t.label}>
                  <div className="w-10 h-10 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-all" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }} />
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={18} /> Security</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Email: <span className="font-medium">{user?.email}</span></p>
          </div>

          {!showPwForm ? (
            <button onClick={() => setShowPwForm(true)} className="btn-secondary text-sm flex items-center gap-2">
              <Lock size={14} /> Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-medium">Change Password</p>

              <div className="relative">
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Current Password</label>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Your current password"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-8" style={{ color: 'var(--color-text-muted)' }}>
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="relative">
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>New Password</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="input-field pr-10"
                  placeholder="8+ chars, uppercase, number, special"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-8" style={{ color: 'var(--color-text-muted)' }}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className="input-field"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={pwLoading} className="btn-primary text-sm py-2 px-4">
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => { setShowPwForm(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                  className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
