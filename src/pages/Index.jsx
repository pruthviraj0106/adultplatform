import React from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Index = () => {
  const contentItems = [
    {
      id: 1,
      title: "Sensual Encounters Collection",
      description: "Our entry-level collection featuring tasteful scenes and sensual content.",
      price: "$9.99/month",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face",
      tier: "BASIC",
      type: "Video"
    },
    {
      id: 2,
      title: "Basic Monthly Collection 2023",
      description: "Our newest collection for Basic subscribers featuring fresh faces and basic content collection.",
      price: "$24.99 one-time",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face",
      tier: "BASIC",
      type: "Video"
    },
    {
      id: 3,
      title: "Medium Tier - Passionate Encounters",
      description: "More explicit content for our Medium tier members. Features adventurous content focused on passion.",
      price: "$19.99/month",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face",
      tier: "MEDIUM",
      type: "Video"
    },
    {
      id: 4,
      title: "Hardcore Collection Vol. 1",
      description: "Our most intense and explicit adult content featuring hardcore scenes for our dedicated fans.",
      price: "$79.99 one-time",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face",
      tier: "HARDCORE",
      type: "Video"
    },
    {
      id: 5,
      title: "Hardcore Collection Vol. 2",
      description: "Our most intense and explicit adult content featuring hardcore scenes for our dedicated fans.",
      price: "$79.99 one-time",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face",
      tier: "HARDCORE",
      type: "Video"
    }
  ];

  const subscriptionPlans = [
    {
      id: 1,
      title: "Basic Monthly",
      price: "$9.99",
      period: "/month",
      features: [
        "Access to Basic content",
        "HD streaming",
        "Cancel anytime",
        "New content weekly"
      ]
    },
    {
      id: 2,
      title: "Basic One-off",
      price: "$24.99",
      features: [
        "Lifetime access to Basic content",
        "HD streaming",
        "One-time payment",
        "Basic content archive"
      ]
    },
    {
      id: 3,
      title: "Medium Monthly",
      price: "$19.99",
      period: "/month",
      features: [
        "Access to Basic & Medium content",
        "4K streaming",
        "Cancel anytime",
        "New content daily",
        "Premium support"
      ],
      highlighted: true
    },
    {
      id: 4,
      title: "Medium One-off",
      price: "$49.99",
      features: [
        "Lifetime access to Basic & Medium content",
        "4K streaming",
        "One-time payment",
        "Medium content archive",
        "Premium support"
      ]
    },
    {
      id: 5,
      title: "Hardcore One-off",
      price: "$79.99",
      features: [
        "Lifetime access to ALL content tiers",
        "8K streaming",
        "One-time payment",
        "Complete content archive",
        "Priority support",
        "Early access to new releases"
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

  const getContentColor = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 'text-blue-400';
      case 'MEDIUM':
        return 'text-orange-400';
      case 'HARDCORE':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <header className="py-8 text-center">
        <h2 className="text-3xl md:text-3xl font-bold text-pink-400 mb-4">
          Premium Content Library
        </h2>
      </header>

      {/* Content Grid */}
      <section className="px-4 md:px-8 lg:px-16 mb-36">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentItems.map((item) => (
            <Link
              key={item.id}
              to={`/collection/${item.id}`}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer block"
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(item.tier)}`}>
                  {item.tier}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`text-lg font-bold mb-2 ${getContentColor(item.tier)}`}>
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`${getContentColor(item.tier)} font-bold`}>{item.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="px-4 md:px-8 lg:px-16 mb-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-500">
            Subscription Plans
          </h2>
          <Link to="/billing">
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              View All Plans
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-900 rounded-lg p-6 transition-transform duration-300 flex flex-col ${
                plan.highlighted ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
              }`}
            >
              <h3 className="text-2xl font-bold text-green-300 mb-8 text-center">
                {plan.title}
              </h3>
              <div className="text-center mb-12">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-800 text-white mt-auto">
                {plan.period ? 'Subscribe Now' : 'Buy Now'}
              </Button>
            </div>
          ))}
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

export default Index;
