'use client';

import { useState, useEffect, useRef } from 'react';
import { Pilly } from './pilly';

interface MinimalPillyProps {
  className?: string;
}

const pillyExpressions = {
  dashboard: 'doctor',
  products: 'holding-pill',
  orders: 'package',
  support: 'medkit',
  account: 'lab-coat',
  idle: 'happy'
};

export function MinimalPilly({ className }: MinimalPillyProps) {
  const [expression, setExpression] = useState('happy');
  const [context, setContext] = useState('idle');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

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
    setExpression(pillyExpressions[context as keyof typeof pillyExpressions]);
  }, [context]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const x = e.clientX - 40; // Offset for center
      const y = e.clientY - 40;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleClick = () => {
    // Cycle through expressions on click
    const expressions = Object.values(pillyExpressions);
    const currentIndex = expressions.indexOf(expression);
    const nextIndex = (currentIndex + 1) % expressions.length;
    setExpression(expressions[nextIndex]);
  };

  return (
    <div
      ref={dragRef}
      className={`fixed z-50 cursor-move transition-transform hover:scale-110 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '80px',
        height: '80px'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <Pilly 
        expression={expression as any} 
        size={80}
        className="transition-all duration-300"
      />
    </div>
  );
}
