'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Pilly } from '@/components/pilly';
import { CartBadge } from '@/components/cart-badge';
import { GlobalSearch } from '@/components/store/global-search';
import {
  Package,
  ShoppingCart,
  Headset,
  Shield,
  Clock,
  Menu,
  X as XIcon,
  Phone,
  Printer,
  Truck,
  Search,
  UserPlus,
  CreditCard,
  Leaf,
  Settings2,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Grid,
  FlaskConical,
  Container,
  Tag,
  TestTube,
  Check
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (profile?.is_admin || user.user_metadata?.is_admin) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Categories fetch error:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories!products_category_id_fkey(name)')
          .eq('active', true)
          .eq('featured', true)
          .limit(8);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Featured products fetch error:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Pilly expression="running" size={120} className="mb-4" />
          <p className="mt-4 text-muted-foreground animate-pulse font-medium tracking-wide">Pilly is getting things ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Header Info Bar — hidden on mobile to save space */}
      <div className="hidden sm:block bg-primary/95 text-primary-foreground py-2 px-4 sm:px-6 lg:px-8 relative z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /> 416-575-7598</span>
            <span className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer"><Printer className="w-3.5 h-3.5" /> Fax: 905-475-2868</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Best Quality • Best Price • Best Service</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl border-border/50 shadow-sm py-2 sm:py-3' : 'bg-background/0 border-transparent py-3 sm:py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-xl group shrink-0">
            <img src="/brand-logo.png" alt="Paras Pharmacy Logo" className="w-8 h-8 sm:w-11 sm:h-11 object-contain group-hover:scale-110 transition-transform drop-shadow-sm bg-transparent" />
            <div className="flex flex-col leading-tight">
              <span className="text-foreground tracking-tight text-sm sm:text-base">Paras Pharmacy</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-primary -mt-0.5">Supplier</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
            <Link href="/products" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">Products</Link>
            <Link href="#features" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">Features</Link>
            <Link href="#ordering" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">How it works</Link>
          </div>

          <GlobalSearch className="hidden lg:flex flex-1 max-w-sm mx-8" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <CartBadge />

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href={isAdmin ? '/admin/dashboard' : '/products'}>
                    <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary text-xs sm:text-sm">{isAdmin ? 'Admin' : 'My Account'}</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="rounded-full hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login"><Button variant="ghost" size="sm" className="rounded-full font-medium">Log in</Button></Link>
                  <Link href="/auth/register"><Button size="sm" className="rounded-full shadow-lg shadow-primary/25">Register</Button></Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-xl z-50 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            <GlobalSearch className="w-full" />
            {/* Nav links */}
            <div className="flex flex-col gap-1">
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-muted font-medium text-sm">Products</Link>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-muted font-medium text-sm">Features</Link>
              <Link href="#ordering" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-muted font-medium text-sm">How it works</Link>
            </div>
            {/* Auth */}
            <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={isAdmin ? '/admin/dashboard' : '/products'} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">{isAdmin ? 'Admin Dashboard' : 'My Account'}</Button>
                  </Link>
                  <Button variant="ghost" className="w-full rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={async () => { await supabase.auth.signOut(); router.push('/'); setMobileMenuOpen(false); }}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full rounded-full">Log in</Button></Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}><Button className="w-full rounded-full">Register Now</Button></Link>
                </>
              )}
            </div>
            {/* Contact info */}
            <div className="border-t border-border/50 pt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 416-575-7598</span>
              <span className="flex items-center gap-1"><Printer className="w-3 h-3" /> 905-475-2868</span>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten opacity-70 animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten opacity-70 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute bottom-[-10%] right-[30%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-lighten opacity-60" />

          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Hero Content */}
            <div className="text-left space-y-8 relative">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-background/50 text-foreground border border-border shadow-sm backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Toronto's #1 Trusted Provider
              </div>

              <div className="relative">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
                  YOUR ONE-STOP <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent bg-[200%_auto] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    PHARMACY
                  </span>
                  <br /> SOLUTION
                </h1>

                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 lg:translate-x-3/4 hidden md:block opacity-80 hover:opacity-100 transition-opacity hover:scale-110 duration-300 z-50 pointer-events-auto">
                  <Pilly expression="wave" size={80} bubble="Hi! Welcome to Paras!" />
                </div>
              </div>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
                Over <strong className="font-semibold text-foreground">110+</strong> safe & compliant pharmacy packaging solutions. Delivering excellence to pharmacies across Toronto and Canada.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/products">
                  <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full border-border hover:bg-muted/50 backdrop-blur-sm transition-all text-foreground hover:text-foreground">
                    All Products
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 border-t border-border/50 mt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 30}&backgroundColor=b6e3f4`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    +500
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <p className="text-muted-foreground font-medium">Trusted by <strong className="text-foreground">500+</strong> Pharmacies</p>
                </div>
              </div>
            </div>

            <div className="relative lg:ml-auto w-full max-w-lg mt-12 lg:mt-0 z-30 pointer-events-auto group">
              {/* Main Landing Page Hero Image */}
              <div className="relative w-full aspect-square flex items-center justify-center p-4">
                {/* Glow Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-400/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>

                <div className="relative bg-white/50 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[3rem] p-4 shadow-2xl group-hover:shadow-sky-200/20 transition-all duration-700 hover:rotate-2 hover:scale-[1.02] overflow-hidden">
                  <img
                    src="https://flem.xo.je/uploads/brand-logo_2e73a483.png"
                    alt="Pharmacy Supplies Portfolio"
                    className="w-full h-full object-cover rounded-[2.5rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-1000"
                  />

                  {/* Floating Detail Overlays to add depth */}
                  <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-lg group-hover:-translate-y-2 transition-transform duration-500 delay-100">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="absolute bottom-10 right-10 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-lg group-hover:translate-x-2 transition-transform duration-500 delay-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Approved</p>
                    <p className="text-xs font-black text-slate-900">Health Canada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-muted/30 border-y border-border/30">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" /> The Paras Advantage
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Designed for Modern Pharmacies</h2>
            <p className="text-lg text-muted-foreground">Everything you need to package, dispense, and manage your pharmacy inventory efficiently and safely.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-muted border border-border/50 p-10 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl">
              <div className="absolute right-0 bottom-0 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity translate-x-1/4 translate-y-1/4 group-hover:scale-105 duration-700 pointer-events-none text-foreground">
                <Shield className="w-[400px] h-[400px]" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-16 h-16 rounded-2xl bg-background shadow-md border border-border/50 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-foreground">Regulatory Compliance Guaranteed</h3>
                  <p className="text-muted-foreground max-w-md leading-relaxed text-lg">All our packaging solutions meet or exceed Health Canada regulatory requirements, giving you complete peace of mind to focus on your patients.</p>
                </div>
              </div>
            </div>

            {/* Square Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl bg-background border border-border/50 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-125 duration-700"></div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                <Settings2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Custom Branding</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">Personalized labeling and packaging tailored specifically for your pharmacy's unique brand identity.</p>
              <Link href="/products" className="inline-flex items-center text-primary font-bold text-sm hover:underline mt-auto group/link">
                View Options <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Square Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-background border border-border/50 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-125 duration-700"></div>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-500">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Safe & Reliable</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">Tamper-evident, child-resistant, and high-quality materials you and your patients can trust completely.</p>
            </div>

            {/* Rectangular Card (spans 2 on smaller, 2 on lg if we want, but let's just make it span 2) */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-foreground text-background p-10 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-0"></div>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-overlay z-0"></div>

              <div className="absolute -right-10 top-1/2 -translate-y-1/2 group-hover:scale-110 group-hover:-translate-x-4 transition-transform duration-700 z-10 hidden sm:block">
                <div className="drop-shadow-2xl filter blur-[1px] group-hover:blur-0 transition-all opacity-90 group-hover:opacity-100">
                  <Pilly expression="excited" size={240} />
                </div>
              </div>

              <div className="relative z-20 w-full sm:w-2/3 h-full flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-background/20 text-background backdrop-blur-md mb-6 w-fit border border-background/20">
                  <Sparkles className="w-3.5 h-3.5" /> Digital Portal
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Streamlined Digital Ordering</h3>
                <p className="text-background/80 max-w-md text-lg leading-relaxed font-medium">Manage your inventory, place bulk orders, and track shipments in real-time through our modern partner portal.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Package className="w-3.5 h-3.5" /> Shop by Category
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Browse Our Categories</h2>
            <p className="text-lg text-muted-foreground">Find exactly what you need from our comprehensive range of pharmacy supplies.</p>
          </div>

          {/* Smart emoji resolver for Microsoft Fluent 3D icons */}
          {(() => {
            const BASE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
            const getCategoryEmoji = (slug: string, name: string): string => {
              const key = (slug + ' ' + name).toLowerCase();
              if (key.includes('bag') || key.includes('pouch')) return `${BASE}/Objects/Shopping%20Bags.png`;
              if (key.includes('blister') || key.includes('pack') || key.includes('pill')) return `${BASE}/Objects/Pill.png`;
              if (key.includes('bottle') || key.includes('lotion')) return `${BASE}/Objects/Lotion%20Bottle.png`;
              if (key.includes('jar') || key.includes('cream') || key.includes('ointment')) return `${BASE}/Objects/Jar.png`;
              if (key.includes('label') || key.includes('sticker') || key.includes('tag')) return `${BASE}/Objects/Label.png`;
              if (key.includes('vial') || key.includes('ampoule') || key.includes('test')) return `${BASE}/Objects/Test%20Tube.png`;
              if (key.includes('capsule')) return `${BASE}/Objects/Pill.png`;
              if (key.includes('syringe') || key.includes('inject')) return `${BASE}/Medical/Syringe.png`;
              if (key.includes('glove')) return `${BASE}/Objects/Gloves.png`;
              if (key.includes('mask')) return `${BASE}/Objects/Face%20with%20Medical%20Mask.png`;
              if (key.includes('drop') || key.includes('eye') || key.includes('ear')) return `${BASE}/Objects/Droplet.png`;
              if (key.includes('tube') || key.includes('gel')) return `${BASE}/Objects/Lotion%20Bottle.png`;
              if (key.includes('strip') || key.includes('tape')) return `${BASE}/Objects/Adhesive%20Bandage.png`;
              if (key.includes('box') || key.includes('cardboard')) return `${BASE}/Objects/Package.png`;
              if (key.includes('wrap') || key.includes('foil')) return `${BASE}/Objects/Scroll.png`;
              if (key.includes('spoon') || key.includes('measure')) return `${BASE}/Food/Spoon.png`;
              if (key.includes('cotton') || key.includes('swab')) return `${BASE}/Objects/Soft%20Ice%20Cream.png`;
              if (key.includes('spray') || key.includes('aerosol')) return `${BASE}/Objects/Lotion%20Bottle.png`;
              return `${BASE}/Objects/Package.png`; // sensible default
            };
            return null;
          })()}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-background border border-border/50 rounded-2xl p-6 text-center shadow-sm animate-pulse">
                  <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                </div>
              ))
            ) : (
              (() => {
                const BASE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
                const getCategoryEmoji = (slug: string, name: string): string => {
                  const key = (slug + ' ' + name).toLowerCase();
                  if (key.includes('bag') || key.includes('pouch')) return `${BASE}/Objects/Shopping%20Bags.png`;
                  if (key.includes('blister') || key.includes('pack') || key.includes('pill')) return `${BASE}/Objects/Pill.png`;
                  if (key.includes('bottle') || key.includes('lotion')) return `${BASE}/Objects/Lotion%20Bottle.png`;
                  if (key.includes('jar') || key.includes('cream') || key.includes('ointment')) return `${BASE}/Objects/Jar.png`;
                  if (key.includes('label') || key.includes('sticker') || key.includes('tag')) return `${BASE}/Objects/Label.png`;
                  if (key.includes('vial') || key.includes('ampoule') || key.includes('test')) return `${BASE}/Objects/Test%20Tube.png`;
                  if (key.includes('capsule')) return `${BASE}/Objects/Pill.png`;
                  if (key.includes('syringe') || key.includes('inject')) return `${BASE}/Medical/Syringe.png`;
                  if (key.includes('glove')) return `${BASE}/Objects/Gloves.png`;
                  if (key.includes('drop') || key.includes('eye') || key.includes('ear')) return `${BASE}/Objects/Droplet.png`;
                  if (key.includes('tube') || key.includes('gel')) return `${BASE}/Objects/Lotion%20Bottle.png`;
                  if (key.includes('strip') || key.includes('tape')) return `${BASE}/Objects/Adhesive%20Bandage.png`;
                  if (key.includes('box') || key.includes('cardboard')) return `${BASE}/Objects/Package.png`;
                  if (key.includes('spray') || key.includes('aerosol')) return `${BASE}/Objects/Lotion%20Bottle.png`;
                  return `${BASE}/Objects/Package.png`;
                };

                const displayList = categories.length > 0 ? categories : [
                  { id: 'bags', name: 'Bags', slug: 'bags', image_url: '' },
                  { id: 'blister-packs', name: 'Blister Packs', slug: 'blister-packs', image_url: '' },
                  { id: 'bottles', name: 'Bottles', slug: 'bottles', image_url: '' },
                  { id: 'jars', name: 'Jars', slug: 'jars', image_url: '' },
                  { id: 'labels', name: 'Labels', slug: 'labels', image_url: '' },
                  { id: 'vials', name: 'Vials', slug: 'vials', image_url: '' },
                ];

                return displayList.map((category: any) => (
                  <Link key={category.id} href={`/products?category=${category.slug || category.id}`} className="group">
                    <div className="relative bg-background border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden">
                      {/* Subtle gradient bg on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 rounded-2xl" />

                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <img
                          src={category.image_url || getCategoryEmoji(category.slug || '', category.name || '')}
                          alt={category.name}
                          className="w-14 h-14 object-contain drop-shadow-lg"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="relative font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{category.name}</h3>
                      {category.product_count > 0 && (
                        <p className="relative text-xs text-muted-foreground mt-1">{category.product_count} items</p>
                      )}
                      {/* Bottom underline accent */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full" />
                    </div>
                  </Link>
                ));
              })()
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Featured Products
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Top Rated Supplies</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center text-primary font-bold hover:underline gap-1">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-[2.5rem]" />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link key={product.id} href="/products" className="group">
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-muted border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-2">{product.categories?.name || 'Pharmacy'}</p>
                      <h3 className="text-xl font-bold mb-4 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black">${product.price}</span>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    {product.stock_quantity === 0 && (
                      <div className="absolute top-6 right-6 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Sold Out
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
                <p className="text-muted-foreground">No featured products found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Coming Soon Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">Coming Soon Products</h2>
          <p className="text-xl text-muted-foreground mb-12">Stay tuned for new exciting pharmacy supplies!</p>
          <Link href="/coming-soon">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              View Coming Soon Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Ordering Process Section */}
      <section id="ordering" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              Hassle-Free Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Four Simple Steps</h2>
          </div>

          <div className="relative grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 mt-10">
            {/* Connecting Line (Only visible on MD and up) */}
            <div className="hidden md:block absolute top-[5.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10"></div>

            {[
              { step: "01", title: "Register", desc: "Create your pharmacy account instantly", icon: UserPlus, expression: "wave" },
              { step: "02", title: "Browse", desc: "Explore our comprehensive catalog", icon: Search, expression: "thinking" },
              { step: "03", title: "Order", desc: "Add to cart and checkout securely", icon: ShoppingCart, expression: "happy" },
              { step: "04", title: "Receive", desc: "Fast, reliable delivery to your door", icon: Truck, expression: "running" },
            ].map((item, i) => (
              <div key={i} className="relative group flex flex-col items-center text-center">
                {/* Step Number Badge */}
                <div className="w-[4.5rem] h-[4.5rem] bg-background rounded-full border-[6px] border-muted flex items-center justify-center text-xl font-bold text-muted-foreground mb-8 shadow-sm group-hover:scale-110 group-hover:border-primary/20 group-hover:text-primary transition-all duration-300 z-10 relative">
                  {item.step}
                  {/* Subtle pulse ring on hover */}
                  <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:animate-ping opacity-20 group-hover:bg-primary z-[-1]"></div>
                </div>

                {/* Content Card */}
                <div className="bg-background border border-border/50 rounded-[2rem] p-8 w-full shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex-1 flex flex-col">
                  {/* Watermark Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-125 transition-all duration-700 pointer-events-none text-foreground">
                    <item.icon className="w-32 h-32" />
                  </div>

                  <div className="mb-6 flex justify-center transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500">
                    <div className="drop-shadow-md">
                      <Pilly expression={item.expression as any} size={80} />
                    </div>
                  </div>
                  <h4 className="font-bold text-xl mb-3 tracking-tight text-foreground">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Enhanced */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 relative z-10 border-y border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {[
              { title: "Fast Delivery", icon: Truck },
              { title: "Secure Payment", icon: CreditCard, comingSoon: true },
              { title: "Premium Quality", icon: Shield },
              { title: "24/7 Support", icon: Headset },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-background shadow-sm border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">{item.title}</p>
                  {item.comingSoon && <p className="text-xs text-primary font-medium">Coming Soon</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Glossy & Premium */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-white/10 rounded-full blur-[120px] mix-blend-overlay"></div>

        {/* Animated grid lines pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 text-primary-foreground py-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-bold tracking-widest uppercase mb-6 shadow-sm">
            Partner With Excellence
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-sm">Ready to upgrade your pharmacy supplies?</h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium mb-12 max-w-2xl mx-auto leading-relaxed shadow-sm filter drop-shadow">Join hundreds of successful pharmacies across Canada who trust Paras.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="h-16 px-12 text-lg rounded-full w-full sm:w-auto hover:bg-white hover:scale-105 transition-all text-primary font-bold shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">
                Create Free Account
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" className="h-16 px-12 text-lg rounded-full w-full sm:w-auto bg-transparent border-2 border-primary-foreground/40 hover:bg-primary-foreground/10 hover:border-primary-foreground text-primary-foreground transition-all backdrop-blur-sm font-bold">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-t border-border relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-foreground mb-6 group">
                <img src="/brand-logo.png" alt="Paras Pharmacy Logo" className="w-14 h-14 object-contain group-hover:scale-110 transition-transform drop-shadow-sm bg-transparent" />
                <div className="flex flex-col leading-tight">
                  <span className="tracking-tight">Paras</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary -mt-0.5">Supplier</span>
                </div>
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                Your trusted, reliable, and compliant source for pharmaceutical packaging and supplies. Quality delivered.
              </p>
              <div className="flex items-center gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer text-muted-foreground"><Phone className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer text-muted-foreground"><Printer className="w-4 h-4" /></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-[0.15em] text-xs">Quick Links</h4>
              <ul className="space-y-4 text-muted-foreground font-medium text-sm">
                <li><Link href="/products" className="hover:text-primary flex items-center gap-2 transition-colors"><ChevronRight className="w-3.5 h-3.5" /> Browse Products</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary flex items-center gap-2 transition-colors"><ChevronRight className="w-3.5 h-3.5" /> Partner Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary flex items-center gap-2 transition-colors"><ChevronRight className="w-3.5 h-3.5" /> Open Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-[0.15em] text-xs">Contact Us</h4>
              <ul className="space-y-5 text-muted-foreground text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">Phone</p>
                    <p className="font-medium">+1 416-575-7598</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Headset className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">Email</p>
                    <p className="font-medium">contact@paraspharmacy.ca</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-[0.15em] text-xs">Business Hours</h4>
              <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 shadow-sm text-sm">
                <div className="flex justify-between mb-3 border-b border-border/50 pb-3">
                  <span className="text-muted-foreground font-medium">Mon - Fri</span>
                  <span className="font-bold text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between mb-3 border-b border-border/50 pb-3">
                  <span className="text-muted-foreground font-medium">Saturday</span>
                  <span className="font-bold text-foreground">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Sunday</span>
                  <span className="font-bold text-destructive">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-medium">
            <p>&copy; {new Date().getFullYear()} Paras Pharmacy Supplier. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/conditions" className="hover:text-foreground transition-colors">Conditions of Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
