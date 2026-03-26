'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface NotifyMeButtonProps {
  productId: string;
  productName: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
}

export default function NotifyMeButton({ productId, productName, variant = 'outline', className }: NotifyMeButtonProps) {
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email/notify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });

      if (!res.ok) throw new Error('Failed to register notification.');

      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setEmail('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)} 
        variant={variant} 
        className={`gap-2 ${className}`}
      >
        <Bell className="w-4 h-4" />
        Notify Me When In Stock
      </Button>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {success ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg border border-green-100">
          <CheckCircle className="w-4 h-4" />
          You'll be notified when {productName} is back!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Your email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-sm focus:ring-sky-500 border-gray-200"
              disabled={loading}
              required
            />
            <Button type="submit" size="sm" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Notify Me'}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            className="text-xs text-gray-400 hover:text-gray-600 text-left underline"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
