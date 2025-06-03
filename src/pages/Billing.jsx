import React from 'react';
import { Button } from '../components/ui/button.tsx';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';

const Billing = () => {
  const { user } = useUser();
  const userPlan = user?.subscription_tier || user?.subscription_status || null;

  const billingPlans = [
    {
      id: 1,
      name: "Basic Plan (Monthly)",
      price: "$9.99",
      period: "/month",
      description: "Perfect for getting started with our content",
      tier: "BASIC",
      type: "Monthly",
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
      name: "Basic Plan (One-Time)",
      price: "$24.99",
      period: "One-Time",
      description: "Lifetime access to Basic content",
      tier: "BASIC",
      type: "One-Time",
      features: [
        "Lifetime access to Basic content library",
        "HD streaming quality",
        "No recurring payments",
        "Standard customer support"
      ]
    },
    {
      id: 3,
      name: "Medium Plan (Monthly)",
      price: "$19.99",
      period: "/month",
      description: "More content and features for enthusiasts",
      tier: "MEDIUM",
      type: "Monthly",
      highlighted: true,
      features: [
        "Access to Basic & Medium content",
        "4K Ultra HD streaming",
        "Cancel anytime",
        "Daily new content updates",
        "Priority customer support",
        "Exclusive medium series",
        "Ad-free experience"
      ]
    },
    {
      id: 4,
      name: "Medium Plan (One-Time)",
      price: "$49.99",
      period: "One-Time",
      description: "Lifetime access to Medium content",
      tier: "MEDIUM",
      type: "One-Time",
      features: [
        "Lifetime access to Basic & Medium content",
        "4K Ultra HD streaming",
        "No recurring payments",
        "Priority customer support",
        "Exclusive medium series",
        "Ad-free experience"
      ]
    },
    {
      id: 5,
      name: "Hardcore Plan (One-Time)",
      price: "$79.99",
      period: "One-Time",
      description: "Ultimate experience with all premium features (lifetime)",
      tier: "HARDCORE",
      type: "One-Time",
      features: [
        "Lifetime access to ALL content tiers",
        "8K streaming quality",
        "No recurring payments",
        "Instant access to new releases",
        "24/7 VIP support",
        "Exclusive hardcore content",
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
      case 'MEDIUM':
        return 'bg-orange-600';
      case 'HARDCORE':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 px-4 md:px-8 lg:px-16 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-pink-500 hover:text-white hover:bg-pink-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-pink-500 tracking-tight">
              Adult Content Platform
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
            <Button variant="outline" className="border-green-400 text-gray-900 hover:bg-green-600 hover:text-white">
              Login
            </Button>
            </Link>
            <Link to="/signup">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Sign Up
            </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* User's Current Plan */}
      {userPlan && (
        <div className="max-w-2xl mx-auto mt-10 mb-6 p-6 rounded-xl bg-gradient-to-r from-pink-700 via-purple-800 to-blue-800 shadow-2xl flex items-center gap-4">
          <Star className="w-10 h-10 text-yellow-300 animate-pulse" />
          <div>
            <div className="text-lg font-bold text-white mb-1">Your Current Plan:</div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mr-2 " style={{ background: 'rgba(0,0,0,0.3)' }}>
              {userPlan}
            </div>
            <span className="text-pink-200 font-semibold">Enjoy your premium access!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 md:px-8 lg:px-16 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-400 mb-4 drop-shadow-lg">
          Choose Your Plan
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Select the perfect subscription plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </header>

      {/* Billing Plans */}
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {billingPlans.map((plan) => {
            const isCurrent = userPlan && userPlan.toUpperCase() === plan.tier && (plan.type === 'Monthly' ? plan.period === '/month' : plan.period === 'One-Time');
            return (
            <div
              key={plan.id}
                className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-3xl p-10 shadow-2xl flex flex-col border-4 transition-all duration-300 hover:scale-105 ${
                  plan.highlighted ? 'ring-4 ring-purple-500' : ''
                } ${isCurrent ? 'border-yellow-400 scale-105 shadow-yellow-400/30' : 'border-transparent'}`}
            >
              {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}
                {isCurrent && (
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-300 animate-bounce" />
                    <span className="text-yellow-200 font-bold text-xs">Current Plan</span>
                  </div>
                )}
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 mr-auto ${getTierColor(plan.tier)}`}>
                  {plan.tier} <span className="ml-2 text-xs font-normal text-gray-200">{plan.type}</span>
              </div>
                <h3 className="text-2xl font-extrabold text-purple-200 mb-2 tracking-tight">
                {plan.name}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {plan.description}
              </p>
              <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white drop-shadow-lg">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
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
                  className={`w-full py-3 text-white font-bold mt-auto rounded-xl text-lg transition-all duration-200 ${
                  plan.highlighted 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                      : isCurrent
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                  disabled={isCurrent}
              >
                  {isCurrent ? 'Your Plan' : plan.highlighted ? 'Get Started' : 'Choose Plan'}
              </Button>
            </div>
            );
          })}
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
                Absolutely. We use industry-standard encryption and security measures to protect your data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Billing;
