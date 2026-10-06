import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, KeyRound, ArrowLeft, CheckCircle2, UserPlus, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [view, setView] = useState<'login' | 'forgot' | 'reset' | 'signup' | 'verify-signup'>('login');
  const [email, setEmail] = useState('admin@tsmodelchoolnavipet.edu');
  const [password, setPassword] = useState('Admin@123');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.data.token, data.data.admin);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to secure server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo.admin@tsmodelchoolnavipet.edu');
    setPassword('DemoAdmin@123');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        if (data.dev_otp_hint) setDevOtpHint(data.dev_otp_hint);
        setView('reset');
      } else {
        setError(data.message || 'Failed to request password reset.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setView('login');
          setPassword('');
          setOtpCode('');
          setNewPassword('');
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        if (data.dev_otp_hint) setDevOtpHint(data.dev_otp_hint);
        setView('verify-signup');
      } else {
        setError(data.message || 'Sign up failed.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password, otp_code: otpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.data.token, data.data.admin);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg">
            <Shield className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">
            {view === 'login' && 'Secure Admin Portal'}
            {view === 'forgot' && 'Reset Password'}
            {view === 'reset' && 'Enter OTP & New Password'}
            {view === 'signup' && 'New Admin Registration'}
            {view === 'verify-signup' && 'Verify Email OTP'}
          </h1>
          <p className="text-xs text-slate-400">Telangana Model School Navipet Portal</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tsmodelchoolnavipet.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>

            {/* Quick Demo Login Button for Customers */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Load Demo Customer Admin Account
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setView('signup'); setError(''); setSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition font-semibold"
              >
                <UserPlus className="w-4 h-4" /> New Admin? Sign up with OTP verification
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {view === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Administrator Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password (Min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Sign Up & Send Email OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </form>
        )}

        {/* VERIFY SIGNUP OTP VIEW */}
        {view === 'verify-signup' && (
          <form onSubmit={handleVerifySignupSubmit} className="space-y-6">
            {devOtpHint && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs">
                <p><strong>[Email OTP Dispatch Hint]:</strong> Use code <code className="bg-amber-900 px-1.5 py-0.5 rounded text-white font-bold">{devOtpHint}</code></p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Enter 6-Digit Email OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Complete Sign Up'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your registered administrator email address. We will generate and send a One-Time Password (OTP) to your email for secure reset.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tsmodelchoolnavipet.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send One-Time Password (OTP)'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            {devOtpHint && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs">
                <p><strong>[Developer OTP Hint]:</strong> Use code <code className="bg-amber-900 px-1.5 py-0.5 rounded text-white font-bold">{devOtpHint}</code></p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Enter 6-Digit OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password (Min 6 chars)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>Protected System — Max 5 Incorrect Attempts before Lockout & Security Alert.</p>
        </div>
      </div>
    </div>
  );
};
