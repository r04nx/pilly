'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/95 text-primary-foreground py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:text-white/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Our Commitment to Privacy</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At Paras Pharmacy Supplier, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Name and contact information (email, phone, address)</li>
                  <li>• Pharmacy license and business information</li>
                  <li>• Account credentials and preferences</li>
                  <li>• Payment and billing information</li>
                </ul>
              </div>

              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Usage Data</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Website browsing patterns and interactions</li>
                  <li>• Product search and order history</li>
                  <li>• Device information and IP address</li>
                  <li>• Cookies and tracking data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">How We Use Your Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Order Processing", desc: "To process and fulfill your pharmacy supply orders efficiently" },
                { title: "Account Management", desc: "To create and manage your account and personalize your experience" },
                { title: "Customer Support", desc: "To provide assistance and respond to your inquiries" },
                { title: "Legal Compliance", desc: "To comply with healthcare regulations and legal requirements" },
                { title: "Marketing Communications", desc: "To send relevant updates about our products and services" },
                { title: "Website Improvement", desc: "To analyze usage patterns and improve our services" }
              ].map((item, i) => (
                <div key={i} className="bg-background border border-border/50 rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Data Protection & Security</h2>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
              <p className="text-muted-foreground leading-relaxed mb-6">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>SSL encryption for all data transmissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Secure servers with restricted access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Compliance with HIPAA and healthcare privacy regulations</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your Privacy Rights</h2>
            </div>
            
            <div className="space-y-4">
              {[
                "Access and review your personal information",
                "Correct inaccurate or incomplete information", 
                "Request deletion of your personal data",
                "Opt-out of marketing communications",
                "Request data portability",
                "Object to processing of your information"
              ].map((right, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </div>
                  <span className="text-foreground">{right}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-8 border border-border/50">
              <p className="text-muted-foreground mb-6">
                If you have questions about this Privacy Policy or need to exercise your privacy rights, please contact us:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">privacy@paraspharmacysupplier.ca</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">416-575-7598</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Address</p>
                    <p className="text-muted-foreground">Toronto, Ontario, Canada</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Policy Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Policy Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. 
              We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
            </p>
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
            Join hundreds of pharmacies trusting Paras for their supply needs
          </p>
        </div>
      </div>
    </div>
  );
}
