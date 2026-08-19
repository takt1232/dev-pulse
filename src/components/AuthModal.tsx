import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Code2,
} from 'lucide-react';
import { User } from '../types';
import { USERS } from '../utils/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  allUsers: User[];
  allowDismiss?: boolean;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

const ROLES = [
  'Lead Full-Stack Developer',
  'Senior Frontend Engineer',
  'Senior Backend Engineer',
  'Product Manager',
  'DevOps & Security',
  'QA Automation Engineer',
  'UI/UX Designer',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  allUsers,
  allowDismiss = false,
}) => {
  const [tab, setTab] = useState<'quick' | 'email' | 'signup'>('quick');

  // Email login state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sign up state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleQuickSelect = (user: User) => {
    onLogin(user);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailInput.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    // Match with existing user or create temporary user
    const existing = allUsers.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (existing) {
      onLogin(existing);
    } else {
      // Auto-create or log in with formatted name
      const namePart = emailInput.split('@')[0];
      const formattedName = namePart
        .split(/[._-]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formattedName || 'Team Member',
        email: emailInput.trim(),
        avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
        role: 'Software Engineer',
      };
      onRegister(newUser);
      onLogin(newUser);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!newEmail.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: selectedAvatar,
      role: newRole,
    };

    onRegister(newUser);
    onLogin(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  DevPulse Authentication
                </h2>
                <p className="text-xs text-slate-500">
                  Select your workspace profile to access boards and tickets
                </p>
              </div>
            </div>

            {allowDismiss && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mt-5">
            <button
              type="button"
              onClick={() => {
                setTab('quick');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'quick'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1-Click Team Logins
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('email');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'email'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Join Workspace
            </button>
          </div>
        </div>

        {/* Tab 1: Quick Select Team Members */}
        {tab === 'quick' && (
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select existing team member:
            </span>

            {allUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickSelect(user)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Email & Password Sign In */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. alex@company.dev"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password / PIN</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400">
                Tip: Enter any password or leave blank for internal mock authentication.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Workspace</span>
            </button>
          </form>
        )}

        {/* Tab 3: Join Workspace (Sign Up) */}
        {tab === 'signup' && (
          <form
            onSubmit={handleSignUp}
            className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
          >
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="jordan@company.dev"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Team Role</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Picker */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Profile Avatar:
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt={`Avatar ${idx}`}
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all ${
                      selectedAvatar === av
                        ? 'ring-3 ring-indigo-600 scale-110 shadow-sm'
                        : 'opacity-70 hover:opacity-100 ring-1 ring-slate-200 dark:ring-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Profile & Sign In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
