'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, ArrowRight, Mail } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/95 text-primary-foreground py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Coming Soon Products</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Box Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-primary/5 rounded-2xl flex items-center justify-center">
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png" alt="" className="w-20 h-20 object-contain drop-shadow-md" />
          </div>

          {/* Main Title */}
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            New pharmacy supplies are on the way!
          </h2>

          {/* Dashed Border Box */}
          <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20Places/Rocket.png" alt="" className="w-24 h-24 object-contain drop-shadow-lg" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're working hard to bring you innovative pharmaceutical packaging and supplies. 
              Our team is developing new solutions to meet your pharmacy needs.
            </p>
          </div>

          {/* Placeholder Text */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">Coming soon products will be displayed here</h3>
            <p className="text-muted-foreground text-lg">
              Check back regularly for updates on our latest products and innovations
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/products">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Browse Current Products
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="rounded-full border-border hover:bg-muted/50 transition-all">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us for Updates
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-muted/30 rounded-2xl p-8 border border-border/50">
            <h4 className="text-xl font-bold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-6">
              Be the first to know when our new products launch. Sign up for our newsletter or contact our team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Innovative Solutions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
