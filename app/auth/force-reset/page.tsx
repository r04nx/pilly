'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pilly } from '@/components/pilly';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import { AlertCircle, Lock, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForceResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get current user email to display
    const getUser = async () => {
      const { data: { user } } = await apiClient.supabaseClient.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      } else {
        // No authenticated user, redirect to login
        router.push('/auth/login');
      }
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!password.trim()) {
        throw new Error('New password is required');
      }
      if (!confirmPassword.trim()) {
        throw new Error('Please confirm your new password');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Update password
      const { error: updateError } = await apiClient.updatePassword(password);
      if (updateError) throw new Error(updateError);

      // Clear the must_reset_password flag
      const { error: profileError } = await apiClient.supabaseClient
        .from('profiles')
        .update({ must_reset_password: false })
        .eq('id', (await apiClient.supabaseClient.auth.getUser()).data.user?.id);

      if (profileError) {
        console.error('Failed to clear must_reset_password flag:', profileError);
        // Don't throw error - password was updated successfully
      }

      // Redirect to dashboard
      router.push('/customer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4">
              <Pilly expression="shield" size={100} bubble="Secure your account!" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-foreground">Admin Security</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {userEmail ? `For your security, ${userEmail} requires a password reset` : 'Setting up your secure access'}
            </p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                    minLength={8}
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
                  Updating password...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Set New Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Security Notice:</strong> As an administrator, you're required to set a secure password on first login to protect your account and store data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
