import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import { Lock, Play, AlertTriangle } from 'lucide-react';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        const response = await fetch(`/api/content/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        setPost(data);
        
        // Check if user is subscribed to this tier
        const userSubscription = localStorage.getItem('userSubscription');
        setIsSubscribed(userSubscription === data.tier);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubscribe = () => {
    // TODO: Implement subscription logic
    navigate('/subscription', { state: { tier: post.tier } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className={`px-3 py-1 rounded-full ${
              post.tier === 'BASIC' ? 'bg-blue-600' :
              post.tier === 'MEDIUM' ? 'bg-orange-600' :
              'bg-red-600'
            }`}>
              {post.tier}
            </span>
            <span>{post.price}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
          {post.type === 'Video' ? (
            isSubscribed ? (
              <video
                src={post.videoUrl}
                controls
                className="w-full aspect-video"
                poster={post.imageUrl}
              />
            ) : (
              <div className="relative aspect-video">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Premium Content</h3>
                    <p className="text-gray-300 mb-4">
                      Subscribe to {post.tier} tier to watch this video
                    </p>
                    <Button
                      onClick={handleSubscribe}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      Subscribe Now
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto"
            />
          )}
        </div>

        {/* Post Description */}
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed">{post.description}</p>
        </div>

        {/* Subscription CTA */}
        {!isSubscribed && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-pink-500">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Want to see more?</h3>
                <p className="text-gray-300">
                  Subscribe to {post.tier} tier to access this and more premium content.
                </p>
              </div>
              <Button
                onClick={handleSubscribe}
                className="bg-pink-600 hover:bg-pink-700 whitespace-nowrap"
              >
                Subscribe Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostView; 