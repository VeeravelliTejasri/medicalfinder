import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartHandshake, Lock, Mail, User, Building2, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Demo123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      // Determine where to redirect based on email
      if (email.includes('pharmacy')) {
        navigate('/pharmacy-dashboard');
      } else if (email.includes('admin')) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'user' | 'pharmacy' | 'admin') => {
    setIsLoading(true);
    setError(null);
    try {
      await quickSwitchRole(role);
      if (role === 'pharmacy') navigate('/pharmacy-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/20">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to Medi<span className="text-teal-600">Find</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your reservations, manage stock, or oversee platform metrics.
          </p>
        </div>

        {/* Quick Demo Login Shortcuts */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl border border-indigo-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950">
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-slate-400">Password: Demo123!</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('user')}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center justify-between border border-white/10"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-300" />
                <span className="text-left">
                  <div>Citizen / Patient Demo</div>
                  <div className="text-[10px] text-slate-300 font-normal">user@demo.com</div>
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleQuickLogin('pharmacy')}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center justify-between border border-white/10"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span className="text-left">
                  <div>Apollo Pharmacy Manager Demo</div>
                  <div className="text-[10px] text-slate-300 font-normal">pharmacy@demo.com</div>
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center justify-between border border-white/10"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-300" />
                <span className="text-left">
                  <div>Platform Administrator Demo</div>
                  <div className="text-[10px] text-slate-300 font-normal">admin@demo.com</div>
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@demo.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 font-bold hover:underline">
              Create one here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
