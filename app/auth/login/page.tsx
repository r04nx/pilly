'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Lock, Mail, LogIn, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') setSuccess('Email verified! You can now sign in.');
    if (params.get('reset') === 'true') setSuccess('Password reset! Please sign in.');
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      // Check profile for admin flag as the source of truth
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user!.id).single();
      const isAdmin = profile?.is_admin || data.user?.user_metadata?.is_admin === true;
      
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(isAdmin ? '/admin/dashboard' : '/products');
      }
      router.refresh();
    } catch (err: any) {
      if (err.message === 'Email not confirmed') {
        setUnverifiedEmail(email);
      } else {
        setUnverifiedEmail('');
      }
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally { setIsLoading(false); }
  };

  const handleResendVerification = async () => {
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSuccess('Verification email sent! Please check your inbox and spam folders.');
      setUnverifiedEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      if (!email) throw new Error('Please enter your email address');
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setSuccess(`Magic link sent to ${email}! Check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally { setIsLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setIsGoogleLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512418490979-92798cccf340?q=80&w=2070&auto=format&fit=crop')` }}
    >
      {/* Overlay to ensure readability and glass effect */}
      <div className="absolute inset-0 bg-sky-900/10 backdrop-blur-[1px]" />
      
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-8 text-center">
            <img
              src="https://flem.xo.je/uploads/brand-logo_2e73a483.png"
              alt="Paras Pharmacy Supplier"
              className="h-14 object-contain mx-auto mb-3 drop-shadow-md"
            />
            <h1 className="text-white text-xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sky-100 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="p-8">
            {/* Alerts */}
            {success && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-2 text-green-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2 text-red-700 text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <button 
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="self-start text-sm font-semibold text-red-800 underline hover:text-red-900 mt-1 disabled:opacity-50"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setTab('password'); setError(''); setSuccess(''); setUnverifiedEmail(''); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${tab === 'password' ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Password
              </button>
              <button
                onClick={() => { setTab('magic'); setError(''); setSuccess(''); setUnverifiedEmail(''); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${tab === 'magic' ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                Magic Link
              </button>
            </div>

            {/* Password Form */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <Link href="/auth/reset-password" className="text-xs text-sky-600 hover:text-sky-700 font-medium">Forgot password?</Link>
                  </div>
                </div>
                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-sky-700 hover:to-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Sign In</>
                  )}
                </button>
              </form>
            )}

            {/* Magic Link Form */}
            {tab === 'magic' && (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sm text-sky-700">
                  <Zap className="w-4 h-4 inline mr-1.5" />
                  Enter your email and we'll send you a one-click sign in link — no password needed!
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-sky-700 hover:to-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
                  ) : (
                    <><Zap className="w-4 h-4" /> Send Magic Link</>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle} disabled={isGoogleLoading}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-sky-600 font-semibold hover:text-sky-700">Create one</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 Paras Pharmacy Supplier · Toronto, Canada
        </p>
      </div>
    </div>
  );
}
