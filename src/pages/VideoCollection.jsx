import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.tsx';
import Navigation from '../components/Navigation';
import { Play, ArrowLeft, X } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';

const VideoCollection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [collection, setCollection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const getTierLevel = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 1;
      case 'MEDIUM':
        return 2;
      case 'HARDCORE':
        return 3;
      default:
        return 0;
    }
  };

  const checkTierAccess = (collectionTier) => {
    if (!user || !user.subscription_tier) {
      return collectionTier === 'BASIC';
    }
    return getTierLevel(user.subscription_tier) >= getTierLevel(collectionTier);
  };

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching collection data from:', `${API_URL}/collections/${id}/posts`);
        const response = await fetch(`${API_URL}/collections/${id}/posts`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Collection data:', data);

        if (!data.collection || !data.posts) {
          throw new Error('Invalid response format from server');
        }

        setCollection(data.collection);
        setPosts(data.posts);
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection: ' + (err.message || 'Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [id]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Collection not found</div>
      </div>
    );
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
      <Navigation />
      
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-800 hover:bg-gray-700 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{collection.title}</h1>
          <p className="text-gray-400">{collection.description}</p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer group" onClick={() => handlePostClick(post)}>
              <div className="relative">
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{post.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Video/Photo Viewer */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            {selectedPost.type === 'Video' ? (
              <video
                src={selectedPost.video_url}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            ) : (
              <img
                src={selectedPost.thumbnail_url}
                alt={selectedPost.title}
                className="w-full rounded-lg"
              />
            )}
            <div className="mt-4 text-white">
              <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
              <p className="text-gray-400 mt-2">{selectedPost.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCollection;
