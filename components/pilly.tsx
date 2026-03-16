'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export type PillyExpression = 
  | "neutral" | "happy" | "sad" | "angry" | "surprised"
  | "wink" | "sleepy" | "thinking" | "love" | "confused"
  | "excited" | "bored" | "shout" | "medkit" | "doctor"
  | "laptop" | "thumbs-up" | "wave" | "holding-pill" | "briefcase"
  | "running" | "jumping" | "pointing-up" | "pointing-right" | "shield"
  | "clock" | "lab-coat" | "reports" | "crying" | "laughing";

interface PillyProps {
  expression?: PillyExpression;
  size?: number;
  className?: string;
  bubble?: string;
}

export function Pilly({ 
  expression = "happy", 
  size = 100, 
  className,
  bubble 
}: PillyProps) {
  return (
    <div className={cn("inline-flex flex-col items-center gap-2 transition-all duration-300", className)}>
      {bubble && (
        <div className="relative mb-2">
          <div className="bg-white/40 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(14,165,233,0.15)] rounded-2xl p-3 px-4 text-sm font-semibold text-sky-900 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 ring-1 ring-sky-100/20">
            {bubble}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 backdrop-blur-md border-r border-b border-white/40 rotate-45 ring-r ring-b ring-sky-100/20"></div>
        </div>
      )}
      <div className="relative group">
        <img 
          src={`/companion/pilly-${expression}.png`}
          alt={`Pilly ${expression}`}
          width={size}
          height={size}
          className="drop-shadow-sm group-hover:drop-shadow-md transition-all group-hover:scale-110 object-contain"
        />
      </div>
    </div>
  );
}

export function FloatingPilly() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] hidden sm:block h-32 w-32">
      <Pilly 
        expression="doctor" 
        size={80} 
        bubble="Need help?" 
      />
    </div>
  );
}
