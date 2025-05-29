import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

const VideoCollection = () => {
  const { id } = useParams();
  
  const collectionData = {
    '1': {
      title: 'Sensual Encounters Collection',
      description: 'Our entry-level collection featuring tasteful scenes and sensual content.',
      tier: 'BASIC',
      videos: [
        {
          id: 1,
          title: 'Romantic Evening Session',
          duration: '12:30',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
          views: '2.1K'
        },
        {
          id: 2,
          title: 'Intimate Moments',
          duration: '15:45',
          thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
          views: '1.8K'
        },
        {
          id: 3,
          title: 'Sensual Dance',
          duration: '08:20',
          thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face',
          views: '3.2K'
        },
        {
          id: 4,
          title: 'Evening Desires',
          duration: '18:15',
          thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face',
          views: '2.7K'
        }
      ]
    },
    '2': {
      title: 'Basic Monthly Collection 2023',
      description: 'Our newest collection for Basic subscribers featuring fresh faces and basic content collection.',
      tier: 'BASIC',
      videos: [
        {
          id: 5,
          title: 'Fresh Beginnings',
          duration: '14:22',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
          views: '1.5K'
        },
        {
          id: 6,
          title: 'New Faces',
          duration: '11:30',
          thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
          views: '2.3K'
        }
      ]
    },
    '3': {
      title: 'Medium Tier - Passionate Encounters',
      description: 'More explicit content for our Medium tier members. Features adventurous content focused on passion.',
      tier: 'MEDIUM',
      videos: [
        {
          id: 7,
          title: 'Passionate Adventures',
          duration: '22:15',
          thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face',
          views: '4.1K'
        },
        {
          id: 8,
          title: 'Intense Moments',
          duration: '19:45',
          thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face',
          views: '3.8K'
        }
      ]
    },
    '4': {
      title: 'Hardcore Collection Vol. 1',
      description: 'Our most intense and explicit adult content featuring hardcore scenes for our dedicated fans.',
      tier: 'HARDCORE',
      videos: [
        {
          id: 9,
          title: 'Extreme Encounters',
          duration: '25:30',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
          views: '5.2K'
        },
        {
          id: 10,
          title: 'Intense Sessions',
          duration: '28:45',
          thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
          views: '6.1K'
        }
      ]
    }
  };

  const collection = collectionData[id];

  if (!collection) {
    return <div>Collection not found</div>;
  }

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
            <Button variant="outline" className="border-green-400 text-gray-900 hover:bg-green-400 hover:text-white">
              Login
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Collection Header */}
      <header className="px-4 md:px-8 lg:px-16 py-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`px-3 py-1 rounded text-sm font-bold text-white ${getTierColor(collection.tier)}`}>
            {collection.tier}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${getContentColor(collection.tier)}`}>
            {collection.title}
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-4xl">
          {collection.description}
        </p>
      </header>

      {/* Video Grid */}
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-xl hover:shadow-gray-500/20 cursor-pointer"
            >
              <div className="relative group">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-12 h-12 text-gray-400" fill="currentColor" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-300">
                  {video.title}
                </h3>
              </div>
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

export default VideoCollection;
