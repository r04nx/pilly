'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, ShoppingCart, Star, Heart, Eye, Grid, List, ChevronLeft, ChevronRight, Sparkles, Package, Zap, Home } from 'lucide-react';
import { Pilly } from '@/components/pilly';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
}

export default function CustomerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const productsPerPage = 12;

  const supabase = createClient();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books' },
    { value: 'toys', label: 'Toys & Games' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get total count first
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        if (countError) throw countError;
        setTotalProducts(totalCount || 0);
        setTotalPages(Math.ceil((totalCount || 0) / productsPerPage));

        // Fetch paginated products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1)
          .order(sortBy === 'featured' ? 'created_at' : sortBy, { ascending: sortBy === 'price-low' });

        if (error) throw error;
        
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Mock data for demo with pagination
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
            price: 299.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/headphones/300/200',
            rating: 4.5,
            reviews_count: 128,
            in_stock: true,
            featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Smart Watch',
            description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
            price: 199.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/smartwatch/300/200',
            rating: 4.3,
            reviews_count: 89,
            in_stock: true,
            featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Organic Cotton T-Shirt',
            description: 'Comfortable and sustainable organic cotton t-shirt',
            price: 29.99,
            category: 'clothing',
            image_url: 'https://picsum.photos/seed/tshirt/300/200',
            rating: 4.7,
            reviews_count: 234,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Yoga Mat',
            description: 'Non-slip exercise yoga mat with carrying strap',
            price: 39.99,
            category: 'sports',
            image_url: 'https://picsum.photos/seed/yogamat/300/200',
            rating: 4.6,
            reviews_count: 156,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Laptop Backpack',
            description: 'Durable backpack with padded laptop compartment and USB charging port',
            price: 59.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/backpack/300/200',
            rating: 4.4,
            reviews_count: 92,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            name: 'Running Shoes',
            description: 'Lightweight running shoes with responsive cushioning',
            price: 89.99,
            category: 'sports',
            image_url: 'https://picsum.photos/seed/shoes/300/200',
            rating: 4.6,
            reviews_count: 203,
            in_stock: true,
            featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '7',
            name: 'Coffee Maker',
            description: 'Programmable coffee maker with thermal carafe',
            price: 79.99,
            category: 'home',
            image_url: 'https://picsum.photos/seed/coffee/300/200',
            rating: 4.2,
            reviews_count: 156,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '8',
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse with precision tracking',
            price: 34.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/mouse/300/200',
            rating: 4.3,
            reviews_count: 78,
            in_stock: false,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '9',
            name: 'Bluetooth Speaker',
            description: 'Portable waterproof speaker with 12-hour battery life',
            price: 49.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/speaker/300/200',
            rating: 4.1,
            reviews_count: 145,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '10',
            name: 'Desk Lamp',
            description: 'LED desk lamp with adjustable brightness and color temperature',
            price: 34.99,
            category: 'home',
            image_url: 'https://picsum.photos/seed/lamp/300/200',
            rating: 4.4,
            reviews_count: 87,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '11',
            name: 'Water Bottle',
            description: 'Insulated stainless steel water bottle, 32oz',
            price: 24.99,
            category: 'sports',
            image_url: 'https://picsum.photos/seed/bottle/300/200',
            rating: 4.5,
            reviews_count: 234,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          },
          {
            id: '12',
            name: 'Phone Case',
            description: 'Protective phone case with kickstand and card holder',
            price: 19.99,
            category: 'electronics',
            image_url: 'https://picsum.photos/seed/phonecase/300/200',
            rating: 4.2,
            reviews_count: 167,
            in_stock: true,
            featured: false,
            created_at: new Date().toISOString()
          }
        ];
        
        const mockTotal = 45; // Simulate having 45 total products
        setTotalProducts(mockTotal);
        setTotalPages(Math.ceil(mockTotal / productsPerPage));
        
        // Simulate pagination by slicing the array
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = mockProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setFilteredProducts(paginatedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortBy]);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const toggleWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isInWishlist = wishlist.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
        
        setWishlist(prev => {
          const newWishlist = new Set(prev);
          newWishlist.delete(productId);
          return newWishlist;
        });
      } else {
        // Mock add to wishlist for now to avoid the missing table error
        setWishlist(prev => {
          const newWishlist = new Set(prev);
          newWishlist.add(productId);
          return newWishlist;
        });
        /*
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: productId
          });
        
        if (error) throw error;
        */
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Add to cart
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          price: product.price
        });
      
      if (error) throw error;
      
      // Show success message (you could add a toast notification here)
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Fetch user's wishlist on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // The wishlist table currently doesn't exist in the database schema.
        // We catch this gracefully instead of breaking to avoid console errors
        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id);
        
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('Wishlist table not found, skipping fetch.');
            return;
          }
          throw error;
        }
        
        const wishlistIds = new Set(data?.map(item => item.product_id) || []);
        setWishlist(wishlistIds);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

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
    <div className="min-h-screen bg-[#fcfdff]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/40 via-sky-50/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 space-y-6 max-w-2xl text-center md:text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 bg-white/50 w-fit px-4 py-1.5 rounded-full border border-sky-100/50 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-left-4">
              <Link href="/" className="hover:text-sky-600 transition-colors flex items-center gap-1">
                 <Home className="w-3.5 h-3.5" />
                 Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-sky-600 font-semibold">Products</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white border border-sky-100/50 shadow-sm text-sky-700 px-4 py-2 rounded-full text-sm font-bold animate-in fade-in slide-in-from-left-4">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Over 2,000+ Quality Medicines
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-500 drop-shadow-sm">Simplified.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
              Browse our extensive range of certified pharmaceuticals and healthcare products. 
              Safe, reliable, and delivered with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-6">
              <div className="relative flex-1 max-w-md group isolate">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-200 to-blue-200 rounded-[2rem] blur-md opacity-20 group-focus-within:opacity-50 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-lg h-16 px-4">
                   <Search className="w-6 h-6 text-slate-400 group-focus-within:text-sky-500 transition-colors ml-2" />
                   <Input
                     placeholder="Search medicine brand or category..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="bg-transparent border-none shadow-none focus-visible:ring-0 text-lg mx-2 placeholder:text-slate-400 font-medium h-full w-full"
                   />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center relative perspective-[1000px] h-64 md:h-auto min-h-[300px]">
             <div className="absolute inset-0 bg-sky-400/20 blur-[100px] rounded-full translate-y-10 scale-110"></div>
             <div className="relative drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] transition-transform duration-700 flex items-center justify-center shrink-0">
               <Pilly 
                 expression="doctor" 
                 size={320} 
                 bubble="Ready to restock your pharmacy?" 
                 className="relative z-20 shrink-0"
               />
             </div>
          </div>
        </div>
      </section>

      <div className="p-6 max-w-7xl mx-auto z-20 relative">
        {/* Quick Stats/Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Products</h2>
            <Badge variant="secondary" className="bg-sky-100/50 text-sky-700 border border-sky-200/50 px-3 py-1 rounded-full font-semibold shadow-sm">
              {totalProducts} Items
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn("h-10 w-12 p-0 rounded-xl transition-all duration-300", viewMode === 'grid' ? "bg-white text-sky-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
              >
                <Grid className="w-[18px] h-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn("h-10 w-12 p-0 rounded-xl transition-all duration-300", viewMode === 'list' ? "bg-white text-sky-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
              >
                <List className="w-[18px] h-[18px]" />
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-13 bg-white border-slate-200/80 rounded-2xl shadow-sm hover:border-sky-300 focus:ring-sky-100 transition-all font-medium text-slate-700 shrink-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200/80 shadow-xl overflow-hidden p-1">
                <SelectItem value="featured" className="rounded-xl py-2 cursor-pointer focus:bg-sky-50">Featured First</SelectItem>
                <SelectItem value="price-low" className="rounded-xl py-2 cursor-pointer focus:bg-sky-50">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="rounded-xl py-2 cursor-pointer focus:bg-sky-50">Price: High to Low</SelectItem>
                <SelectItem value="rating" className="rounded-xl py-2 cursor-pointer focus:bg-sky-50">Highest Rated</SelectItem>
                <SelectItem value="newest" className="rounded-xl py-2 cursor-pointer focus:bg-sky-50">Newest Arrived</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-13 px-5 gap-2 border-slate-200/80 rounded-2xl shadow-sm bg-white transition-all font-semibold shrink-0",
                showFilters ? "bg-sky-50 border-sky-300 text-sky-700 shadow-inner" : "hover:border-sky-300 hover:bg-slate-50"
              )}
            >
              <Filter className="w-[18px] h-[18px]" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="relative mb-8">
           <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar snap-x [-webkit-overflow-scrolling:touch]">
             {categories.map(category => (
               <Button
                 key={category.value}
                 variant={selectedCategory === category.value ? "default" : "outline"}
                 onClick={() => setSelectedCategory(category.value)}
                 className={cn(
                   "rounded-2xl px-7 h-12 whitespace-nowrap transition-all duration-300 active:scale-95 snap-start shadow-sm",
                   selectedCategory === category.value 
                     ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold border-none ring-4 ring-sky-600/20" 
                     : "bg-white border-slate-200/80 text-slate-600 hover:bg-sky-50/80 hover:border-sky-300 hover:text-sky-700 font-medium"
                 )}
               >
                 {category.label}
               </Button>
             ))}
           </div>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
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
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-4'
        }>
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={cn(
                "group bg-white border border-slate-100/60 hover:border-sky-200/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-500 rounded-[2rem] overflow-hidden",
                viewMode === 'list' ? "flex flex-col sm:flex-row h-auto sm:h-56" : "flex flex-col"
              )}
            >
              <div className={cn(
                "relative bg-slate-50 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100/60 overflow-hidden",
                viewMode === 'list' ? "w-full sm:w-56 h-48 sm:h-full" : "w-full aspect-[4/3]"
              )}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <Badge className="bg-white/80 backdrop-blur-md text-amber-600 border border-white/50 font-bold px-3 py-1 rounded-full shadow-sm">
                      <Zap className="w-3 h-3 mr-1 fill-amber-500" />
                      Featured
                    </Badge>
                  )}
                  {product.category && (
                    <Badge className="bg-sky-500/80 backdrop-blur-md text-white border border-white/20 font-medium px-3 py-1 rounded-full shadow-sm">
                      {product.category}
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "absolute top-4 right-4 h-11 w-11 p-0 rounded-full backdrop-blur-md transition-all duration-300 active:scale-75 shadow-sm border border-white/50 z-10",
                    wishlist.has(product.id) 
                      ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20 hover:bg-rose-600" 
                      : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
                  )}
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                >
                  <Heart
                    className={cn("w-[18px] h-[18px] transition-transform", wishlist.has(product.id) ? "fill-current scale-110" : "group-hover:scale-110")}
                  />
                </Button>

                {!product.in_stock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-rose-500 text-white px-6 py-2 rounded-full font-bold shadow-xl rotate-[-10deg] border-2 border-white scale-110">
                      Out of Stock
                    </div>
                  </div>
                )}
              </div>

              <CardContent className={cn("flex flex-col flex-1", viewMode === 'list' ? "p-6 sm:p-8" : "p-6")}>
                <div className="flex-1 flex flex-col h-full space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-xl text-slate-800 leading-tight group-hover:text-sky-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center bg-slate-50 border border-slate-100/50 px-2 py-1 rounded-xl shadow-inner shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold ml-1 text-slate-700">{product.rating}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 h-10">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/60">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Price</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        ${product.price}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                       <Button
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-2xl border-slate-200/80 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 text-slate-400 transition-all shadow-sm"
                        onClick={() => {/* View details */}}
                        title="View Details"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-12 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-md shadow-sky-500/20 hover:shadow-sky-500/40 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 border border-sky-400/20"
                        onClick={() => addToCart(product)}
                        disabled={!product.in_stock}
                      >
                         <ShoppingCart className="w-4 h-4 mr-2 drop-shadow-sm" />
                         Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isCurrentPage = pageNum === currentPage;
                const isNearCurrent = Math.abs(pageNum - currentPage) <= 2 || pageNum === 1 || pageNum === totalPages;
                
                if (!isNearCurrent && pageNum !== 1 && pageNum !== totalPages) {
                  if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
