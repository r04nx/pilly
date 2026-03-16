'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, LogIn } from 'lucide-react';
import { Pilly } from '@/components/pilly';

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg p-8 text-center">
        <div className="mb-6">
          <Pilly expression="excited" size={120} bubble="Check your email!" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h1>
        <p className="text-muted-foreground mb-8">
          We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </p>

        <div className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full h-11" variant="outline">
              <LogIn className="w-4 h-4 mr-2" />
              I've verified my email
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full">
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
