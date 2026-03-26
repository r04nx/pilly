'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ImageUploader from '@/components/admin/image-uploader';
import { BulkActionToolbar } from '@/components/admin/bulk-toolbar';
import { AdminPagination } from '@/components/admin/pagination';
import { cn } from '@/lib/utils';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  Package,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Layers,
  Grid,
  List,
  Menu,
  X as XIcon
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  product_count?: number;
  parent_category_id?: string | null;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
    parent_category_id: null as string | null
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!showInactive) {
      filtered = filtered.filter(category => category.is_active);
    }

    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [categories, searchTerm, showInactive]);

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          category_products:products!products_category_id_fkey(count)
        `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const categoriesWithCount = (data || []).map(category => ({
        ...category,
        product_count: category.category_products?.[0]?.count || 0
      }));

      setCategories(categoriesWithCount);
      setFilteredCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(submitData)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(submitData);

        if (error) throw error;
      }

      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0,
      parent_category_id: null
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const editCategory = (category: Category | any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
      parent_category_id: category.parent_category_id
    });
    setShowForm(true);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All products in this category will be unassigned.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const toggleActiveStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);
      if (error) throw error;
      fetchCategories();
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
    if (selectedIds.length > 0 && selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map(c => c.id));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return;
    try {
      const { error } = await supabase.from('categories').delete().in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchCategories();
    } catch (error) {
      alert('Failed to delete categories');
    }
  };

  const bulkToggleStatus = async (active: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: active })
        .in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      fetchCategories();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];
    try {
      await supabase.from('categories').update({ sort_order: targetCategory.sort_order }).eq('id', category.id);
      await supabase.from('categories').update({ sort_order: category.sort_order }).eq('id', targetCategory.id);
      fetchCategories();
    } catch (error) {
      alert('Failed to reorder');
    }
  };

  const getIconUrl = (slug: string) => {
    const base = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects';
    const natureBase = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Nature%20and%20Animals';
    
    const s = slug.toLowerCase();
    if (s.includes('pill') || s.includes('medicine') || s.includes('tablet')) return `${base}/Pill.png`;
    if (s.includes('bottle') || s.includes('liquid')) return `${base}/Lotion%20Bottle.png`;
    if (s.includes('tube') || s.includes('vial') || s.includes('lab')) return `${base}/Test%20Tube.png`;
    if (s.includes('jar') || s.includes('cream')) return `${base}/Jar.png`;
    if (s.includes('label') || s.includes('sticker')) return `${base}/Label.png`;
    if (s.includes('bag') || s.includes('kit')) return `${base}/Shopping%20Bags.png`;
    if (s.includes('herb') || s.includes('natural')) return `${natureBase}/Herb.png`;
    if (s.includes('aid') || s.includes('first')) return `https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Medical%20Symbol.png`;
    
    return `${base}/Package.png`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Hierarchy</h1>
          <p className="text-sm text-gray-500">Manage product groupings and sub-categories</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Groups</p>
              <p className="text-2xl font-bold text-blue-900">{categories.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Active Categories</p>
              <p className="text-2xl font-bold text-green-900">{categories.filter(c => c.is_active).length}</p>
            </div>
            <Eye className="w-8 h-8 text-green-200" />
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100 shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Sub-categories</p>
              <p className="text-2xl font-bold text-amber-900">{categories.filter(c => c.parent_category_id).length}</p>
            </div>
            <Layers className="w-8 h-8 text-amber-200" />
          </CardContent>
        </Card>
      </div>

      {/* Category Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle>{editingCategory ? 'Edit Category' : 'New Category'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}><XIcon className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-semibold">Name *</label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Blister Packs"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-semibold">Parent Category</label>
                    <select 
                      value={formData.parent_category_id || ''} 
                      onChange={e => setFormData({ ...formData, parent_category_id: e.target.value || null })}
                      className="w-full h-10 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">None (Top Level)</option>
                      {categories
                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-20 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Briefly describe this category..."
                  />
                </div>

                <ImageUploader 
                  value={formData.image_url}
                  onChange={url => setFormData({ ...formData, image_url: url })}
                  label="Category Icon / Image"
                  bucket="category-images"
                  helperText="Animated 3D icons are automatically assigned based on name, or upload your own."
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="cat-active"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cat-active" className="text-sm font-semibold text-gray-700">Category is visible to customers</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase text-gray-400">Sort</label>
                    <Input 
                      type="number" 
                      className="w-16 h-8 text-center font-bold"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search categories by name, slug or metadata..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 w-full rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInactive(!showInactive)}
            className={`h-10 px-4 rounded-xl ${showInactive ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-gray-500 border border-transparent'}`}
          >
            {showInactive ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showInactive ? 'Showing All' : 'Active Only'}
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchCategories} className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </Button>

          <div className="h-10 w-px bg-gray-200 mx-1 hidden lg:block" />

          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={cn("h-8 px-2 rounded-lg", viewMode === 'grid' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={cn("h-8 px-2 rounded-lg", viewMode === 'list' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'compact' ? 'outline' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('compact')}
              className={cn("h-8 px-2 rounded-lg", viewMode === 'compact' ? 'bg-white shadow-sm border-gray-200' : 'text-gray-500 hover:text-gray-900 border-transparent')}
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
      />

      {/* Categories Content */}
      <div className={cn(
        "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden",
        viewMode === 'grid' && "bg-transparent border-none shadow-none overflow-visible"
      )}>
        {viewMode === 'list' || viewMode === 'compact' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length > 0 && selectedIds.length === filteredCategories.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter w-16 text-center">Order</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Category Name</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Parent</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Usage</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                      <div className="relative inline-block mb-4">
                        <Layers className="w-16 h-16 text-gray-100 mx-auto" />
                        <Search className="w-6 h-6 text-gray-300 absolute bottom-0 right-0 translate-x-1 translate-y-1" />
                      </div>
                      <p className="font-bold text-gray-500">No categories found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr 
                      key={category.id} 
                      className={cn(
                        "hover:bg-sky-50/30 transition-colors group",
                        selectedIds.includes(category.id) && "bg-blue-50/50",
                        viewMode === 'compact' ? "h-10" : ""
                      )}
                    >
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(category.id)}
                          onChange={() => toggleSelect(category.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveCategory(category, 'up')} className="text-gray-300 hover:text-blue-500"><ArrowUp className="w-3 h-3" /></button>
                          <span className="text-[10px] font-black text-gray-700">{category.sort_order}</span>
                          <button onClick={() => moveCategory(category, 'down')} className="text-gray-300 hover:text-blue-500"><ArrowDown className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 group-hover:border-blue-200 group-hover:shadow-md transition-all flex-shrink-0",
                            viewMode === 'compact' ? "w-8 h-8" : "w-11 h-11"
                          )}>
                            <img 
                              src={category.image_url || getIconUrl(category.slug)} 
                              alt="" 
                              className="w-full h-full object-contain drop-shadow-sm" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png'; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className={cn(
                              "font-bold text-gray-900 truncate",
                              viewMode === 'compact' ? "text-xs" : "text-sm"
                            )}>
                              {category.parent_category_id && <ChevronRight className="w-3 h-3 inline mr-1 text-gray-300" />}
                              {category.name}
                            </p>
                            {viewMode !== 'compact' && <p className="text-[10px] font-mono text-gray-400 mt-0.5">{category.slug}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {category.parent_category_id ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit">
                            <Layers className="w-3 h-3" />
                            {viewMode !== 'compact' && (categories.find(c => c.id === category.parent_category_id)?.name || 'Parent')}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 italic">Root</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                           <Package className="w-3.5 h-3.5 text-blue-500" />
                           <span className="text-[11px] font-black text-blue-700">{category.product_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => toggleActiveStatus(category.id, category.is_active)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all border",
                            category.is_active 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          )}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${category.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          {viewMode !== 'compact' && (category.is_active ? 'Visible' : 'Hidden')}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => editCategory(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedCategories.map((category) => (
              <Card 
                key={category.id} 
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-lg border-gray-200",
                  selectedIds.includes(category.id) && "ring-2 ring-blue-500 shadow-xl bg-blue-50/10"
                )}
              >
                <div className="absolute top-2 left-2 z-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(category.id)}
                    onChange={() => toggleSelect(category.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                  />
                </div>
                
                <CardContent className="p-0 pt-6 px-4 pb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center p-4 mb-4 group-hover:scale-110 transition-transform duration-500 relative">
                       <img 
                          src={category.image_url || getIconUrl(category.slug)} 
                          alt="" 
                          className="w-full h-full object-contain drop-shadow-md"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png'; }}
                        />
                        {(category.product_count || 0) > 0 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                            {category.product_count}
                          </div>
                        )}
                    </div>
                    
                    <h3 className="text-sm font-black text-gray-900 line-clamp-1 mb-1">{category.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">
                      {category.parent_category_id ? 'Sub-category' : 'Main Category'}
                    </p>
                    
                    <div className="flex items-center justify-center gap-1 mb-4">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        category.is_active ? "bg-green-500" : "bg-gray-300"
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase",
                        category.is_active ? "text-green-600" : "text-gray-400"
                      )}>
                        {category.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full pt-4 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => editCategory(category)}
                        className="flex-1 h-8 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteCategory(category.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={filteredCategories.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
