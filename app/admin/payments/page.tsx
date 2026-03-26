'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Check,
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  ChevronRight, 
  ShoppingCart, 
  CreditCard,
  AlertCircle,
  Download,
  QrCode,
  FileText,
  User,
  Hash
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  sku?: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
}

interface BillItem extends Product {
  quantity: number;
}

export default function PaymentTesting() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('Guest Customer');
  
  // New Editable State
  const [customUpiId, setCustomUpiId] = useState('7741866802@ptsbi');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState('Near Medical College, Sector 4\nGSTIN: 27AABCP1234Z1Z5\nPhone: +91 7741866802');
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState('All prices are inclusive of taxes where applicable. This is a computer-generated invoice and does not require a physical signature. Medicine returns are only accepted within 7 days of delivery with original packaging.');
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        supabase.from('products').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true })
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToBill = (product: Product) => {
    setBillItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromBill = (id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setBillItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (totalAmount * taxRate) / 100;
  const finalAmount = customAmount !== '' ? parseFloat(customAmount) : (totalAmount + taxAmount + shippingCost);
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const upiUrl = `upi://pay?pa=${customUpiId}&pn=Paras%20Pharmacy%20Supplier&am=${finalAmount.toFixed(2)}&tn=Invoice%20${invoiceNumber}&cu=USD`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Initializing payment console...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            Payment Testing Console
          </h1>
          <p className="text-gray-500 font-medium mt-1">Select products and generate dynamic UPI invoices</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => {
              setBillItems([]);
              setInvoiceNumber(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
              setInvoiceDate(new Date().toISOString().split('T')[0]);
              setCustomAmount('');
           }}>
             Reset Console
           </Button>
           <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={billItems.length === 0}>
             <Printer className="w-4 h-4 mr-2" />
             Print Invoice
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        {/* Left Side: Product Selector (Hidden on Print) */}
        <div className="lg:col-span-7 space-y-6 print:hidden">
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-50">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search medicines or products..." 
                    className="pl-10 h-10 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="h-10 px-3 border border-gray-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer"
                    onClick={() => addToBill(product)}
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 p-1">
                      <img 
                        src={product.image_url || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png'} 
                        alt="" 
                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs font-black text-blue-600">${product.price.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-blue-600 group-hover:bg-blue-100">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Invoice Preview */}
        <div className="lg:col-span-5 print:w-full print:mx-auto">
          <div id="invoice-bill" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 print:shadow-none print:border-none">
            {/* Invoice Header */}
            <div className="bg-blue-600 p-10 relative overflow-hidden">
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-6 text-white">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl transition-transform duration-500">
                       <img 
                        src="https://flem.xo.je/uploads/brand-logo_2e73a483.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter">PARAS PHARMACY</h2>
                       <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-80 mt-1 text-sky-100">Certified Medical Supplier</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <h3 className="text-5xl font-black text-white opacity-20 absolute -top-4 -right-2 select-none">INVOICE</h3>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase text-sky-100/60 tracking-widest mb-1">Invoice Number</p>
                      <Input 
                        value={invoiceNumber} 
                        onChange={e => setInvoiceNumber(e.target.value)}
                        className="h-8 w-40 text-sm font-black font-mono border-none bg-white/10 text-white rounded-lg text-right print:placeholder-white"
                      />
                      <p className="text-sm font-black font-mono hidden print:block text-white">#{invoiceNumber}</p>
                    </div>
                  </div>
               </div>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-8 text-[11px] pb-6 border-b border-gray-100">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter flex justify-between items-center group">
                    Billed From 
                  </p>
                  <div className="font-bold text-gray-800 space-y-1">
                    <p>Paras Pharmacy Supplier</p>
                    <textarea 
                      value={billingAddress} 
                      onChange={e => setBillingAddress(e.target.value)}
                      className="w-full text-[11px] font-bold border-none bg-transparent hover:bg-gray-50 focus:bg-white p-0 rounded-lg resize-none flex-1 leading-normal focus:ring-1 focus:ring-blue-100 transition-colors print:hidden"
                      rows={3}
                      spellCheck={false}
                    />
                    <div className="hidden print:block whitespace-pre-line leading-normal">
                      {billingAddress}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Billed To</p>
                  <div className="font-bold text-gray-800 space-y-2">
                    <div className="flex items-center gap-2 print:hidden">
                      <User className="w-3 h-3 text-blue-500" />
                      <Input 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)}
                        className="h-7 text-[11px] font-bold border-none bg-blue-50/50 p-2 rounded-lg"
                      />
                    </div>
                    <p className="hidden print:block">{customerName}</p>
                    <div className="flex items-center gap-2 text-gray-400 print:hidden">
                      <span>Date:</span>
                      <Input 
                        type="date"
                        value={invoiceDate}
                        onChange={e => setInvoiceDate(e.target.value)}
                        className="h-7 text-[11px] border-none bg-gray-50 p-2 rounded-lg w-auto"
                      />
                    </div>
                    <p className="text-gray-400 hidden print:block">Date: {new Date(invoiceDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-blue-600/40 tracking-[0.2em] border-b-2 border-blue-50">
                      <th className="py-4 px-2">Item Description</th>
                      <th className="py-4 text-center">Qty</th>
                      <th className="py-4 text-right">Unit Price</th>
                      <th className="py-4 text-right px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {billItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-300 font-bold italic print:hidden">No items selected. Add products from the left.</td>
                        <td colSpan={4} className="hidden print:table-cell py-12 text-center text-gray-300 font-bold italic">No items billed.</td>
                      </tr>
                    ) : (
                      billItems.map(item => (
                        <tr key={item.id} className="text-[11px] group">
                          <td className="py-3">
                            <div className="font-bold text-gray-900">{item.name}</div>
                            {item.sku && <div className="text-[9px] text-gray-400">SKU: {item.sku}</div>}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 print:hidden"
                              >-</button>
                              <span className="font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center hover:bg-green-100 hover:text-green-600 print:hidden"
                              >+</button>
                            </div>
                          </td>
                          <td className="py-3 text-right font-medium text-gray-600">${item.price.toFixed(2)}</td>
                          <td className="py-3 text-right font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                          <td className="pl-4 print:hidden">
                             <button onClick={() => removeFromBill(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & QR Code */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-8 items-end">
                   <div className="flex items-center gap-6">
                      <div 
                        className="p-3 bg-white border-2 border-dashed border-blue-100 rounded-2xl shadow-inner relative group cursor-pointer"
                        onClick={() => setIsQrExpanded(true)}
                        title="Click to enlarge QR Code"
                      >
                         <img src={qrCodeUrl} alt="UPI QR" className="w-24 h-24 object-contain" />
                         <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl print:hidden">
                           <QrCode className="w-6 h-6 text-blue-600 animate-pulse" />
                         </div>
                      </div>
                      <div className="max-w-[150px] space-y-2">
                         <div className="print:hidden">
                            <label className="text-[8px] font-black uppercase text-gray-400 mb-0.5 block">UPI ID</label>
                            <Input 
                              value={customUpiId}
                              onChange={e => setCustomUpiId(e.target.value)}
                              className="h-6 text-[10px] py-0 px-2 bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-200"
                              placeholder="Enter UPI ID"
                            />
                         </div>
                         <div className="hidden print:block">
                            <p className="text-[9px] font-black uppercase text-blue-600 leading-tight mb-1">Scan for payment</p>
                         </div>
                         <p className="text-[8px] text-gray-400 leading-none">Use any UPI App like PhonePe, GPay, or Paytm</p>
                         <div className="flex gap-1 mt-2">
                            <img src="https://img.icons8.com/color/48/google-pay.png" className="w-4 h-4 grayscale opacity-50" />
                            <img src="https://img.icons8.com/color/48/paytm.png" className="w-4 h-4 grayscale opacity-50" />
                            <img src="https://img.icons8.com/color/48/phone-pe.png" className="w-4 h-4 grayscale opacity-50" />
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 w-full space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 px-2">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 px-2">
                        <span className="flex items-center gap-2">
                          Tax (%) 
                          <Input 
                            type="number" 
                            className="w-12 h-6 p-1 text-[10px] print:hidden" 
                            value={taxRate} 
                            onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                          />
                        </span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 px-2 border-b border-dashed border-gray-100 pb-2">
                        <span className="flex items-center gap-2">
                          Shipping 
                          <Input 
                            type="number" 
                            className="w-16 h-6 p-1 text-[10px] print:hidden" 
                            value={shippingCost} 
                            onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                          />
                        </span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-600 p-6 rounded-3xl text-white shadow-2xl shadow-blue-100 mt-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/20 transition-colors" />
                        <div>
                          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-80 block mb-1">TOTAL PAYABLE</span>
                          <span className="text-3xl font-black tabular-nums">${finalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <Check className="w-8 h-8 text-white opacity-40" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Footer / Disclaimer */}
              <div className="pt-8 border-t border-slate-100 flex justify-between items-end gap-12">
                 <div className="flex-1 space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Terms & Conditions</p>
                      <textarea 
                        value={invoiceNotes}
                        onChange={e => setInvoiceNotes(e.target.value)}
                        className="w-full text-[10px] text-slate-400 leading-relaxed italic bg-transparent border-none resize-none p-0 focus:ring-0 print:hidden h-20"
                        spellCheck={false}
                      />
                      <p className="text-[10px] text-slate-400 leading-relaxed italic hidden print:block">
                        {invoiceNotes}
                      </p>
                    </div>
                    <div className="text-center md:text-left">
                       <p className="text-[10px] font-black text-slate-900 tracking-widest uppercase mb-1">Thank you for your business</p>
                       <p className="text-[8px] text-slate-400 font-medium tracking-tight">Visit us at www.paraspharmacysupplier.ca | Questions? help@paraspharmacy.ca</p>
                    </div>
                 </div>

                 {/* Blue Seal */}
                 <div className="relative w-32 h-32 shrink-0 group">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
                    <div className="w-full h-full bg-white rounded-full p-2 relative z-10 shadow-lg border-2 border-blue-50">
                      <img 
                        src="/assets/paras_blue_seal.png" 
                        alt="Official Seal" 
                        className="w-full h-full object-contain drop-shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm">Verified Authentic</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>

      {/* QR Code Expansion Modal */}
      {isQrExpanded && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in"
          onClick={() => setIsQrExpanded(false)}
        >
          <div 
            className="bg-white p-8 rounded-[2rem] shadow-2xl scale-in-center overflow-hidden border border-gray-100 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
             <button 
                onClick={() => setIsQrExpanded(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900"
             >
                <AlertCircle className="w-5 h-5 rotate-45" /> {/* Close-like icon */}
             </button>
             <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <QrCode className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Scan to Pay</h3>
                <p className="text-xs text-gray-500 mt-1 font-bold">${finalAmount.toFixed(2)} to {customUpiId}</p>
             </div>
             
             <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-4 flex justify-center">
                <img src={qrCodeUrl} alt="UPI QR Enlarged" className="w-[280px] h-[280px] object-contain" />
             </div>
             
             <div className="mt-6 flex justify-center gap-3">
                <img src="https://img.icons8.com/color/48/google-pay.png" className="w-6 h-6" />
                <img src="https://img.icons8.com/color/48/paytm.png" className="w-6 h-6" />
                <img src="https://img.icons8.com/color/48/phone-pe.png" className="w-6 h-6" />
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-bill, #invoice-bill * {
            visibility: visible;
          }
          #invoice-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
