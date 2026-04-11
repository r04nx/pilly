'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '@/components/admin/image-uploader';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id?: string;
  url: string;
  alt_text: string;
  position: number;
  is_thumbnail: boolean;
}

interface ProductFormProps {
  productId?: string;
  initialData?: any;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!productId;

  // Basic Information
  const [title, setTitle] = useState(initialData?.title || '');
  const [name, setName] = useState(initialData?.name || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [longDescription, setLongDescription] = useState(initialData?.long_description || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '');
  const [modelNumber, setModelNumber] = useState(initialData?.model_number || '');

  // Pricing
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compare_at_price?.toString() || '');
  const [costPrice, setCostPrice] = useState(initialData?.cost_price?.toString() || '');
  const [taxRate, setTaxRate] = useState(initialData?.tax_rate?.toString() || '0.0000');
  const [shippingCost, setShippingCost] = useState(initialData?.shipping_cost?.toString() || '0');

  // Inventory
  const [stockQuantity, setStockQuantity] = useState(initialData?.stock_quantity?.toString() || '0');
  const [stockStatus, setStockStatus] = useState(initialData?.stock_status || 'in_stock');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.low_stock_threshold?.toString() || '10');
  const [trackInventory, setTrackInventory] = useState(initialData?.track_inventory !== false);
  const [allowBackorder, setAllowBackorder] = useState(!!initialData?.allow_backorder);
  const [reorderPoint, setReorderPoint] = useState(initialData?.reorder_point?.toString() || '20');
  const [reorderQuantity, setReorderQuantity] = useState(initialData?.reorder_quantity?.toString() || '50');

  // Shipping & Delivery
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState(initialData?.estimated_delivery_days?.toString() || '3');
  const [estimatedDeliveryText, setEstimatedDeliveryText] = useState(initialData?.estimated_delivery_text || '3-5 business days');
  const [shippingMethod, setShippingMethod] = useState(initialData?.shipping_method || 'standard');
  const [freeShipping, setFreeShipping] = useState(!!initialData?.free_shipping);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialData?.free_shipping_threshold?.toString() || '');

  // Product Settings
  const [isActive, setIsActive] = useState(initialData?.is_active !== false);
  const [isFeatured, setIsFeatured] = useState(!!initialData?.is_featured);
  const [isDigital, setIsDigital] = useState(!!initialData?.is_digital);
  const [requiresPrescription, setRequiresPrescription] = useState(!!initialData?.requires_prescription);
  const [minOrderQuantity, setMinOrderQuantity] = useState(initialData?.min_order_quantity?.toString() || '1');
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(initialData?.max_order_quantity?.toString() || '');

  // Categories
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.selected_categories || []);
  const [primaryCategory, setPrimaryCategory] = useState(initialData?.primary_category || '');

  // Tags & SEO
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');
  const [metaKeywords, setMetaKeywords] = useState<string[]>(initialData?.meta_keywords || []);
  const [currentKeyword, setCurrentKeyword] = useState('');

  // Medical Specific
  const [returnPolicy, setReturnPolicy] = useState(initialData?.return_policy || '30-day return policy');
  const [warranty, setWarranty] = useState(initialData?.warranty || '');
  const [safetyWarnings, setSafetyWarnings] = useState(initialData?.safety_warnings || '');
  const [directions, setDirections] = useState(initialData?.directions || '');
  const [ingredients, setIngredients] = useState(initialData?.ingredients || '');
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens || []);
  const [currentAllergen, setCurrentAllergen] = useState('');
  const [storageInstructions, setStorageInstructions] = useState(initialData?.storage_instructions || '');
  const [expirationDate, setExpirationDate] = useState(initialData?.expiration_date || '');
  const [batchNumber, setBatchNumber] = useState(initialData?.batch_number || '');
  const [supplier, setSupplier] = useState(initialData?.supplier || '');
  const [supplierSku, setSupplierSku] = useState(initialData?.supplier_sku || '');

  // Images
  const [images, setImages] = useState<ProductImage[]>(initialData?.images || []);

  // Admin
  const [adminNotes, setAdminNotes] = useState(initialData?.admin_notes || '');
  const [internalCode, setInternalCode] = useState(initialData?.internal_code || '');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (productId && !initialData) {
      fetchProductData();
    }
  }, [productId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setAvailableCategories(data || []);
    }
  };

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_categories(category_id, is_primary)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Populate states
      setTitle(product.title || product.name || '');
      setName(product.name || '');
      setShortDescription(product.short_description || '');
      setLongDescription(product.long_description || product.description || '');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setBrand(product.brand || '');
      setManufacturer(product.manufacturer || '');
      setModelNumber(product.model_number || '');
      setPrice(product.price?.toString() || '');
      setCompareAtPrice(product.compare_at_price?.toString() || '');
      setCostPrice(product.cost_price?.toString() || '');
      setTaxRate(product.tax_rate?.toString() || '0.0000');
      setShippingCost(product.shipping_cost?.toString() || '0');
      setStockQuantity(product.stock_quantity?.toString() || '0');
      setStockStatus(product.stock_status || 'in_stock');
      setLowStockThreshold(product.low_stock_threshold?.toString() || '10');
      setTrackInventory(product.track_inventory !== false);
      setAllowBackorder(!!product.allow_backorder);
      setReorderPoint(product.reorder_point?.toString() || '20');
      setReorderQuantity(product.reorder_quantity?.toString() || '50');
      setWeight(product.weight?.toString() || '');
      setDimensions(product.dimensions || '');
      setEstimatedDeliveryDays(product.estimated_delivery_days?.toString() || '3');
      setEstimatedDeliveryText(product.estimated_delivery_text || '3-5 business days');
      setShippingMethod(product.shipping_method || 'standard');
      setFreeShipping(!!product.free_shipping);
      setFreeShippingThreshold(product.free_shipping_threshold?.toString() || '');
      setIsActive(product.active !== false && product.is_active !== false);
      setIsFeatured(!!product.featured || !!product.is_featured);
      setIsDigital(!!product.is_digital);
      setRequiresPrescription(!!product.requires_prescription);
      setMinOrderQuantity(product.min_order_quantity?.toString() || '1');
      setMaxOrderQuantity(product.max_order_quantity?.toString() || '');
      setTags(product.tags || []);
      setMetaTitle(product.meta_title || '');
      setMetaDescription(product.meta_description || '');
      setMetaKeywords(product.meta_keywords || []);
      setReturnPolicy(product.return_policy || '30-day return policy');
      setWarranty(product.warranty || '');
      setSafetyWarnings(product.safety_warnings || '');
      setDirections(product.directions || '');
      setIngredients(product.ingredients || '');
      setAllergens(product.allergens || []);
      setStorageInstructions(product.storage_instructions || '');
      setExpirationDate(product.expiration_date || '');
      setBatchNumber(product.batch_number || '');
      setSupplier(product.supplier || '');
      setSupplierSku(product.supplier_sku || '');
      setAdminNotes(product.admin_notes || '');
      setInternalCode(product.internal_code || '');

      setImages(product.product_images || []);

      const cats = product.product_categories || [];
      setSelectedCategories(cats.map((c: any) => c.category_id));
      const primary = cats.find((c: any) => c.is_primary);
      if (primary) setPrimaryCategory(primary.category_id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product data');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addImage = () => {
    const newImage: ProductImage = {
      url: '',
      alt_text: '',
      position: images.length,
      is_thumbnail: images.length === 0
    };
    setImages([...images, newImage]);
  };

  const updateImage = (index: number, field: keyof ProductImage, value: any) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    if (field === 'is_thumbnail' && value === true) {
      updatedImages.forEach((img, i) => { if (i !== index) img.is_thumbnail = false; });
    }
    setImages(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    updatedImages.forEach((img, i) => { img.position = i; });
    setImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const productData: any = {
        name: title || name,
        description: longDescription || shortDescription,
        sku,
        price: parseFloat(price) || 0,
        stock_quantity: parseInt(stockQuantity) || 0,
        category_id: selectedCategories.length > 0 ? (primaryCategory || selectedCategories[0]) : null,
        image_url: images.length > 0 ? (images.find(img => img.is_thumbnail)?.url || images[0].url) : null,
        in_stock: (parseInt(stockQuantity) || 0) > 0 || stockStatus === 'in_stock',
        featured: isFeatured,
        active: isActive,
        updated_at: new Date().toISOString()
      };

      let product;
      if (isEditing) {
        const { data, error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();
        if (updateError) throw updateError;
        product = data;
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        if (insertError) throw insertError;
        product = data;
      }

      // Handle categories
      await supabase.from('product_categories').delete().eq('product_id', product.id);
      if (selectedCategories.length > 0) {
        const categoryData = selectedCategories.map(catId => ({
          product_id: product.id,
          category_id: catId,
          is_primary: catId === primaryCategory
        }));
        await supabase.from('product_categories').insert(categoryData);
      }

      // Handle images
      await supabase.from('product_images').delete().eq('product_id', product.id);
      if (images.length > 0) {
        const imageData = images.map(img => ({
          product_id: product.id,
          url: img.url,
          alt_text: img.alt_text,
          position: img.position,
          is_thumbnail: img.is_thumbnail
        }));
        await supabase.from('product_images').insert(imageData);

        // Update main product image_url with thumbnail
        const thumb = images.find(img => img.is_thumbnail) || images[0];
        if (thumb) {
          await supabase.from('products').update({ image_url: thumb.url }).eq('id', product.id);
        }
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Create Product'}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-3 p-4 text-red-700">
            <X className="w-5 h-5" /> {error}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 border-b border-gray-200 bg-gray-50/50">
              <TabsList className="bg-transparent h-12 gap-6">
                <TabsTrigger value="basic" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 shadow-none rounded-none px-0">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 shadow-none rounded-none px-0">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="medical" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 shadow-none rounded-none px-0">Medical</TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 shadow-none rounded-none px-0">SEO & Media</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="basic" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Product Title *</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Paracetamol 500mg Tablets" required className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} placeholder="PRCT-500" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Tylenol" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description (Summary)</Label>
                    <Textarea id="shortDescription" value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Brief overview for listings" rows={2} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="longDescription">Long Description (Entire Page Content)</Label>
                    <Textarea id="longDescription" value={longDescription} onChange={e => setLongDescription(e.target.value)} placeholder="Detailed information, usage, and benefits..." rows={8} className="mt-1" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-0 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Pricing</h3>
                    <div>
                      <Label htmlFor="price">Sale Price *</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="pl-7" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="compareAtPrice">Compare at Price</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input id="compareAtPrice" type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className="pl-7" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Inventory</h3>
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input id="stockQuantity" type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="mt-1" />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox id="trackInventory" checked={trackInventory} onCheckedChange={v => setTrackInventory(!!v)} />
                      <Label htmlFor="trackInventory">Track Inventory</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="directions">Directions for Use</Label>
                    <Textarea id="directions" value={directions} onChange={e => setDirections(e.target.value)} placeholder="How to use this product..." rows={3} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="safetyWarnings">Safety Warnings</Label>
                    <Textarea id="safetyWarnings" value={safetyWarnings} onChange={e => setSafetyWarnings(e.target.value)} placeholder="Warnings and contraindications..." rows={3} className="mt-1 text-red-600" />
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Checkbox id="requiresPrescription" checked={requiresPrescription} onCheckedChange={v => setRequiresPrescription(!!v)} />
                    <Label htmlFor="requiresPrescription" className="text-amber-800 font-medium">Requires Valid Prescription</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-4 block transition-colors group-hover:text-blue-600">Product Gallery</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative border rounded-xl p-4 bg-gray-50/50 group transition-all hover:shadow-md hover:border-blue-200">
                          <ImageUploader
                            value={img.url}
                            onChange={(url) => updateImage(idx, 'url', url)}
                            label={`Image ${idx + 1}`}
                            bucket="product-images"
                            helperText="Upload, paste URL, or search for product images"
                          />
                          <div className="mt-4 flex items-center justify-between border-t pt-4">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`thumb-${idx}`}
                                checked={img.is_thumbnail}
                                onCheckedChange={v => updateImage(idx, 'is_thumbnail', !!v)}
                              />
                              <Label htmlFor={`thumb-${idx}`} className="text-xs font-medium cursor-pointer">Main Thumbnail</Label>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeImage(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8">
                              <Trash2 className="w-4 h-4 mr-2" /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        type="button"
                        onClick={addImage}
                        className="h-[280px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 transition-all hover:border-blue-400 hover:bg-blue-50 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm font-semibold text-gray-600 group-hover:text-blue-600">Add Gallery Image</span>
                          <span className="text-xs text-gray-400">Include multiple angles or packaging</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active (Published)</Label>
                <Checkbox id="isActive" checked={isActive} onCheckedChange={v => setIsActive(!!v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured (Home Page)</Label>
                <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={v => setIsFeatured(!!v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {availableCategories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={v => {
                        if (v) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                          if (!primaryCategory) setPrimaryCategory(cat.id);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                        }
                      }}
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm">{cat.name}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
