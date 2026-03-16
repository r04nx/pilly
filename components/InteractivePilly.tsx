'use client';

import { useState, useEffect } from 'react';
import { Pilly } from './pilly';

interface InteractivePillyProps {
  className?: string;
  context?: 'dashboard' | 'products' | 'orders' | 'support' | 'account' | 'idle';
  interactive?: boolean;
}

const pillyExpressions = {
  dashboard: {
    default: 'doctor',
    hover: 'excited',
    click: 'thumbs-up',
    bubbles: {
      default: ['Hi there!', 'How can I help?', 'Welcome back!'],
      hover: ['Need assistance?', 'Let\'s get started!', 'Great to see you!'],
      click: ['Awesome!', 'You got it!', 'Keep going!']
    }
  },
  products: {
    default: 'holding-pill',
    hover: 'excited',
    click: 'love',
    bubbles: {
      default: ['Find your medicines here!', 'Browse our catalog', 'Quality products await!'],
      hover: ['Click to explore!', 'Great choices here!', 'Need help finding?'],
      click: ['Excellent choice!', 'Added to cart!', 'Happy shopping!']
    }
  },
  orders: {
    default: 'package',
    hover: 'running',
    click: 'thumbs-up',
    bubbles: {
      default: ['Track your orders', 'Delivery on the way', 'Orders updated!'],
      hover: ['Check status here', 'Fast delivery!', 'Order details'],
      click: ['Order confirmed!', 'Shipped successfully!', 'Delivered with care!']
    }
  },
  support: {
    default: 'medkit',
    hover: 'thinking',
    click: 'doctor',
    bubbles: {
      default: ['Need help? I\'m here!', '24/7 support available', 'How can I assist?'],
      hover: ['Ask me anything!', 'I\'m ready to help!', 'Support team ready!'],
      click: ['Help is on the way!', 'Issue resolved!', 'We\'ve got you covered!']
    }
  },
  account: {
    default: 'lab-coat',
    hover: 'wink',
    click: 'thumbs-up',
    bubbles: {
      default: ['Manage your profile', 'Account settings', 'Your health data'],
      hover: ['Update your info', 'Secure account', 'Personalize settings'],
      click: ['Profile updated!', 'Settings saved!', 'All set!']
    }
  },
  idle: {
    default: 'happy',
    hover: 'wave',
    click: 'excited',
    bubbles: {
      default: ['Hello!', 'How are you?', 'Nice day!'],
      hover: ['Hi friend!', 'Need help?', 'Let\'s chat!'],
      click: ['Great!', 'Awesome!', 'Fantastic!']
    }
  }
};

export function InteractivePilly({ 
  className, 
  context = 'idle', 
  interactive = true 
}: InteractivePillyProps) {
  const [expression, setExpression] = useState(pillyExpressions[context].default);
  const [bubble, setBubble] = useState(pillyExpressions[context].bubbles.default[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentContext, setCurrentContext] = useState(context);

  useEffect(() => {
    setCurrentContext(context);
    setExpression(pillyExpressions[context].default);
    setBubble(pillyExpressions[context].bubbles.default[0]);
  }, [context]);

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsAnimating(true);
    setExpression(pillyExpressions[currentContext].hover);
    setBubble(pillyExpressions[currentContext].bubbles.hover[Math.floor(Math.random() * pillyExpressions[currentContext].bubbles.hover.length)]);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleClick = () => {
    if (!interactive) return;
    setIsAnimating(true);
    setExpression(pillyExpressions[currentContext].click);
    setBubble(pillyExpressions[currentContext].bubbles.click[Math.floor(Math.random() * pillyExpressions[currentContext].bubbles.click.length)]);
    
    // Cycle through expressions for more liveliness
    setTimeout(() => {
      setExpression(pillyExpressions[currentContext].default);
      setBubble(pillyExpressions[currentContext].bubbles.default[Math.floor(Math.random() * pillyExpressions[currentContext].bubbles.default.length)]);
      setIsAnimating(false);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setExpression(pillyExpressions[currentContext].default);
    setBubble(pillyExpressions[currentContext].bubbles.default[Math.floor(Math.random() * pillyExpressions[currentContext].bubbles.default.length)]);
  };

  return (
    <div 
      className={`relative inline-flex flex-col items-center gap-2 transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className={`relative ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`}>
        <Pilly 
          expression={expression as any} 
          size={interactive ? 120 : 100}
          bubble={bubble}
          className={`cursor-pointer transition-all duration-300 ${interactive ? 'hover:scale-110 active:scale-95' : ''}`}
        />
      </div>
      
      {interactive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
        </div>
      )}
    </div>
  );
}

export function FloatingInteractivePilly() {
  const [context, setContext] = useState<InteractivePillyProps['context']>('idle');
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

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <div className="relative group">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <span className="text-xs">{isVisible ? '−' : '+'}</span>
        </button>
        
        <InteractivePilly 
          context={context} 
          interactive={true}
          className="transform hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
