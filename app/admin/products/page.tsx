'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/admin/image-uploader';
import { BulkActionToolbar } from '@/components/admin/bulk-toolbar';
import { AdminPagination } from '@/components/admin/pagination';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  DollarSign,
  Box,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Upload as UploadIcon,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  Save,
  X,
  Copy,
  Menu,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  active?: boolean;
  sku?: string;
  image_url?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  compare_at_price?: number;
  category?: {
    name: string;
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out' | 'low'>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [createForm, setCreateForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    active: true,
    brand: '',
    compare_at_price: 0,
    category_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!showInactive) {
      filtered = filtered.filter(product => product.active !== false);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category_id === categoryFilter);
    }

    if (stockFilter === 'in') {
      filtered = filtered.filter(product => product.stock_quantity > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(product => product.stock_quantity <= 0);
    } else if (stockFilter === 'low') {
      filtered = filtered.filter(product => product.stock_quantity < 10);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, showInactive, categoryFilter, stockFilter]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories!products_category_id_fkey (name)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      // First delete related foreign key references
      await supabase.from('cart_items').delete().eq('product_id', productId);
      await supabase.from('order_items').delete().eq('product_id', productId);
      
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm(product);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          sku: editForm.sku,
          description: editForm.description,
          price: editForm.price,
          stock_quantity: editForm.stock_quantity,
          active: editForm.active,
          brand: editForm.brand,
          compare_at_price: editForm.compare_at_price,
          category_id: editForm.category_id || null,
          image_url: editForm.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct);

      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === editingProduct 
          ? { ...p, ...editForm, updated_at: new Date().toISOString() }
          : p
      ));
      cancelEdit();
    } catch (error) {
      alert('Failed to update product');
    }
  };

  const createProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: createForm.name,
          sku: createForm.sku,
          description: createForm.description,
          price: createForm.price,
          stock_quantity: createForm.stock_quantity,
          active: createForm.active,
          brand: createForm.brand,
          compare_at_price: createForm.compare_at_price,
          category_id: createForm.category_id || null,
          image_url: createForm.image_url,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setProducts([data, ...products]);
        setCreateForm({
          name: '',
          sku: '',
          description: '',
          price: 0,
          stock_quantity: 0,
          active: true,
          brand: '',
          compare_at_price: 0,
          category_id: ''
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      alert('Failed to create product');
    }
  };

  const duplicateProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: `${product.name} (Copy)`,
          sku: `${product.sku}-copy`,
          description: product.description,
          price: product.price,
          stock_quantity: 0,
          active: false,
          brand: product.brand,
          compare_at_price: product.compare_at_price,
          category_id: product.category_id,
          image_url: product.image_url
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setProducts([data, ...products]);
      }
    } catch (error) {
      alert('Failed to duplicate product');
    }
  };

  const toggleActiveStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentStatus })
        .eq('id', productId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length > 0 && selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      // First bulk delete related foreign key references
      await supabase.from('cart_items').delete().in('product_id', selectedIds);
      await supabase.from('order_items').delete().in('product_id', selectedIds);

      const { error } = await supabase.from('products').delete().in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      alert('Failed to delete products');
    }
  };

  const bulkToggleStatus = async (active: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active })
        .in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Brand', 'Price', 'Stock', 'Category', 'Active'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.sku || '',
      p.brand || '',
      p.price,
      p.stock_quantity,
      p.category?.name || 'None',
      p.active ? 'Yes' : 'No'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
          <p className="text-sm text-gray-500">Total Catalog: {products.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert('Import CSV feature coming soon! Ensure your CSV matches the export format.')}>
            <UploadIcon className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Button>
        </div>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle>Create New Product</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Product Name *</label>
                  <Input 
                    value={createForm.name} 
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">SKU</label>
                  <Input 
                    value={createForm.sku} 
                    onChange={e => setCreateForm({ ...createForm, sku: e.target.value })}
                    placeholder="Unique SKU"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  value={createForm.description} 
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Price *</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={createForm.price} 
                    onChange={e => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stock Quantity</label>
                  <Input 
                    type="number" 
                    value={createForm.stock_quantity} 
                    onChange={e => setCreateForm({ ...createForm, stock_quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Brand</label>
                  <Input 
                    value={createForm.brand} 
                    onChange={e => setCreateForm({ ...createForm, brand: e.target.value })}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <Select value={createForm.category_id || ''} onValueChange={(v) => setCreateForm({ ...createForm, category_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Compare at Price</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={createForm.compare_at_price} 
                    onChange={e => setCreateForm({ ...createForm, compare_at_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4">
                <ImageUploader 
                  value={createForm.image_url || ''}
                  onChange={url => setCreateForm({ ...createForm, image_url: url })}
                  label="Product Image"
                  bucket="product-images"
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="create-active"
                  checked={createForm.active}
                  onChange={e => setCreateForm({ ...createForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="create-active" className="text-sm font-semibold">Product is active</label>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button type="button" onClick={createProduct} className="bg-blue-600 hover:bg-blue-700">
                  Create Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/50 border-blue-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Active Catalog</p>
              <p className="text-2xl font-bold text-blue-900">{products.filter(p => p.active !== false).length}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-amber-900">{products.filter(p => p.stock_quantity < 10).length}</p>
            </div>
            <Filter className="w-8 h-8 text-amber-200" />
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-red-900">{products.filter(p => p.stock_quantity <= 0).length}</p>
          </div>
          <Box className="w-8 h-8 text-red-200" />
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Inventory Value</p>
              <p className="text-2xl font-bold text-purple-900">
                ${products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (p.stock_quantity || 0)), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -track-y-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={(v: any) => setStockFilter(v)}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInactive(!showInactive)}
            className={`h-10 px-3 ${showInactive ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
          >
            {showInactive ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Inactive
          </Button>
          
          <Button variant="ghost" size="sm" onClick={fetchData} className="h-10 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <RefreshCw className="w-4 h-4" />
          </Button>

          <div className="h-10 w-px bg-gray-200 mx-1 hidden lg:block" />

          <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={cn("h-8 px-2", viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={cn("h-8 px-2", viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'compact' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('compact')}
              className={cn("h-8 px-2", viewMode === 'compact' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900')}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <BulkActionToolbar 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={bulkDelete}
        onToggleStatus={bulkToggleStatus}
        onExport={handleExportCSV}
      />

      {/* Products Content */}
      <div className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
        viewMode === 'grid' && "bg-transparent border-none shadow-none overflow-visible"
      )}>
        {viewMode === 'list' || viewMode === 'compact' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-3 py-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className={cn(
                    "px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider",
                    viewMode === 'compact' ? "py-1" : "py-2"
                  )}>
                    Product Information
                  </th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory & SKU</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Box className="w-12 h-12 text-gray-200" />
                        <p className="font-medium">No products match your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className={cn(
                        "hover:bg-gray-50/100 transition-colors group",
                        selectedIds.includes(product.id) && "bg-blue-50/50",
                        viewMode === 'compact' ? "h-10" : ""
                      )}
                    >
                      <td className="px-3 py-2">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {editingProduct === product.id ? (
                          <div className="space-y-3">
                            <Input 
                              value={editForm.name || ''} 
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="Product name"
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Input 
                                value={editForm.sku || ''} 
                                onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                                placeholder="SKU"
                                className="text-xs flex-1"
                              />
                              <Input 
                                value={editForm.brand || ''} 
                                onChange={e => setEditForm({ ...editForm, brand: e.target.value })}
                                placeholder="Brand"
                                className="text-xs flex-1"
                              />
                            </div>
                            <Select value={editForm.category_id || ''} onValueChange={(v) => setEditForm({ ...editForm, category_id: v })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "rounded-lg bg-gray-100 flex-shrink-0 relative overflow-hidden ring-1 ring-gray-200",
                              viewMode === 'compact' ? "w-8 h-8" : "w-12 h-12"
                            )}>
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className={cn(
                                  "text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                  viewMode === 'compact' ? "w-4 h-4" : "w-6 h-6"
                                )} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "font-bold text-gray-900 truncate",
                                viewMode === 'compact' ? "text-xs" : "text-sm"
                              )}>
                                {product.name}
                              </p>
                              {viewMode !== 'compact' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold text-gray-500 bg-gray-100">
                                    {product.category?.name || 'Uncategorized'}
                                  </Badge>
                                  {product.brand && (
                                    <span className="text-[10px] text-gray-400 font-medium">{product.brand}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editingProduct === product.id ? (
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              value={editForm.stock_quantity || 0} 
                              onChange={e => setEditForm({ ...editForm, stock_quantity: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                              className="w-20 text-sm"
                            />
                            <span className="text-sm text-gray-500 self-center">units</span>
                          </div>
                        ) : (
                          <div className={cn("space-y-1", viewMode === 'compact' ? "flex items-center gap-2 space-y-0" : "")}>
                            {viewMode !== 'compact' && <p className="text-xs font-mono text-gray-400">{product.sku || 'NO SKU'}</p>}
                            <div className="flex items-center gap-2">
                               <span className={`text-sm font-bold ${
                                 product.stock_quantity <= 0 ? 'text-red-600' : 
                                 product.stock_quantity < 10 ? 'text-amber-600' : 
                                 'text-gray-900'
                               }`}>
                                 {product.stock_quantity}
                               </span>
                               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Units</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editingProduct === product.id ? (
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              step="0.01"
                              value={editForm.price || 0} 
                              onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              className="w-20 text-sm"
                            />
                          </div>
                        ) : (
                          <div className={cn("space-y-1", viewMode === 'compact' ? "flex items-center gap-2 space-y-0" : "")}>
                            <p className="text-sm font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
                            {product.compare_at_price && viewMode !== 'compact' && (
                              <p className="text-xs text-gray-400 line-through">${Number(product.compare_at_price).toFixed(2)}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleActiveStatus(product.id, product.active !== false)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              product.active !== false ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.active !== false ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                          {viewMode !== 'compact' && (
                            <span className={`text-xs font-bold uppercase ${product.active !== false ? 'text-blue-600' : 'text-gray-400'}`}>
                              {product.active !== false ? 'Active' : 'Draft'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {editingProduct === product.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={saveEdit} className="h-8 px-3 text-green-600 hover:bg-green-50">
                              <Save className="w-4 h-4 mr-1" /> Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-8 px-3 text-gray-600 hover:bg-gray-50">
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => startEdit(product)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedProducts.map((product) => (
              <Card 
                key={product.id} 
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-md",
                  selectedIds.includes(product.id) && "ring-2 ring-blue-500 shadow-lg bg-blue-50/10"
                )}
              >
                <div className="absolute top-2 left-2 z-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                  />
                </div>
                
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => startEdit(product)}
                      className="h-8 w-8 rounded-full shadow-lg bg-white"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => deleteProduct(product.id)}
                      className="h-8 w-8 rounded-full shadow-lg bg-white"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="text-[9px] h-4 font-bold border-gray-200">
                      {product.category?.name || 'Pharmacy'}
                    </Badge>
                    <p className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock_quantity <= 0 ? "bg-red-500" : "bg-green-500"
                      )} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        {product.stock_quantity} Units
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleActiveStatus(product.id, product.active !== false)}
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-colors",
                        product.active !== false ? "text-blue-600 bg-blue-50" : "text-gray-400 bg-gray-100"
                      )}
                    >
                      {product.active !== false ? 'Active' : 'Draft'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Footer info */}
        {viewMode !== 'grid' && (
          <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
            <p>Showing {filteredProducts.length} of {products.length} products</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-600" /> <span>Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-200" /> <span>Draft</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
