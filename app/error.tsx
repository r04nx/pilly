'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pilly } from '@/components/pilly';
import { RefreshCcw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(14,165,233,0.1)] border border-sky-100/50">
        <div className="relative">
          <Pilly 
            expression="crying" 
            size={160} 
            bubble="Ouch! Something broke..." 
            className="drop-shadow-xl"
          />
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-3 h-3" />
            System Error
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Something went wrong!</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We've encountered an unexpected error. Don't worry, Pilly is already on it with his first aid kit!
          </p>
          {process.env.NODE_ENV === 'development' && (
             <div className="mt-4 p-3 bg-slate-50 rounded-lg text-left text-xs font-mono text-sky-600 overflow-auto max-h-32 border border-slate-100">
               {error.message}
             </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={() => reset()}
            className="w-full bg-sky-600 hover:bg-sky-700 h-12 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-95 text-white font-bold"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try to Repair
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-slate-500 h-12 rounded-xl hover:bg-sky-50 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
