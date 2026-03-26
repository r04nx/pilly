'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  AlertCircle,
  MapPin,
  Map,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Lock as LockIcon,
  Check,
  Home,
  Mail,
  RefreshCw,
  CreditCard,
  ShoppingBag,
  User,
  Phone
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, itemCount, total, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [isSearchingCountry, setIsSearchingCountry] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [settings, setSettings] = useState<any>({
    shipping_cost: { amount: 0 },
    tax_rate: { percentage: 10 },
    free_shipping_threshold: { amount: 500 }
  });
  
  // Address search logic
  const handleAddressSearch = async (query: string) => {
    setIsSearchingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Address search failed:', err);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const selectAddress = (suggestion: any) => {
    const addr = suggestion.address;
    setShippingInfo(prev => ({
      ...prev,
      address: suggestion.display_name,
      city: addr.city || addr.town || addr.village || addr.suburb || '',
      state: addr.state || '',
      zip_code: addr.postcode || '',
      country: addr.country || ''
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'credit_card'>('cod');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  useEffect(() => {
    checkAuth();
    fetchSettings();
    fetchCountries();
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (data && data.length > 0) {
      setSavedAddresses(data);
      const defaultAddr = data.find(a => a.is_default) || data[0];
      setSelectedAddressId(defaultAddr.id);
      applySavedAddress(defaultAddr);
    }
  };

  const applySavedAddress = (addr: any) => {
    setShippingInfo({
      full_name: addr.full_name,
      email: addr.email,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      country: addr.country
    });
  };

  const fetchCountries = async () => {
    try {
      const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
      const data = await resp.json();
      const formatted = data.map((c: any) => ({
        name: c.name.common,
        flag: c.flags.svg || c.flags.png,
        code: c.cca2
      })).sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCountries(formatted);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/checkout/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shippingInfo.email, userId: user?.id })
      });
      const data = await resp.json();
      if (data.success) {
        setShowOtpModal(true);
        setIsOtpSent(true);
        setOtpCode('');
        setCountdown(60);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsVerifying(true);
    setOtpError('');
    try {
      const resp = await fetch('/api/checkout/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shippingInfo.email, otp: otpCode })
      });
      const data = await resp.json();
      if (data.success) {
        setIsVerified(true);
        setVerifiedEmail(shippingInfo.email);
        setShowOtpModal(false);
        // Save address if requested
        if (saveThisAddress && selectedAddressId === 'new') {
          await saveNewAddress();
        }
        // Proceed to place order directly and wait for it
        setTimeout(() => handlePlaceOrder(), 0);
      } else {
        setOtpError('Invalid code. Please try again.');
      }
    } catch (err: any) {
      setOtpError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const saveNewAddress = async () => {
    try {
      await supabase.from('customer_addresses').insert({
        user_id: user.id,
        ...shippingInfo,
        is_default: savedAddresses.length === 0
      });
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchSettings = async () => {
    const { data: shipping } = await supabase.from('store_settings').select('value').eq('key', 'shipping_cost').single();
    const { data: tax } = await supabase.from('store_settings').select('value').eq('key', 'tax_rate').single();
    const { data: threshold } = await supabase.from('store_settings').select('value').eq('key', 'free_shipping_threshold').single();
    
    setSettings({
      shipping_cost: shipping?.value || { amount: 0 },
      tax_rate: tax?.value || { percentage: 10 },
      free_shipping_threshold: threshold?.value || { amount: 500 }
    });
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Pre-fill form with user data if available
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || ''
      }));
    }
  };

  const handleLoginRedirect = () => {
    // Save current checkout data to localStorage
    localStorage.setItem('checkout_data', JSON.stringify({
      shippingInfo,
      paymentInfo
    }));
    router.push('/auth/login?redirect=/customer/checkout');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to place an order');
      return;
    }

    if (!isVerified || verifiedEmail !== shippingInfo.email) {
      await sendOtp();
      return;
    }

    // Call handlePlaceOrder but non-recursively
    setTimeout(() => handlePlaceOrder(), 0);
  };

  const handlePlaceOrder = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsLoading(true);
    setError('');

    // Comprehensive Validation
    if (!shippingInfo.full_name.trim()) { setError('Full Name is required'); setIsLoading(false); return; }
    if (!shippingInfo.email.trim() || !/^\S+@\S+\.\S+$/.test(shippingInfo.email)) { setError('Valid Email is required'); setIsLoading(false); return; }
    if (!shippingInfo.phone.trim() || !/^\+?[\d\s-]{8,15}$/.test(shippingInfo.phone.replace(/[\s()-]/g, ''))) { 
      setError('Please enter a valid phone number (minimum 8 digits)'); 
      setIsLoading(false); 
      return; 
    }
    if (!shippingInfo.address.trim()) { setError('Shipping Address is required'); setIsLoading(false); return; }
    
    if (paymentMethod === 'credit_card') {
      if (!paymentInfo.cardNumber.trim()) { setError('Card Number is required'); setIsLoading(false); return; }
      if (!paymentInfo.expiryDate.trim()) { setError('Expiry Date is required'); setIsLoading(false); return; }
      if (!paymentInfo.cvv.trim()) { setError('CVV is required'); setIsLoading(false); return; }
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      setIsLoading(false);
      return;
    }

    try {
      const isFreeShipping = total >= settings.free_shipping_threshold.amount;
      const shippingAmount = isFreeShipping ? 0 : settings.shipping_cost.amount;
      const taxAmount = total * (settings.tax_rate.percentage / 100);
      const finalTotal = total + shippingAmount + taxAmount;

      // Sanitize address data (ensure it's a plain object with only strings)
      const sanitizedAddress = {
        full_name: String(shippingInfo.full_name || ''),
        email: String(shippingInfo.email || ''),
        phone: String(shippingInfo.phone || ''),
        address: String(shippingInfo.address || ''),
        city: String(shippingInfo.city || ''),
        state: String(shippingInfo.state || ''),
        zip_code: String(shippingInfo.zip_code || ''),
        country: String(shippingInfo.country || '')
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount,
          status: 'pending',
          shipping_address: sanitizedAddress,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Sanitize order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.product?.price || item.price || 0)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Trigger Emails
      try {
        await fetch('/api/checkout/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }

      // Clear cart and redirect carefully
      await clearCart();
      router.push(`/customer/orders/${order.id}`);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      setError(`Order placement failed: ${error.message || 'System error'}`);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#fcfdff] pt-24 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-6">Your cart is empty</p>
          <Link href="/customer/products">
            <Button className="bg-sky-600 hover:bg-sky-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff] pt-24 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/customer/cart"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

        {!user && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <LockIcon className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">Authentication Required</h3>
                  <p className="text-amber-700 text-sm">
                    You need to be logged in to place an order. This helps us track your orders and provide better service.
                  </p>
                </div>
                <Button onClick={handleLoginRedirect} className="bg-amber-600 hover:bg-amber-700">
                  Sign In to Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            {/* Address Selection */}
            {savedAddresses.length > 0 && (
              <div className="mb-6 space-y-4">
                <Label className="text-sm font-bold text-slate-700">Select Delivery Address</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        applySavedAddress(addr);
                      }}
                      className={cn(
                        "cursor-pointer p-4 rounded-2xl border-2 transition-all relative group",
                        selectedAddressId === addr.id 
                          ? "border-sky-500 bg-sky-50/50 shadow-sm" 
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      {selectedAddressId === addr.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                          <Check className="w-3 h-3 stroke-[4]" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{addr.full_name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{addr.address}</p>
                          <p className="text-[11px] text-slate-500">{addr.city}, {addr.state}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => {
                      setSelectedAddressId('new');
                      setShippingInfo({
                        full_name: '',
                        email: user?.email || '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zip_code: '',
                        country: ''
                      });
                    }}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2",
                      selectedAddressId === 'new' 
                        ? "border-sky-500 bg-sky-50/50 text-sky-700" 
                        : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300 text-slate-500"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-bold">New Address</span>
                  </div>
                </div>
              </div>
            )}

            <Card className={cn("transition-all duration-500", selectedAddressId !== 'new' && "opacity-50 pointer-events-none scale-[0.98]")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {selectedAddressId === 'new' ? 'New Delivery Address' : 'Address Details'}
                  </div>
                  {selectedAddressId === 'new' && (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-sky-600 border-sky-100">Recommended</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={shippingInfo.full_name}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Input
                        id="country"
                        placeholder="Search country..."
                        value={shippingInfo.country}
                        onChange={(e) => {
                          setShippingInfo(prev => ({ ...prev, country: e.target.value }));
                          setShowCountrySuggestions(true);
                        }}
                        onFocus={() => setShowCountrySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                        required
                        disabled={!user}
                        className="pl-10"
                      />
                      {shippingInfo.country && countries.find(c => c.name === shippingInfo.country) && (
                        <img 
                          src={countries.find(c => c.name === shippingInfo.country).flag} 
                          alt="flag" 
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-3.5 object-cover rounded-sm shadow-sm"
                        />
                      )}
                    </div>
                    {showCountrySuggestions && (
                      <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-2xl border-sky-100 bg-white/95 backdrop-blur-md">
                        <CardContent className="p-0">
                          {countries
                            .filter(c => c.name.toLowerCase().includes(shippingInfo.country.toLowerCase()))
                            .slice(0, 10)
                            .map((country, idx) => (
                              <div
                                key={idx}
                                className="p-3 hover:bg-sky-50 cursor-pointer transition-colors border-b last:border-0 border-slate-50 text-sm flex items-center gap-3"
                                onClick={() => {
                                  setShippingInfo(prev => ({ ...prev, country: country.name }));
                                  setShowCountrySuggestions(false);
                                }}
                              >
                                <img src={country.flag} alt={country.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                <span className="font-medium text-slate-900">{country.name}</span>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Start typing your address..."
                    value={shippingInfo.address}
                    onChange={(e) => {
                      const value = e.target.value;
                      setShippingInfo(prev => ({ ...prev, address: value }));
                      if (value.length > 3) {
                        handleAddressSearch(value);
                      } else {
                        setAddressSuggestions([]);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => shippingInfo.address.length > 3 && setShowSuggestions(true)}
                    required
                    disabled={!user}
                    className="pr-10"
                  />
                  {isSearchingAddress && <div className="absolute right-3 top-9 w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>}
                  
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-2xl border-sky-100 bg-white/95 backdrop-blur-md">
                      <CardContent className="p-0">
                        {addressSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="p-3 hover:bg-sky-50 cursor-pointer transition-colors border-b last:border-0 border-slate-50 text-sm group"
                            onClick={() => selectAddress(suggestion)}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-sky-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{suggestion.display_name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={shippingInfo.zip_code}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, zip_code: e.target.value }))}
                      required
                      disabled={!user}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="save_address" 
                    checked={saveThisAddress} 
                    onCheckedChange={(checked) => setSaveThisAddress(!!checked)}
                  />
                  <Label htmlFor="save_address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Save this address for future orders
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center",
                      paymentMethod === 'cod' 
                        ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      paymentMethod === 'cod' ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <Badge className="bg-transparent text-sm hover:bg-transparent">$</Badge>
                    </div>
                    <span className="font-bold">Cash on Delivery</span>
                    <p className="text-[10px] text-slate-500">Pay when you receive</p>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('credit_card')}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center opacity-60",
                      paymentMethod === 'credit_card' 
                        ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    <CreditCard className={cn(
                      "w-10 h-10",
                      paymentMethod === 'credit_card' ? "text-sky-600" : "text-slate-400"
                    )} />
                    <span className="font-bold">Credit/Debit Card</span>
                    <p className="text-[10px] text-slate-500">Secure online payment</p>
                  </div>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        required={paymentMethod === 'credit_card'}
                        disabled={!user}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                          required={paymentMethod === 'credit_card'}
                          disabled={!user}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                          required={paymentMethod === 'credit_card'}
                          disabled={!user}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <div className="relative w-10 h-10 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[13px] lg:text-lg text-slate-900 truncate pr-2">
                            {item.product?.name || 'Product'} {!item.product?.active && <span className="text-red-500 text-[10px]">(Unavailable)</span>}
                          </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ${(item.product?.price || 0).toLocaleString()} each
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-slate-900">
                        ${((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className={cn("font-bold", total >= settings.free_shipping_threshold.amount ? "text-green-600 uppercase text-[10px]" : "text-slate-900")}>
                      {total >= settings.free_shipping_threshold.amount ? 'Free' : `$${settings.shipping_cost.amount}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax ({settings.tax_rate.percentage}%)</span>
                    <span className="font-semibold text-slate-900">${(total * (settings.tax_rate.percentage / 100)).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg text-slate-900">
                      <span>Total</span>
                      <span className="text-sky-600">
                        ${(total + (total >= settings.free_shipping_threshold.amount ? 0 : settings.shipping_cost.amount) + (total * (settings.tax_rate.percentage / 100))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-sky-600 hover:bg-sky-700 h-12 rounded-xl"
                  size="lg"
                  disabled={!user || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isLoading ? 'Processing...' : 'Place Order'}
                </Button>
                
                {!user && (
                  <p className="text-xs text-gray-500 text-center">
                    <LockIcon className="w-3 h-3 inline mr-1" />
                    Sign in required to place order
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-2 bg-sky-500" />
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-sky-600" />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900">Verify It's You</CardTitle>
              <CardDescription className="text-slate-500 px-6">
                We've sent a 6-digit code to <span className="font-bold text-slate-900">{shippingInfo.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="0 0 0 0 0 0"
                  className="text-center text-3xl font-black tracking-[1em] h-16 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500"
                />
                {otpError && (
                  <p className="text-center text-sm font-bold text-red-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {otpError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={verifyOtp} 
                  disabled={otpCode.length !== 6 || isVerifying}
                  className="w-full bg-sky-600 hover:bg-sky-700 h-12 font-bold text-base shadow-lg shadow-sky-100"
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={sendOtp} 
                  disabled={countdown > 0}
                  className="text-slate-500 hover:text-sky-600 font-bold h-10"
                >
                  {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Resend Code
                    </span>
                  )}
                </Button>
                
                <button 
                  onClick={() => setShowOtpModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors flex items-center justify-center gap-1 group"
                >
                  <LockIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  Cancel and edit address
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
