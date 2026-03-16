'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Pilly } from '@/components/pilly';
import {
  Package,
  ShoppingCart,
  Headset,
  Shield,
  Clock,
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
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
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
        if (user?.user_metadata?.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
      {/* Header Info Bar */}
      <div className="bg-primary/95 text-primary-foreground py-2 px-4 sm:px-6 lg:px-8 relative z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm font-medium gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /> 416-575-7598</span>
            <span className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer"><Printer className="w-3.5 h-3.5" /> Fax: 905-475-2868</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Best Quality • Best Price • Best Service</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl border-border/50 shadow-sm py-3' : 'bg-background/0 border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl group">
              <img src="/companion/pilly-happy.png" alt="Paras Pharmacy Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-foreground tracking-tight">Paras Pharmacy</span>
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-primary -mt-0.5">Supplier</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
              <Link href="/products" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">Products</Link>
              <Link href="#features" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">Features</Link>
              <Link href="#ordering" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all">How it works</Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('query');
                if (query) {
                  router.push(`/products?search=${encodeURIComponent(query.toString())}`);
                }
              }}
              className="hidden lg:flex items-center relative"
            >
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                name="query"
                type="search"
                placeholder="Search products..."
                className="h-9 pl-9 pr-4 rounded-full bg-muted/50 border border-border/50 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all w-64 shadow-inner"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isAdmin ? (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all border-primary/20 hover:bg-primary/5 hover:text-primary">Admin Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all border-primary/20 hover:bg-primary/5 hover:text-primary">My Dashboard</Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/');
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="rounded-full font-medium">Log in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                    Register Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
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
                    Browse Catalog
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {!user && (
                  <Link href="/auth/register">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full border-border hover:bg-muted/50 backdrop-blur-sm transition-all text-foreground hover:text-foreground">
                      Become a Partner
                    </Button>
                  </Link>
                )}
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

            <div className="relative lg:ml-auto w-full max-w-md perspective-[1000px] mt-12 lg:mt-0 z-30 pointer-events-auto">
              {/* Floating Cards Container */}
              <div className="relative w-full aspect-square transform-style-3d rotate-y-[-5deg] rotate-x-[5deg] group/card">

                {/* Main Card */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transform group-hover/card:translate-z-10 group-hover/card:-translate-y-2 transition-all duration-500 will-change-transform z-10 cursor-pointer">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                  <div className="p-8 border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black shadow-inner border border-border/50 flex items-center justify-center text-primary group-hover/card:scale-110 transition-transform">
                      <Package className="w-8 h-8 drop-shadow-sm" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">Premium Blister Packs</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">In Stock Now</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-center space-y-8 bg-background/50 group-hover/card:bg-primary/5 transition-colors duration-500">
                    <div className="space-y-4">
                      <div className="h-2.5 w-1/3 bg-muted-foreground/20 rounded-full"></div>
                      <div className="h-2.5 w-full bg-muted-foreground/20 rounded-full group-hover/card:bg-primary/20 transition-colors"></div>
                      <div className="h-2.5 w-4/5 bg-muted-foreground/20 rounded-full group-hover/card:bg-primary/20 transition-colors"></div>
                    </div>
                    <div className="flex gap-4 w-full pt-4 border-t border-border/30">
                      <button className="h-12 w-1/3 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-muted-foreground font-semibold cursor-pointer transition-colors focus:ring-2 focus:ring-primary/20 outline-none">- 1 +</button>
                      <button className="h-12 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm cursor-pointer focus:ring-2 focus:ring-primary outline-none">Add to Order</button>
                    </div>
                  </div>
                </div>

                {/* Floating Element 1 - Top Left */}
                <div className="absolute -left-12 top-25 w-48 p-4 bg-background border border-white/20 dark:border-white/10 rounded-2xl shadow-xl transform group-hover/card:translate-z-20 group-hover/card:-translate-y-4 transition-all duration-500 z-20 hidden sm:block cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Compliance</p>
                      <p className="text-sm font-bold text-foreground">100% Ready</p>
                    </div>
                  </div>
                </div>

                {/* Floating Element 2 - Bottom Right */}
                <div className="absolute -right-8 top-100 w-52 p-4 bg-background border border-white/20 dark:border-white/10 rounded-2xl shadow-xl transform group-hover/card:translate-z-30 group-hover/card:-translate-y-4 group-hover/card:translate-x-4 transition-all duration-500 z-30 hidden sm:block delay-75 cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner group-hover/card:scale-110 transition-transform">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Materials</p>
                      <p className="text-sm font-bold text-foreground">Eco-Friendly</p>
                    </div>
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
              { title: "Secure Payment", icon: CreditCard },
              { title: "Premium Quality", icon: Shield },
              { title: "24/7 Support", icon: Headset },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-background shadow-sm border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <p className="text-sm font-bold text-foreground uppercase tracking-widest">{item.title}</p>
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
                <img src="/companion/pilly-happy.png" alt="Paras Pharmacy Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform drop-shadow-sm" />
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
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
