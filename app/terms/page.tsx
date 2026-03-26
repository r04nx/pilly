'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, Users, Package, AlertTriangle, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/95 text-primary-foreground py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
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
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Terms of Service Agreement</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Paras Pharmacy Supplier. These Terms of Service ("Terms") govern your use of our website, 
              products, and services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By accessing and using Paras Pharmacy Supplier's services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Services Description */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">2. Services Description</h2>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Paras Pharmacy Supplier provides:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Pharmaceutical packaging supplies and equipment</li>
                <li>• Blister packs, bottles, vials, and containers</li>
                <li>• Labels and printing services</li>
                <li>• Order management and tracking systems</li>
                <li>• Regulatory compliance documentation</li>
                <li>• Customer support and technical assistance</li>
              </ul>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Account Registration</h2>
            <div className="space-y-4">
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Eligibility Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Must be a licensed pharmacy or healthcare facility</li>
                  <li>• Must provide valid business and license information</li>
                  <li>• Must be authorized to make purchasing decisions</li>
                  <li>• Must comply with all applicable healthcare regulations</li>
                </ul>
              </div>
              
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Account Responsibilities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Maintain accurate and up-to-date information</li>
                  <li>• Safeguard your account credentials</li>
                  <li>• Notify us immediately of unauthorized access</li>
                  <li>• Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ordering and Payment */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Ordering and Payment</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Order Process</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• All orders subject to availability</li>
                  <li>• Minimum order requirements may apply</li>
                  <li>• Order confirmation sent via email</li>
                  <li>• Tracking information provided for shipments</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Payment Terms</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Payment due at time of order</li>
                  <li>• Credit terms available for qualified accounts</li>
                  <li>• All prices in Canadian dollars</li>
                  <li>• Taxes and shipping fees additional</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Shipping and Delivery</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We ship to pharmacies and healthcare facilities across Canada. Standard shipping times are 3-7 business days. 
              Express shipping options available at additional cost.
            </p>
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">Delivery Requirements</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Someone must be available to receive deliveries</li>
                <li>• Proper storage facilities must be available</li>
                <li>• Delivery inspections must be documented</li>
                <li>• Damaged items must be reported within 24 hours</li>
              </ul>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Returns and Refunds</h2>
            <div className="space-y-4">
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Return Policy</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Returns accepted within 30 days of delivery</li>
                  <li>• Products must be unused and in original packaging</li>
                  <li>• Custom orders are non-returnable</li>
                  <li>• Return shipping fees may apply</li>
                </ul>
              </div>
              
              <div className="bg-background border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Refund Process</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Refunds processed within 5-7 business days</li>
                  <li>• Original shipping fees non-refundable</li>
                  <li>• Store credit available for exchanges</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, trademarks, service marks, logos, and intellectual property on our website belong to Paras Pharmacy Supplier. 
              You may not use, reproduce, or distribute our intellectual property without prior written consent.
            </p>
          </section>

          {/* Confidentiality */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">8. Confidentiality</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Both parties agree to maintain confidentiality of all proprietary information shared during the course of business. 
              This includes but is not limited to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Customer lists and pricing information</li>
              <li>• Product specifications and formulations</li>
              <li>• Business strategies and operations</li>
              <li>• Technical and trade secrets</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">9. Limitation of Liability</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Paras Pharmacy Supplier shall not be liable for any indirect, incidental, special, or consequential damages 
              resulting from your use of our products or services.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Important Notice</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Our liability is limited to the purchase price of the specific product or service in question. 
                Use of pharmaceutical supplies must comply with all applicable regulations and standards.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">11. Governing Law</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the Province of Ontario, Canada, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">12. Contact Information</h2>
            <div className="bg-muted/30 rounded-xl p-8 border border-border/50">
              <p className="text-muted-foreground mb-6">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-3">
                <p className="text-foreground"><strong>Email:</strong> legal@paraspharmacysupplier.ca</p>
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
            Ready to partner with Canada's trusted pharmacy supplier?
          </p>
        </div>
      </div>
    </div>
  );
}
