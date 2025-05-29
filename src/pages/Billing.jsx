import React from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const Billing = () => {
  const billingPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "$9.99",
      period: "/month",
      description: "Perfect for getting started with our content",
      tier: "BASIC",
      features: [
        "Access to Basic content library",
        "HD streaming quality",
        "Cancel anytime",
        "Weekly new content updates",
        "Standard customer support"
      ]
    },
    {
      id: 2,
      name: "Premium Plan",
      price: "$19.99",
      period: "/month",
      description: "Most popular choice for serious content enthusiasts",
      tier: "PREMIUM",
      highlighted: true,
      features: [
        "Access to Basic & Premium content",
        "4K Ultra HD streaming",
        "Cancel anytime",
        "Daily new content updates",
        "Priority customer support",
        "Exclusive premium series",
        "Ad-free experience"
      ]
    },
    {
      id: 3,
      name: "VIP Plan",
      price: "$39.99",
      period: "/month",
      description: "Ultimate experience with all premium features",
      tier: "VIP",
      features: [
        "Access to ALL content tiers",
        "8K streaming quality",
        "Cancel anytime",
        "Instant access to new releases",
        "24/7 VIP support",
        "Exclusive VIP content",
        "Live streaming events",
        "Download for offline viewing",
        "Multiple device streaming"
      ]
    }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-600';
      case 'PREMIUM':
        return 'bg-orange-600';
      case 'VIP':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 px-4 md:px-8 lg:px-16 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-pink-500 hover:text-white hover:bg-pink-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-pink-500">
              Adult Content Platform
            </h1>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-green-400 text-gray-900 hover:bg-green-600 hover:text-white">
              Login
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="px-4 md:px-8 lg:px-16 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Select the perfect subscription plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </header>

      {/* Billing Plans */}
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {billingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-900 rounded-2xl p-8 relative transition-all duration-300 hover:scale-105 flex flex-col ${
                plan.highlighted 
                  ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/30' 
                  : 'hover:shadow-xl hover:shadow-purple-500/20'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 mr-auto ${getTierColor(plan.tier)}`}>
                {plan.tier}
              </div>
              
              <h3 className="text-2xl font-bold text-purple-300 mb-2">
                {plan.name}
              </h3>
              
              <p className="text-gray-400 text-sm mb-6">
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full py-3 text-white font-bold mt-auto ${
                  plan.highlighted 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {plan.highlighted ? 'Get Started' : 'Choose Plan'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-purple-400 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-300 mb-3">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-400 text-sm">
                Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-300 mb-3">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards, PayPal, and various other payment methods for your convenience.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-300 mb-3">
                Can I upgrade or downgrade my plan?
              </h4>
              <p className="text-gray-400 text-sm">
                Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-300 mb-3">
                Is my payment information secure?
              </h4>
              <p className="text-gray-400 text-sm">
                Absolutely. We use industry-standard encryption and security measures to protect your payment information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
          <a href="#" className="hover:text-purple-400 transition-colors">DMCA</a>
          <a href="#" className="hover:text-purple-400 transition-colors">2257 Statement</a>
        </div>
        <div className="text-center text-gray-500 text-sm">
          © 2025 Adult Content Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Billing;
