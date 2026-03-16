'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { X, MessageCircle } from 'lucide-react';

export function AppCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const messages = [
    "Welcome to Paras Pharmacy! I'm Pilly, your helpful companion.",
    "Need help finding pharmacy supplies? I've got you covered!",
    "Check out our latest eco-friendly packaging solutions!",
    "Questions about regulatory compliance? I can help with that!",
  ];

  useEffect(() => {
    // Show a message occasionally
    const interval = setInterval(() => {
      if (!isOpen) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMessage(randomMessage);
        setIsOpen(true);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {isOpen && (
        <Card className="p-4 max-w-[250px] shadow-xl border-primary/20 bg-white/95 backdrop-blur animate-in fade-in slide-in-from-bottom-5 pointer-events-auto">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Pilly says:</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-full transition"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">"{message}"</p>
        </Card>
      )}

      <button
        onClick={() => {
          if (!isOpen) {
            setMessage("Hello! I'm Pilly. How can I assist you today?");
          }
          setIsOpen(!isOpen);
        }}
        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-2xl border-4 border-primary/10 hover:border-primary/30 transition-all duration-300 pointer-events-auto active:scale-95"
      >
        <Image
          src="/pilly.png"
          alt="Pilly"
          width={48}
          height={48}
          className="transition-transform group-hover:scale-110"
        />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-bounce shadow-md">
          <MessageCircle className="w-3 h-3 text-white" />
        </div>
      </button>
    </div>
  );
}
