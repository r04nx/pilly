'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import { AlertCircle, Mail, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';

import { Suspense } from 'react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  // Email request form states
  const [email, setEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  // New password form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  
  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await apiClient.supabaseClient.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    checkSession();
  }, []);

  // Determine which form to show: 
  // 1. If we have a code in URL (direct click or legacy flow)
  // 2. If we have an active session (robust callback flow)
  const hasResetCode = code && code.trim() !== '';
  const canResetPassword = hasResetCode || (user && !success);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error: resetError } = await apiClient.resetPassword(email);
      
      if (resetError) {
        throw new Error(resetError);
      }

      setEmailSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!newPassword.trim()) {
        throw new Error('New password is required');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      let resetError;
      
      if (hasResetCode) {
        // If we have a code, use the exchange + update method
        const result = await apiClient.updatePasswordWithCode(code || '', newPassword);
        resetError = result.error;
      } else if (user) {
        // If we are already authenticated (via callback), just update directly
        const result = await apiClient.updatePassword(newPassword);
        resetError = result.error;
      } else {
        throw new Error('Reset session expired. Please request a new link.');
      }
      
      if (resetError) {
        throw new Error(resetError);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading during initial session check
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg p-8 text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your request...</p>
        </Card>
      </div>
    );
  }

  // Show success message after password reset
  if (success && canResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Password Reset Successful</h1>
            <p className="text-sm text-muted-foreground mt-4">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link href="/auth/login" className="inline-block mt-6">
              <Button>Sign In</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Show success message after email request
  if (emailSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-sm text-muted-foreground mt-4">
              We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p>The link will expire in 24 hours. If you don't see the email, check your spam folder.</p>
            </div>
            <Link href="/auth/login" className="inline-block mt-6">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Show new password form when can reset
  if (canResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
              <p className="text-sm text-muted-foreground mt-2">Enter your new password below</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Set New Password
                  </>
                )}
              </Button>
            </form>

            {/* Back to Sign In */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-2">Enter your email to receive reset instructions</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </Field>
            </FieldGroup>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          {/* Back to Sign In */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg p-8 text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading reset options...</p>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
