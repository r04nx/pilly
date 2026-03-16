'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pilly } from '@/components/pilly';
import { Home, MessageCircle, ChevronLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-sky-400/20 blur-[100px] rounded-full scale-150"></div>
          <Pilly 
            expression="confused" 
            size={180} 
            bubble="Wait... where are we?" 
            className="relative z-10 drop-shadow-2xl"
          />
        </div>

        <div className="space-y-4 relative z-10">
          <h1 className="text-7xl font-black text-sky-600 tracking-tighter drop-shadow-sm">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
            Oops! It looks like Pilly took a wrong turn at the medicine cabinet. 
            This page doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center relative z-10">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 h-13 px-8 rounded-2xl shadow-xl shadow-sky-200 transition-all active:scale-95 font-bold">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-sky-200 text-sky-700 h-13 px-8 rounded-2xl bg-white hover:bg-sky-50 transition-all active:scale-95 font-bold shadow-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 text-sm text-slate-400 relative z-10">
          <MessageCircle className="w-4 h-4" />
          <span>Still lost? <Link href="/contact" className="text-sky-600 font-bold hover:underline">Contact Support</Link></span>
        </div>
      </div>
    </div>
  );
}
