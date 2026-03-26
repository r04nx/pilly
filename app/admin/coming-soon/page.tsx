'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/admin/image-uploader';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  EyeOff,
  Calendar,
  Package,
  Star,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ComingSoonProduct {
  id: string;
  name: string;
  description?: string;
  expected_launch_date?: string;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminComingSoon() {
  const [products, setProducts] = useState<ComingSoonProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ComingSoonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ComingSoonProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expected_launch_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    is_active: true,
    image_url: ''
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!showInactive) {
      filtered = filtered.filter(product => product.is_active);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(product => product.priority === priorityFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, showInactive, priorityFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coming_soon_products')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: ComingSoonProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        expected_launch_date: product.expected_launch_date || '',
        priority: product.priority || 'medium',
        is_active: product.is_active,
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        expected_launch_date: '',
        priority: 'medium',
        is_active: true,
        image_url: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('coming_soon_products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Item updated successfully');
      } else {
        const { error } = await supabase
          .from('coming_soon_products')
          .insert(formData);

        if (error) throw error;
        toast.success('Item added successfully');
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('coming_soon_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Item deleted');
      setProducts(products.filter(p => p.id !== productId));
    } catch (error: any) {
      toast.error('Delete failed');
    }
  };

  const toggleActiveStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coming_soon_products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Clock className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#fcfdff] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-8 h-8 text-sky-600" />
            Coming Soon Portal
          </h1>
          <p className="text-slate-500 mt-1">Manage future releases and build market anticipation</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-sky-600 hover:bg-sky-700 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add Future Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {editingProduct ? 'Update Future Release' : 'Announce New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Modernized Insulin Pump X1"
                    required
                    className="h-11 border-slate-200 focus:border-sky-500 transition-all"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold mb-1.5 block">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the upcoming features and value proposition..."
                    rows={4}
                    className="border-slate-200 focus:border-sky-500 transition-all resize-none"
                  />
                </div>

                <ImageUploader 
                  label="Featured Image / Emoji"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="product-images"
                  helperText="Select a professional Microsoft 3D emoji or upload a branded visual."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-semibold mb-1.5 block">Expected Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.expected_launch_date}
                      onChange={(e) => setFormData({ ...formData, expected_launch_date: e.target.value })}
                      className="h-11 border-slate-200 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-sm font-semibold mb-1.5 block">Launch Priority</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full h-11 px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all shadow-sm"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-sky-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-sky-900 cursor-pointer">
                    Visible to Customers
                    <span className="block text-xs font-normal text-sky-700/70">Enable this to show on the public Coming Soon page.</span>
                  </Label>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="h-11 bg-sky-600 hover:bg-sky-700 min-w-[140px]">
                  {isSaving ? 'Processing...' : editingProduct ? 'Save Changes' : 'Announce Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Planned', val: products.length, icon: Package, color: 'sky' },
          { label: 'Publicly Visible', val: products.filter(p => p.is_active).length, icon: Eye, color: 'emerald' },
          { label: 'High Priority', val: products.filter(p => p.priority === 'high').length, icon: Star, color: 'rose' },
          { label: 'Expected Q1', val: products.filter(p => p.expected_launch_date?.startsWith('2026-01') || p.expected_launch_date?.startsWith('2026-02') || p.expected_launch_date?.startsWith('2026-03')).length, icon: Calendar, color: 'violet' }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}
      <Card className="border-none shadow-sm bg-white p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name or feature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 transition-all rounded-xl"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
            >
              <option value="all">Priority: All</option>
              <option value="high">Priority: High</option>
              <option value="medium">Priority: Medium</option>
              <option value="low">Priority: Low</option>
            </select>
            
            <Button 
              variant="outline" 
              onClick={() => setShowInactive(!showInactive)}
              className={`h-11 rounded-xl gap-2 font-medium transition-all ${showInactive ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
            >
              {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid View */}
      {filteredProducts.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">The Future is Empty</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              No items match your current filters. Start announcing new products to build market hype.
            </p>
            <Button onClick={() => handleOpenDialog()} className="bg-sky-600 hover:bg-sky-700 h-11 rounded-xl px-8 shadow-lg shadow-sky-600/20">
              Create First Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 group ${!product.is_active ? 'opacity-70 bg-slate-50' : 'bg-white'}`}>
              <CardContent className="p-0 flex flex-col h-full">
                {/* Visual Header */}
                <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-xl group-hover:bg-sky-50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Clock className="w-16 h-16 text-slate-300 group-hover:text-sky-200" />
                  )}
                  <Badge className={`absolute top-4 left-4 border shadow-sm ${getPriorityColor(product.priority)} uppercase text-[10px] letter-spacing-wide font-bold`}>
                    {product.priority} Priority
                  </Badge>
                  {!product.is_active && (
                    <div className="absolute top-4 right-4 bg-slate-900/80 text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-[10px] backdrop-blur-md">
                      <EyeOff className="w-3 h-3" /> HIDDEN
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                      {product.description || 'No description provided for this upcoming release.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {product.expected_launch_date 
                          ? new Date(product.expected_launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'TBD'}
                      </div>
                      <Badge variant="outline" className="border-slate-200 text-slate-500">
                        ADDED {new Date(product.created_at).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="h-9 w-9 p-0 rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveStatus(product.id, product.is_active)}
                          className="h-9 w-9 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100"
                          title={product.is_active ? 'Hide from public' : 'Show to public'}
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="h-9 w-9 p-0 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
