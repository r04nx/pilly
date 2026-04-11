'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Ticket, User, LogOut, Menu, X, Search, Sparkles, Phone, Printer, Home } from 'lucide-react';
import { CartProvider } from '@/contexts/cart-context';
import CartIcon from '@/components/cart/cart-icon';
import { GlobalSearch } from '@/components/store/global-search';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }
        setUser(user);
      } catch {
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navLinks = [
    { href: '/customer/products', label: 'Products', icon: Package },
    { href: '/customer/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/customer/support', label: 'Support', icon: Ticket },
    { href: '/customer/account', label: 'Account', icon: User },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">

        {/* Top info bar — hidden on mobile */}
        <div className="hidden sm:block bg-primary/95 text-primary-foreground py-1.5 px-4 sm:px-6 lg:px-8 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-medium">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> 416-575-7598</span>
              <span className="flex items-center gap-1.5"><Printer className="w-3 h-3" /> Fax: 905-475-2868</span>
            </div>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Best Quality • Best Price • Best Service</span>
          </div>
        </div>

        {/* Main sticky nav */}
        <nav className={`sticky top-0 z-40 transition-all duration-300 border-b ${scrolled ? 'bg-background/90 backdrop-blur-xl shadow-sm border-border/60 py-2' : 'bg-background border-border/30 py-3'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold group shrink-0">
              <img src="/brand-logo.png" alt="Paras Pharmacy" className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-foreground tracking-tight text-sm sm:text-base">Paras Pharmacy</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-primary -mt-0.5">Supplier</span>
              </div>
            </Link>

            {/* Desktop nav pills */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
              <Link href="/" className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${pathname === '/' ? 'bg-background shadow-sm text-primary' : 'hover:bg-background hover:shadow-sm hover:text-primary'}`}>
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${pathname === href ? 'bg-background shadow-sm text-primary' : 'hover:bg-background hover:shadow-sm hover:text-primary'}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </Link>
              ))}
            </div>

            <GlobalSearch className="hidden lg:flex flex-1 max-w-sm mx-4" />

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <CartIcon />

              {/* Desktop sign-out */}
              <div className="hidden md:flex items-center gap-2">
                {user && (
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full hover:bg-destructive/10 hover:text-destructive text-sm">
                    <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
                  </Button>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 bg-background/97 backdrop-blur-xl border-b border-border shadow-xl z-50 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
              {/* Search shortcut */}
              <GlobalSearch className="w-full" />
              {/* Nav links */}
              <div className="flex flex-col gap-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                  <Home className="w-4 h-4" /> Home
                </Link>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
              {/* User + sign out */}
              {user && (
                <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
                  <div className="px-4 py-2 text-xs text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user.email}</span></div>
                  <Button variant="ghost" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full justify-start rounded-xl hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              )}
              {/* Contact */}
              <div className="border-t border-border/50 pt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 416-575-7598</span>
                <span className="flex items-center gap-1"><Printer className="w-3 h-3" /> 905-475-2868</span>
              </div>
            </div>
          )}
        </nav>

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
