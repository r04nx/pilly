'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileCheck, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Conditions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/95 text-primary-foreground py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Conditions of Use</h1>
          <p className="mt-2 text-primary-foreground/80">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Conditions of Use</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              These Conditions of Use outline the specific requirements and guidelines for using Paras Pharmacy Supplier's 
              products and services. Please read these conditions carefully before placing orders or using our platform.
            </p>
          </section>

          {/* Eligibility Requirements */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Eligibility Requirements</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Required Qualifications</h3>
                </div>
                <ul className="space-y-2 text-green-700 dark:text-green-300">
                  <li>• Valid pharmacy license in good standing</li>
                  <li>• Registered with provincial pharmacy regulatory body</li>
                  <li>• Proper storage facilities for pharmaceutical supplies</li>
                  <li>• Qualified personnel to handle medical supplies</li>
                  <li>• Compliance with Health Canada regulations</li>
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Restrictions</h3>
                </div>
                <ul className="space-y-2 text-red-700 dark:text-red-300">
                  <li>• No sales to unlicensed individuals or entities</li>
                  <li>• No export outside of Canada without proper authorization</li>
                  <li>• No resale to unauthorized third parties</li>
                  <li>• No modification of products without approval</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Product Usage Conditions */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Product Usage Conditions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Storage Requirements</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Temperature-controlled storage as specified</li>
                  <li>• Protection from moisture and light</li>
                  <li>• Secure storage to prevent unauthorized access</li>
                  <li>• Regular inventory inspections</li>
                  <li>• Proper rotation of stock (FIFO)</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Handling Guidelines</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Use appropriate PPE when handling supplies</li>
                  <li>• Follow manufacturer instructions</li>
                  <li>• Maintain clean handling environment</li>
                  <li>• Document any incidents or issues</li>
                  <li>• Train staff on proper procedures</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ordering Conditions */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Ordering Conditions</h2>
            
            <div className="space-y-4">
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Order Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Minimum order value: $100 CAD</li>
                  <li>• Valid purchase order required for account customers</li>
                  <li>• Complete product specifications must be provided</li>
                  <li>• Delivery address must be a licensed pharmacy location</li>
                  <li>• Authorized signature required for all orders</li>
                </ul>
              </div>
              
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Order Modifications</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Changes allowed within 2 hours of order placement</li>
                  <li>• Cancellations subject to processing fees</li>
                  <li>• Custom orders cannot be modified or cancelled</li>
                  <li>• Bulk orders require 48-hour notice for changes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Quality Assurance */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Quality Assurance Conditions</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Quality Standards</h3>
              </div>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• All products meet Health Canada standards</li>
                <li>• Regular quality control inspections performed</li>
                <li>• Batch tracking and traceability maintained</li>
                <li>• Certificate of Analysis provided upon request</li>
                <li>• Product warranties as specified by manufacturer</li>
              </ul>
            </div>
          </section>

          {/* Regulatory Compliance */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Regulatory Compliance</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Required Documentation</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Pharmacy license verification</li>
                  <li>• Business registration documents</li>
                  <li>• Health Canada import/export permits (if applicable)</li>
                  <li>• Controlled substance permits (if required)</li>
                  <li>• Insurance certificates</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Compliance Obligations</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Adherence to all federal and provincial regulations</li>
                  <li>• Maintenance of proper records for 5 years</li>
                  <li>• Regular audits and inspections compliance</li>
                  <li>• Reporting of any adverse events or issues</li>
                  <li>• Staff training on regulatory requirements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Conditions */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Payment Conditions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Payment Methods</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Credit card (Visa, Mastercard, Amex)</li>
                  <li>• Electronic funds transfer (EFT)</li>
                  <li>• Company checks (with approval)</li>
                  <li>• Net 30 terms (qualified accounts)</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Payment Terms</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Payment due within 30 days of invoice</li>
                  <li>• Late payment fees: 1.5% per month</li>
                  <li>• Credit holds for delinquent accounts</li>
                  <li>• Security deposits for new accounts</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping Conditions */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Shipping and Delivery Conditions</h2>
            
            <div className="space-y-4">
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Delivery Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Business hours delivery only (8 AM - 5 PM)</li>
                  <li>• Authorized personnel must sign for deliveries</li>
                  <li>• Inspection required upon receipt</li>
                  <li>• Damage claims within 24 hours</li>
                  <li>• Proper storage immediately upon delivery</li>
                </ul>
              </div>
              
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Shipping Restrictions</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• No PO Box deliveries for bulk orders</li>
                  <li>• Hazardous materials shipping compliance required</li>
                  <li>• Temperature-controlled shipping for sensitive items</li>
                  <li>• International shipping requires special permits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Warranty Conditions */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Warranty Conditions</h2>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">Product Warranty</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Manufacturer warranties apply as specified</li>
                <li>• Defective products replaced within 30 days</li>
                <li>• Warranty void if products misused or modified</li>
                <li>• Extended warranty options available</li>
                <li>• Warranty claims require proof of purchase and documentation</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">9. Prohibited Activities</h2>
            </div>
            
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <ul className="space-y-2 text-red-700 dark:text-red-300">
                <li>• Reselling products to unauthorized parties</li>
                <li>• Using products for unintended purposes</li>
                <li>• Modifying products without manufacturer approval</li>
                <li>• Violating any applicable laws or regulations</li>
                <li>• Interfering with website functionality</li>
                <li>• Providing false or misleading information</li>
                <li>• Attempting to bypass security measures</li>
              </ul>
            </div>
          </section>

          {/* Violation Consequences */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Violation Consequences</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Violation of these conditions may result in:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Immediate account suspension or termination</li>
              <li>• Cancellation of pending orders</li>
              <li>• Legal action and pursuit of damages</li>
              <li>• Reporting to regulatory authorities</li>
              <li>• Ineligibility for future services</li>
            </ul>
          </section>

          {/* Amendments */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">11. Amendments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paras Pharmacy Supplier reserves the right to amend these conditions at any time. 
              Changes will be effective immediately upon posting on our website.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">12. Contact Information</h2>
            <div className="bg-muted/30 rounded-xl p-8 border border-border/50">
              <p className="text-muted-foreground mb-6">
                For questions about these Conditions of Use, please contact us:
              </p>
              <div className="space-y-3">
                <p className="text-foreground"><strong>Email:</strong> support@paraspharmacysupplier.ca</p>
                <p className="text-foreground"><strong>Phone:</strong> 416-575-7598</p>
                <p className="text-foreground"><strong>Address:</strong> Toronto, Ontario, Canada</p>
              </div>
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/auth/register">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              Create Your Account
            </Button>
          </Link>
          <p className="mt-4 text-muted-foreground">
            Join hundreds of compliant pharmacies across Canada
          </p>
        </div>
      </div>
    </div>
  );
}
