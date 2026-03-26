'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Home, Package, Ticket, User, LogOut, Menu, X, Heart, ShoppingBag } from 'lucide-react';
import { AppCompanion } from '@/components/AppCompanion';
import { CartBadge } from '@/components/cart-badge';
import { useCart } from '@/contexts/cart-context';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { items } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.user_metadata?.is_admin) {
          router.push('/auth/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/customer/products', label: 'Products', icon: Package },
    { href: '/customer/cart', label: 'Cart', icon: ShoppingBag },
    { href: '/customer/dashboard', label: 'Stats', icon: Home },
    { href: '/customer/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/customer/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/customer/support', label: 'Support', icon: Ticket },
    { href: '/customer/account', label: 'Account', icon: User },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between h-12 px-3">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" 
              alt="Paras Logo" 
              className="h-6 w-auto object-contain group-hover:scale-110 transition-transform duration-300" 
            />
            <span className="font-bold text-sky-600 text-sm">Paras</span>
          </Link>
          <div className="flex items-center gap-2">
            <CartBadge />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-muted rounded-lg"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 pt-16" onClick={() => setIsSidebarOpen(false)}>
          <div className="bg-background w-64 h-full overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    pathname === href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-background lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors duration-300">
              <img 
                src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" 
                alt="Paras Logo" 
                className="w-8 h-8 object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">Paras</span>
              <span className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">Pharmacy Supply</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {user && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-12 lg:pt-0">
        {children}
      </div>

      <AppCompanion />

      {/* Global Floating Action Button for Cart */}
      <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-10 duration-500 ease-out">
        <Link href="/customer/cart">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full bg-primary shadow-2xl flex items-center justify-center p-0 border-2 border-white/20 hover:scale-110 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {items.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-destructive text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                  {items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
