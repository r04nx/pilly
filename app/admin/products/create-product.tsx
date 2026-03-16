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
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  url: string;
  alt_text: string;
  position: number;
  is_thumbnail: boolean;
}

export default function CreateProductPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Basic Information
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  
  // Pricing
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxRate, setTaxRate] = useState('0.0000');
  const [shippingCost, setShippingCost] = useState('0');
  
  // Inventory
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockStatus, setStockStatus] = useState('in_stock');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [reorderPoint, setReorderPoint] = useState('20');
  const [reorderQuantity, setReorderQuantity] = useState('50');
  
  // Shipping & Delivery
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('3');
  const [estimatedDeliveryText, setEstimatedDeliveryText] = useState('3-5 business days');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [freeShipping, setFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  
  // Product Settings
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [minOrderQuantity, setMinOrderQuantity] = useState('1');
  const [maxOrderQuantity, setMaxOrderQuantity] = useState('');
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState('');
  
  // Tags & SEO
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  // Medical Specific
  const [returnPolicy, setReturnPolicy] = useState('30-day return policy');
  const [warranty, setWarranty] = useState('');
  const [safetyWarnings, setSafetyWarnings] = useState('');
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [currentAllergen, setCurrentAllergen] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [supplierSku, setSupplierSku] = useState('');
  
  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Admin
  const [adminNotes, setAdminNotes] = useState('');
  const [internalCode, setInternalCode] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
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

  const addKeyword = () => {
    if (currentKeyword.trim() && !metaKeywords.includes(currentKeyword.trim())) {
      setMetaKeywords([...metaKeywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setMetaKeywords(metaKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const addAllergen = () => {
    if (currentAllergen.trim() && !allergens.includes(currentAllergen.trim())) {
      setAllergens([...allergens, currentAllergen.trim()]);
      setCurrentAllergen('');
    }
  };

  const removeAllergen = (allergenToRemove: string) => {
    setAllergens(allergens.filter(allergen => allergen !== allergenToRemove));
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
    
    // If setting is_thumbnail, ensure only one thumbnail
    if (field === 'is_thumbnail' && value === true) {
      updatedImages.forEach((img, i) => {
        if (i !== index) img.is_thumbnail = false;
      });
    }
    
    setImages(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Reorder positions
    updatedImages.forEach((img, i) => {
      img.position = i;
    });
    setImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create product
      const productData: any = {
        title,
        name: name || title,
        short_description: shortDescription,
        long_description: longDescription,
        sku,
        barcode,
        brand,
        manufacturer,
        model_number: modelNumber,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        tax_rate: parseFloat(taxRate),
        shipping_cost: parseFloat(shippingCost),
        stock_quantity: parseInt(stockQuantity),
        stock_status: stockStatus,
        low_stock_threshold: parseInt(lowStockThreshold),
        track_inventory: trackInventory,
        allow_backorder: allowBackorder,
        reorder_point: parseInt(reorderPoint),
        reorder_quantity: parseInt(reorderQuantity),
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        estimated_delivery_days: parseInt(estimatedDeliveryDays),
        estimated_delivery_text: estimatedDeliveryText,
        shipping_method: shippingMethod,
        free_shipping: freeShipping,
        free_shipping_threshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
        is_active: isActive,
        is_featured: isFeatured,
        is_digital: isDigital,
        requires_prescription: requiresPrescription,
        min_order_quantity: parseInt(minOrderQuantity),
        max_order_quantity: maxOrderQuantity ? parseInt(maxOrderQuantity) : null,
        tags,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        return_policy: returnPolicy,
        warranty,
        safety_warnings: safetyWarnings,
        directions,
        ingredients,
        allergens,
        storage_instructions,
        expiration_date: expirationDate || null,
        batch_number: batchNumber,
        supplier,
        supplier_sku: supplierSku,
        admin_notes: adminNotes,
        internal_code: internalCode,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // Create product categories
      if (selectedCategories.length > 0) {
        const categoryData = selectedCategories.map((categoryId, index) => ({
          product_id: product.id,
          category_id: categoryId,
          is_primary: categoryId === primaryCategory
        }));

        await supabase
          .from('product_categories')
          .insert(categoryData);
      }

      // Create product images
      if (images.length > 0) {
        const imageData = images.map(img => ({
          product_id: product.id,
          url: img.url,
          alt_text: img.alt_text,
          position: img.position,
          is_thumbnail: img.is_thumbnail
        }));

        await supabase
          .from('product_images')
          .insert(imageData);
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">Create New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="seo">SEO & Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter product title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name (if different from title)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief product description (shown in listings)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="longDescription">Long Description</Label>
                  <Textarea
                    id="longDescription"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="Detailed product description"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Stock Keeping Unit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Product barcode"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Product brand"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="Manufacturer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelNumber">Model Number</Label>
                    <Input
                      id="modelNumber"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      placeholder="Model number"
                    />
                  </div>
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                              if (!primaryCategory) setPrimaryCategory(category.id);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              if (primaryCategory === category.id) setPrimaryCategory('');
                            }
                          }}
                        />
                        <Label htmlFor={category.id}>{category.name}</Label>
                        <Select
                          value={primaryCategory}
                          onValueChange={setPrimaryCategory}
                          disabled={!selectedCategories.includes(category.id)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Primary" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategories.map((catId) => {
                              const cat = categories.find(c => c.id === catId);
                              return (
                                <SelectItem key={catId} value={catId}>
                                  {cat?.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresPrescription"
                      checked={requiresPrescription}
                      onCheckedChange={setRequiresPrescription}
                    />
                    <Label htmlFor="requiresPrescription">Requires Prescription</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Sale Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="compareAtPrice">Compare at Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costPrice">Cost Price (Admin Only)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taxRate">Tax Rate</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.0001"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="0.0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingCost">Shipping Cost</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockStatus">Stock Status</Label>
                    <Select value={stockStatus} onValueChange={setStockStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="pre_order">Pre Order</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reorderPoint">Reorder Point</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      value={reorderPoint}
                      onChange={(e) => setReorderPoint(e.target.value)}
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                    <Input
                      id="reorderQuantity"
                      type="number"
                      value={reorderQuantity}
                      onChange={(e) => setReorderQuantity(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackInventory"
                      checked={trackInventory}
                      onCheckedChange={setTrackInventory}
                    />
                    <Label htmlFor="trackInventory">Track Inventory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowBackorder"
                      checked={allowBackorder}
                      onCheckedChange={setAllowBackorder}
                    />
                    <Label htmlFor="allowBackorder">Allow Backorder</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.001"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions (L×W×H cm)</Label>
                    <Input
                      id="dimensions"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder='{"length":10,"width":5,"height":3}'
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedDeliveryDays">Estimated Delivery Days</Label>
                    <Input
                      id="estimatedDeliveryDays"
                      type="number"
                      value={estimatedDeliveryDays}
                      onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDeliveryText">Delivery Text</Label>
                    <Input
                      id="estimatedDeliveryText"
                      value={estimatedDeliveryText}
                      onChange={(e) => setEstimatedDeliveryText(e.target.value)}
                      placeholder="3-5 business days"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingMethod">Shipping Method</Label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="pickup">Store Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      step="0.01"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freeShipping"
                      checked={freeShipping}
                      onCheckedChange={setFreeShipping}
                    />
                    <Label htmlFor="freeShipping">Free Shipping</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical & Safety Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea
                    id="returnPolicy"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="warranty">Warranty</Label>
                  <Textarea
                    id="warranty"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="safetyWarnings">Safety Warnings</Label>
                  <Textarea
                    id="safetyWarnings"
                    value={safetyWarnings}
                    onChange={(e) => setSafetyWarnings(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="directions">Directions for Use</Label>
                  <Textarea
                    id="directions"
                    value={directions}
                    onChange={(e) => setDirections(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Allergens</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentAllergen}
                      onChange={(e) => setCurrentAllergen(e.target.value)}
                      placeholder="Add allergen"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                    />
                    <Button type="button" onClick={addAllergen}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen) => (
                      <Badge key={allergen} variant="destructive" className="flex items-center gap-1">
                        {allergen}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeAllergen(allergen)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="storageInstructions">Storage Instructions</Label>
                  <Textarea
                    id="storageInstructions"
                    value={storageInstructions}
                    onChange={(e) => setStorageInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Batch number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierSku">Supplier SKU</Label>
                    <Input
                      id="supplierSku"
                      value={supplierSku}
                      onChange={(e) => setSupplierSku(e.target.value)}
                      placeholder="Supplier SKU"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="SEO description"
                  />
                </div>

                <div>
                  <Label>Meta Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder="Add keyword"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metaKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                        {keyword}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Product Images</Label>
                    <Button type="button" onClick={addImage} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  
                  {images.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No images added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {images.map((image, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Image URL"
                              value={image.url}
                              onChange={(e) => updateImage(index, 'url', e.target.value)}
                            />
                            <Input
                              placeholder="Alt text"
                              value={image.alt_text}
                              onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={image.is_thumbnail}
                                onCheckedChange={(checked) => updateImage(index, 'is_thumbnail', checked)}
                              />
                              <Label>Thumbnail</Label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Internal notes for this product"
                  />
                </div>

                <div>
                  <Label htmlFor="internalCode">Internal Code</Label>
                  <Input
                    id="internalCode"
                    value={internalCode}
                    onChange={(e) => setInternalCode(e.target.value)}
                    placeholder="Internal product code"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
