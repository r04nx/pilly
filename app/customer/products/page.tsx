'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, ShoppingCart, Grid, List, Sparkles, Package, ShoppingBag, Zap, Home, Plus, Minus, Check } from 'lucide-react';
import { Pilly } from '@/components/pilly';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';
import NotifyMeButton from '@/components/store/notify-me-button';
import WishlistButton from '@/components/store/wishlist-button';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  active: boolean;
  featured: boolean;
  stock_quantity: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  image_url?: string | null;
  compare_at_price?: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function CustomerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { items, addToCart: addToCartAction } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const supabase = createClient();

  // Pre-populate filters from URL params (e.g. ?category=bags&search=pill)
  useEffect(() => {
    const cat = searchParams.get('category');
    const q   = searchParams.get('search');
    if (cat) setSelectedCategory(cat);
    if (q)   setSearchTerm(q);
  }, []);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // Fetch categories
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
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('products')
          .select(`
            *,
            categories!products_category_id_fkey(
              id,
              name
            )
          `)
          .eq('active', true);

        // Filter by category if selected
        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'featured':
          default:
            query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Process the data to match our interface
        const processedProducts: Product[] = (data || []).map((product: any) => {
          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: parseFloat(product.price),
            active: product.active,
            featured: product.featured,
            stock_quantity: product.stock_quantity,
            created_by: product.created_by,
            created_at: product.created_at,
            updated_at: product.updated_at,
            category_name: product.categories?.name || null,
            image_url: product.image_url || null,
            compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null
          };
        });

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleAddToCart = async (product: Product) => {
    const qty = quantities[product.id] || 1;
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      await addToCartAction(product, qty);
      toast.success(`Added ${qty} ${product.name} to cart`, {
        icon: <ShoppingCart className="w-4 h-4 text-green-500" />,
        action: {
          label: 'View Cart',
          onClick: () => router.push('/customer/cart')
        }
      });
      // Reset quantity after adding
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [product.id]: false }));
      }, 500);
    }
  };

  const updateProductQuantity = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  // Filter products based on search and price range
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, searchTerm, priceRange]);

  // Add conditional rendering for hero section
  const showHeroSection = !isLoggedIn;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdff] pt-24 p-6">
        <div className="max-w-7xl mx-auto animate-pulse pb-12">
          <div className="flex justify-between items-center mb-8">
             <div className="h-8 bg-slate-200 rounded-full w-48"></div>
             <div className="h-10 bg-slate-200 rounded-2xl w-32"></div>
          </div>
          <div className="flex gap-4 mb-8">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded-2xl w-32 shrink-0"></div>
             ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[22rem] bg-slate-100 rounded-[2rem] border border-slate-200/50 flex flex-col">
                 <div className="w-full h-48 bg-slate-200/80 rounded-t-[2rem]"></div>
                 <div className="p-6 space-y-4 flex-1">
                    <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                    <div className="mt-auto pt-4 flex justify-between items-end border-t border-slate-200/50">
                       <div className="h-8 bg-slate-200 rounded-md w-16"></div>
                       <div className="h-10 bg-slate-200 rounded-xl w-28"></div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff]" data-testid="products-page">
      {/* Mobile-First Hero Section - Only show when not logged in */}
      {showHeroSection && (
      <section className="relative overflow-hidden pt-16 pb-8 px-4 sm:pt-20 sm:pb-16 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/40 via-sky-50/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div className="flex-1 space-y-4 sm:space-y-6 max-w-2xl text-center lg:text-left">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 bg-white/50 w-fit px-3 py-1.5 rounded-full border border-sky-100/50 shadow-sm backdrop-blur-sm">
              <Link href="/" className="hover:text-sky-600 transition-colors flex items-center gap-1">
                 <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                 Home
              </Link>
              <span className="text-sky-600 font-semibold">Products</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white border border-sky-100/50 shadow-sm text-sky-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500" />
              <span className="hidden sm:inline">Quality Pharmaceuticals</span>
              <span className="sm:hidden">Medicines</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-500 drop-shadow-sm">Simplified.</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              Browse our extensive range of certified pharmaceuticals. Safe, reliable, delivered with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4">
              <div className="relative flex-1 max-w-md group isolate w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full blur-md opacity-20 group-focus-within:opacity-50 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-lg h-12 sm:h-16 px-3 sm:px-4">
                   <Search className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                   <Input
                     placeholder="Search medicines..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     data-testid="search-input"
                     className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm sm:text-lg mx-2 placeholder:text-slate-400 font-medium h-full w-full"
                   />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center relative perspective-[1000px] h-48 sm:h-64 lg:h-auto lg:min-h-[300px]">
             <div className="absolute inset-0 bg-sky-400/20 blur-[100px] rounded-full translate-y-10 scale-110"></div>
             <div className="relative drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] transition-transform duration-700 flex items-center justify-center shrink-0">
               <Pilly 
                 expression="doctor" 
                 size={200} 
                 bubble="Find your medications?" 
                 className="relative z-20 shrink-0"
               />
             </div>
          </div>
        </div>
      </section>
      )}

      <div className="max-w-7xl mx-auto z-20 relative px-4 sm:px-6">
        {/* Super Compact Mobile Search & Header */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-3xl font-bold text-slate-800 tracking-tight">Products</h2>
              <span className="bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[10px] sm:text-sm font-bold">
                {filteredProducts.length}
              </span>
            </div>
          </div>
          
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-8 h-9 bg-slate-100/50 border-transparent focus:bg-white focus:ring-1 focus:ring-sky-500 rounded-lg text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
          
          {/* Mobile-First Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex-1 sm:flex-none h-10 sm:h-13 px-3 sm:px-5 gap-2 border-slate-200/80 rounded-xl sm:rounded-2xl shadow-sm bg-white transition-all font-semibold text-xs sm:text-sm",
                showFilters ? "bg-sky-50 border-sky-300 text-sky-700 shadow-inner" : "hover:border-sky-300 hover:bg-slate-50"
              )}
            >
              <Filter className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>

            {/* Sort Dropdown - Mobile Optimized */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 sm:flex-none w-24 sm:w-48 h-10 sm:h-13 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-sm hover:border-sky-300 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs sm:text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-xl sm:rounded-2xl border-slate-200/80 shadow-xl overflow-hidden p-1">
                <SelectItem value="featured" className="rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-sm cursor-pointer focus:bg-sky-50">Featured</SelectItem>
                <SelectItem value="price-low" className="rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-sm cursor-pointer focus:bg-sky-50">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-sm cursor-pointer focus:bg-sky-50">Price: High to Low</SelectItem>
                <SelectItem value="newest" className="rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-sm cursor-pointer focus:bg-sky-50">Newest</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle - Mobile Optimized */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn("h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg transition-all duration-300", viewMode === 'grid' ? "bg-white text-sky-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
              >
                <Grid className="w-3 h-3 sm:w-[18px] sm:h-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn("h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg transition-all duration-300", viewMode === 'list' ? "bg-white text-sky-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
              >
                <List className="w-3 h-3 sm:w-[18px] sm:h-[18px]" />
              </Button>
            </div>
          </div>

        {/* Amazon-style Categories - Horizontal Scroll on Mobile */}
        <div className="relative mb-4 sm:mb-8">
           <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide no-scrollbar snap-x [-webkit-overflow-scrolling:touch]">
             <Button
               key="all"
               variant={selectedCategory === 'all' ? "default" : "outline"}
               onClick={() => setSelectedCategory('all')}
               data-testid="category-filter"
               className={cn(
                 "rounded-lg sm:rounded-2xl px-3 sm:px-7 h-8 sm:h-12 whitespace-nowrap transition-all duration-300 active:scale-95 snap-start shadow-sm text-xs sm:text-sm",
                 selectedCategory === 'all' 
                   ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold border-none ring-2 sm:ring-4 ring-sky-600/20" 
                   : "bg-white border-slate-200/80 text-slate-600 hover:bg-sky-50/80 hover:border-sky-300 hover:text-sky-700 font-medium"
               )}
             >
               All
             </Button>
             {categories.map(category => (
               <Button
                 key={category.id}
                 variant={selectedCategory === category.id ? "default" : "outline"}
                 onClick={() => setSelectedCategory(category.id)}
                 data-testid="category-filter"
                 className={cn(
                   "rounded-lg sm:rounded-2xl px-3 sm:px-7 h-8 sm:h-12 whitespace-nowrap transition-all duration-300 active:scale-95 snap-start shadow-sm text-xs sm:text-sm",
                   selectedCategory === category.id 
                     ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold border-none ring-2 sm:ring-4 ring-sky-600/20" 
                     : "bg-white border-slate-200/80 text-slate-600 hover:bg-sky-50/80 hover:border-sky-300 hover:text-sky-700 font-medium"
                 )}
               >
                 {category.name}
               </Button>
             ))}
           </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

      {/* Products Grid/List */}
      {products.length === 0 && selectedCategory === 'all' && searchTerm === '' && priceRange[0] === 0 && priceRange[1] === 1000 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white border border-slate-100/50 rounded-[3rem] shadow-sm max-w-3xl mx-auto my-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-200/50 blur-[80px] rounded-full scale-150"></div>
            <div className="relative drop-shadow-xl animate-float">
              <Pilly 
                expression="sleepy" 
                size={220} 
                bubble={`We will be back soon!\nAs of ${new Date().toLocaleDateString()}`}
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Store is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
            We are currently restocking our digital shelves and don't have any products available at the moment. Please check back later!
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white border border-slate-100/50 rounded-[3rem] shadow-sm max-w-3xl mx-auto my-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-sky-200/50 blur-[80px] rounded-full scale-150"></div>
            <div className="relative drop-shadow-xl animate-float">
              <Pilly 
                expression="confused" 
                size={220} 
                bubble="Hmm... I can't find that medicine." 
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">No Products Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
            We couldn't find any products matching <span className="font-semibold text-slate-700">"{searchTerm}"</span>. 
            Try adjusting your filters or search for something else!
          </p>
          <Button
            size="lg"
            className="h-14 px-8 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 transition-all active:scale-95 shadow-sm font-bold border-2 border-sky-100"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setPriceRange([0, 1000]);
              setSortBy('featured');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 px-1.5 sm:px-0'
            : 'flex flex-col gap-2 px-1.5 sm:px-0'
        } data-testid="product-grid">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={cn(
                "group bg-white border border-slate-100/60 hover:shadow-lg transition-all duration-500 overflow-hidden",
                viewMode === 'list' ? "flex flex-col sm:flex-row h-auto sm:h-32" : "flex flex-col rounded-lg sm:rounded-2xl"
              )}
              data-testid="product-card"
            >
              <div className={cn(
                "relative bg-slate-50 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100/60 overflow-hidden",
                viewMode === 'list' ? "w-full sm:w-32 h-32 sm:h-full" : "w-full aspect-square"
              )}>
                {product.image_url && product.image_url.trim() !== '' && !imageErrors[product.id] ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    onError={() => setImageErrors(prev => ({ ...prev, [product.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center p-4">
                    <div className="text-center">
                      <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-sky-200 mb-2 mx-auto" />
                      <span className="text-[10px] sm:text-xs text-sky-300 font-medium">No Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Mobile-Optimized Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge className="bg-white/90 backdrop-blur-md text-amber-600 border border-white/50 font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm text-[10px] sm:text-xs">
                      <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 fill-amber-500" />
                      <span className="hidden sm:inline">Featured</span>
                    </Badge>
                  )}
                  {product.category_name && (
                    <Badge className="bg-sky-500/90 backdrop-blur-md text-white border border-white/20 font-medium px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm text-[10px] sm:text-xs">
                      {product.category_name}
                    </Badge>
                  )}
                </div>

                {/* Stock Status Overlay */}
                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-rose-500 text-white px-3 py-1 sm:px-6 sm:py-2 rounded-full font-bold shadow-xl rotate-[-3deg] sm:rotate-[-10deg] border-2 border-white text-[10px] sm:text-sm">
                      Out of Stock
                    </div>
                  </div>
                )}
              </div>

              <CardContent className={cn("flex flex-col flex-1 p-1.5 sm:p-4", viewMode === 'list' ? "flex-row sm:flex-col" : "")}>
                <div className="flex-1 flex flex-col h-full space-y-1 sm:space-y-3">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-[11px] sm:text-lg text-slate-800 leading-[1.2] group-hover:text-blue-600 transition-colors line-clamp-2 h-7 sm:h-12">
                      {product.name}
                    </h3>
                  </div>
                  
                  {/* Mobile-Optimized Description - Hidden on small mobile to keep cards compact */}
                  <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed line-clamp-2 h-7 sm:h-8 hidden sm:block">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="mt-auto pt-1 sm:pt-4 flex flex-col gap-1 sm:gap-3 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] sm:text-2xl font-black text-blue-600 tracking-tight leading-none">
                          ${product.price}
                        </span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-[8px] sm:text-xs text-slate-400 line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Micro Quantity Selector for mobile */}
                      {product.stock_quantity > 0 && (
                        <div className="flex items-center bg-slate-100/80 rounded-md p-0.5 border border-slate-200/50 scale-[0.8] sm:scale-100 origin-right">
                          <button 
                            onClick={(e) => { e.preventDefault(); updateProductQuantity(product.id, -1); }}
                            className="p-0.5 hover:bg-white rounded transition-colors text-slate-500 disabled:opacity-30"
                            disabled={ (quantities[product.id] || 1) <= 1 }
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <span className="w-4 sm:w-8 text-center text-[9px] sm:text-xs font-bold text-slate-700">
                            {quantities[product.id] || 1}
                          </span>
                          <button 
                            onClick={(e) => { e.preventDefault(); updateProductQuantity(product.id, 1); }}
                            className="p-0.5 hover:bg-white rounded transition-colors text-slate-500"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile-Optimized Add to Cart Button */}
                    {product.stock_quantity > 0 ? (
                      <Button
                        size="sm"
                        disabled={addingToCart[product.id]}
                        className={cn(
                          "w-full h-9 sm:h-11 rounded-xl font-bold transition-all active:scale-[0.98] shadow-sm border border-sky-400/20 text-xs sm:text-sm",
                          addingToCart[product.id] 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 hover:shadow-sky-500/40"
                        )}
                        onClick={() => handleAddToCart(product)}
                        data-testid="add-to-cart-button"
                      >
                         {addingToCart[product.id] ? (
                           <>
                             <Check className="w-4 h-4 mr-2 animate-in zoom-in duration-300" />
                             Added!
                           </>
                         ) : (
                           <>
                             <ShoppingCart className="w-3.5 h-3.5 mr-2 drop-shadow-sm" />
                             Add to Cart
                           </>
                         )}
                      </Button>
                    ) : (
                      <NotifyMeButton 
                        productId={product.id} 
                        productName={product.name}
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>
);
}
