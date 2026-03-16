'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FloatingPillyProps {
  className?: string;
}

const pillyDialogues = {
  dashboard: {
    expression: 'doctor',
    messages: [
      "Hello! Ready to manage your pharmacy?",
      "Your dashboard looks great today!",
      "Need help with anything?",
      "Let's check your orders!"
    ],
    actions: [
      "Viewing analytics",
      "Managing inventory", 
      "Checking orders",
      "Helping customers"
    ]
  },
  products: {
    expression: 'excited',
    messages: [
      "Find your medicines here!",
      "Great choices available!",
      "Need help finding something?",
      "Quality products await!"
    ],
    actions: [
      "Browsing catalog",
      "Searching products",
      "Adding to cart",
      "Helping shop"
    ]
  },
  orders: {
    expression: 'running',
    messages: [
      "Your orders are on the way!",
      "Track your delivery here",
      "Fast shipping activated!",
      "Orders updated successfully!"
    ],
    actions: [
      "Processing orders",
      "Shipping items",
      "Tracking delivery",
      "Managing orders"
    ]
  },
  support: {
    expression: 'thinking',
    messages: [
      "How can I help you today?",
      "24/7 support available!",
      "I'm here to assist!",
      "Let me solve your issue!"
    ],
    actions: [
      "Answering questions",
      "Solving problems",
      "Providing support",
      "Helping users"
    ]
  },
  account: {
    expression: 'wink',
    messages: [
      "Manage your profile settings!",
      "Update your information here",
      "Keep your account secure!",
      "Personalize your experience!"
    ],
    actions: [
      "Updating profile",
      "Changing settings",
      "Securing account",
      "Managing data"
    ]
  },
  idle: {
    expression: 'happy',
    messages: [
      "Welcome to Paras Pharmacy!",
      "How can I assist you?",
      "Great to see you here!",
      "Let's get started!"
    ],
    actions: [
      "Welcoming users",
      "Being helpful",
      "Providing assistance",
      "Ready to help"
    ]
  }
};

export function FloatingPilly({ className }: FloatingPillyProps) {
  const [context, setContext] = useState('idle');
  const [message, setMessage] = useState('');
  const [action, setAction] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Change context based on current path
    const path = window.location.pathname;
    if (path.includes('/customer/dashboard')) setContext('dashboard');
    else if (path.includes('/customer/products')) setContext('products');
    else if (path.includes('/customer/orders')) setContext('orders');
    else if (path.includes('/customer/support')) setContext('support');
    else if (path.includes('/customer/account')) setContext('account');
    else setContext('idle');
  }, []);

  useEffect(() => {
    const contextData = pillyDialogues[context as keyof typeof pillyDialogues];
    const randomMessage = contextData.messages[Math.floor(Math.random() * contextData.messages.length)];
    const randomAction = contextData.actions[Math.floor(Math.random() * contextData.actions.length)];
    
    setMessage(randomMessage);
    setAction(randomAction);

    // Change message every 5 seconds
    const interval = setInterval(() => {
      const newMessage = contextData.messages[Math.floor(Math.random() * contextData.messages.length)];
      const newAction = contextData.actions[Math.floor(Math.random() * contextData.actions.length)];
      setMessage(newMessage);
      setAction(newAction);
    }, 5000);

    return () => clearInterval(interval);
  }, [context]);

  if (!isVisible) return null;

  const contextData = pillyDialogues[context as keyof typeof pillyDialogues];

  return (
    <div className={`fixed top-6 left-6 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <div className="relative group">
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-3 h-3 text-gray-600" />
        </button>

        {/* Pilly Character */}
        <div className="flex items-start gap-3 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border border-white/20">
          <img 
            src={`/companion/pilly-${contextData.expression}.png`}
            alt={`Pilly ${contextData.expression}`}
            width={60}
            height={60}
            className="rounded-lg"
          />
          
          {/* Dialogue Box */}
          <div className="flex-1 max-w-xs">
            <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200">
              {/* Speech bubble tail */}
              <div className="absolute -left-2 top-3 w-0 h-0 border-l-8 border-l-transparent border-b-8 border-b-gray-200 transform rotate-90"></div>
              
              {/* Message */}
              <p className="text-sm text-gray-800 font-medium mb-2 relative z-10">
                {message}
              </p>
              
              {/* Action indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{action}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show Button */}
        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed top-6 left-6 w-8 h-8 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-40"
          >
            <span className="text-white text-xs font-bold">P</span>
          </button>
        )}
      </div>
    </div>
  );
}
