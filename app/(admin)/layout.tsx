'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Home, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart as ShoppingCartIcon,
  Package as PackageIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.user_metadata?.is_admin) {
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

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/emails', label: 'Emails', icon: Menu },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
                <span className="ml-2">Admin Panel</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Welcome back,</span>
                <span className="font-medium">{user?.user_metadata?.full_name || 'Admin'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOutIcon className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">Admin Panel</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <nav className="flex-1 flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md">
                  {/* Pilly Animation */}
                  <div className="relative mb-6">
                    <div className="inline-block relative">
                      <img
                        src="/companion/pilly-thinking.png"
                        alt="Pilly thinking"
                        className="w-24 h-24 mx-auto animate-pulse"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full" />
                    </div>
                  </div>

                  {/* Loading Text */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Pilly is setting things up...
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Verifying your access and preparing the admin panel
                  </p>

                  {/* Simple Progress */}
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>

                  {/* Pilly Quote */}
                  <div className="mt-6 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 italic">
                      "Admin access verification in progress... Please wait a moment!" 
                    </p>
                    <p className="text-xs text-gray-500 mt-1">- Pilly</p>
                  </div>
                </div>

                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-10 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse" />
                  <div className="absolute top-20 right-20 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-pulse" 
                       style={{ animationDelay: '1s' }} />
                  <div className="absolute bottom-20 left-20 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse" 
                       style={{ animationDelay: '2s' }} />
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
