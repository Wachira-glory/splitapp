"use client"

import React, { useState } from 'react';
import { DollarSign, Users, Zap, Shield, Smartphone, TrendingUp, CheckCircle, ArrowRight, Menu, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';



export default function App() {

  const router = useRouter() 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl text-gray-900">SplitBill</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <button  onClick={() => router.push("/login")}className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">How It Works</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Pricing</a>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold">
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap size={16} />
                Fast & Secure Payments
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Split Bills<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Effortlessly
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The easiest way to split restaurant bills with friends. Send M-Pesa payment requests instantly and track who's paid in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-xl flex items-center justify-center gap-2">
                  Start Splitting Now
                  <ArrowRight size={20} />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600 mt-1">Bills Split</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">5K+</p>
                  <p className="text-sm text-gray-600 mt-1">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">99.9%</p>
                  <p className="text-sm text-gray-600 mt-1">Uptime</p>
                </div>
              </div>
            </div>

            {/* Hero Image/Mockup */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Total Bill</span>
                    <DollarSign size={24} />
                  </div>
                  <p className="text-4xl font-bold">KES 3,000</p>
                  <p className="text-blue-100 text-sm mt-2">Till: 123456</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-600">0712345678</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="font-bold text-gray-900">KES 1,000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">Jane Smith</p>
                      <p className="text-sm text-gray-600">0723456789</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="font-bold text-gray-900">KES 1,000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">Mike Wilson</p>
                      <p className="text-sm text-gray-600">0734567890</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-bold text-gray-900">KES 1,000</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Payment Progress</span>
                    <span className="text-sm text-gray-600">2 of 3 paid</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm animate-bounce">
                ✓ Instant Payment
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm">
                🔒 100% Secure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose SplitBill?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to split bills quickly, fairly, and securely
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant STK Push</h3>
              <p className="text-gray-600 leading-relaxed">
                Send M-Pesa payment requests directly to everyone's phone. No manual payments, no hassle.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Share payment links via WhatsApp, SMS, or any messaging app. Everyone pays their share.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                See who's paid instantly. No more awkward follow-ups or confusion about who owes what.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level encryption. Your payment information is always protected and secure.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-cyan-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Smartphone className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile First</h3>
              <p className="text-gray-600 leading-relaxed">
                Designed for mobile. Split bills on the go, right from your smartphone.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fair Split</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically calculate equal splits. Everyone pays exactly their fair share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Split your bill in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Enter Bill Details</h3>
                <p className="text-gray-600">
                  Add the total amount, till number, and number of people splitting the bill.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Users className="text-green-600" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Participants</h3>
                <p className="text-gray-600">
                  Add names and phone numbers, or share a payment link via WhatsApp.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Payments</h3>
                <p className="text-gray-600">
                  Everyone receives their payment request. Track who's paid in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What People Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy users splitting bills effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "SplitBill has made dining out with friends so much easier. No more awkward conversations about who owes what!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah M.</p>
                  <p className="text-sm text-gray-600">Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Fast, secure, and super convenient. I use it every time we go out for team lunch. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John K.</p>
                  <p className="text-sm text-gray-600">Mombasa, Kenya</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The STK push feature is brilliant! Everyone gets their payment request instantly. Game changer!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mary W.</p>
                  <p className="text-sm text-gray-600">Kisumu, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Splitting Bills?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already splitting bills the smart way. Get started in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all font-semibold text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl">
                  <DollarSign className="text-white" size={20} />
                </div>
                <span className="font-bold text-xl text-white">SplitBill</span>
              </div>
              <p className="text-gray-400 text-sm">
                The easiest way to split bills with friends and colleagues.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SplitBill. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

