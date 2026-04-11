'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, FileText, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const id = searchParams.get('orderId');
    const number = searchParams.get('orderNumber');
    
    if (id) setOrderId(id);
    if (number) setOrderNumber(number);

    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Shoot confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [searchParams]);

  const handleViewOrders = () => {
    router.push('/customer/orders');
  };

  const handleContinueShopping = () => {
    router.push('/customer/products');
  };

  const handleDownloadInvoice = () => {
    window.open(`/api/invoice/${orderId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Success Icon and Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Order Successful! 🎉
              </h1>
              
              <p className="text-xl text-gray-600 mb-2">
                Thank you for your order!
              </p>
              
              {orderNumber && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  <FileText className="w-4 h-4 mr-2" />
                  Order #{orderNumber}
                </div>
              )}
            </div>

            {/* Success Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <span className="text-2xl">🎊</span>
                <span className="text-lg font-medium">
                  Your order has been successfully placed and is being processed!
                </span>
                <span className="text-2xl">🎊</span>
              </div>
            </div>

            {/* Order Information */}
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Order Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Order ID: {orderId}</p>
                  <p>Status: <span className="text-green-600 font-medium">Confirmed</span></p>
                  <p>You will receive a confirmation email shortly with your order details and invoice.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleViewOrders}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View My Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {orderId && (
                <Button
                  onClick={handleDownloadInvoice}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
              )}
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">📧 A confirmation email has been sent to your registered email address</p>
                <p>📦 You can track your order status in the "My Orders" section</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
