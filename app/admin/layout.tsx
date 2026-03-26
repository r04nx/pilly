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
  FolderOpen,
  Mail,
  Clock,
  CreditCard
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

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user is admin from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
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
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/coming-soon', label: 'Coming Soon', icon: Clock },
    { href: '/admin/emails', label: 'Email Preferences', icon: Mail },
    { href: '/admin/payments', label: 'Payment Testing', icon: CreditCard },
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
              <h1 className="text-xl font-bold text-gray-800">
                {pathname.split('/').pop()?.charAt(0).toUpperCase()}{pathname.split('/').pop()?.slice(1)}
              </h1>
            </div>
            
            <div className="hidden md:flex flex-1 items-center justify-center">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Management Console</h2>
            </div>

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
                <LogOut className="w-4 h-4" />
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
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                <img 
                  src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" 
                  alt="Paras Logo" 
                  className="w-8 h-8 object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight">Paras Admin</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Supplier Portal</span>
              </div>
            </Link>
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
        <main className="flex-1 lg:ml-64 bg-white min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {isLoading ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium">Loading administrative data...</p>
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
