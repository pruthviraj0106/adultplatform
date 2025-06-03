import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.tsx';
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
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        
        // Use backend-provided thumbnail_url and video_url for the post
        setPost(data.post);
        
        // Check if user is subscribed to this tier
        const userSubscription = localStorage.getItem('userSubscription');
        setIsSubscribed(userSubscription === data.post.tier);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();

    // Cleanup function to revoke blob URLs
    return () => {
      if (post?.thumbnail) URL.revokeObjectURL(post.thumbnail);
      if (post?.video_url) URL.revokeObjectURL(post.video_url);
    };
  }, [id]);

  const handleSubscribe = () => {
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-400 mb-8">{post.description}</p>

          {!isSubscribed ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <Lock className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Premium Content</h2>
              <p className="text-gray-400 mb-4">
                Subscribe to access this {post.type.toLowerCase()}
              </p>
              <Button
                onClick={handleSubscribe}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Subscribe Now
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {post.type === 'Video' ? (
                <video
                  src={`http://localhost:8080${post.video_url}`}
                  controls
                  className="w-full"
                  autoPlay
                />
              ) : (
                <img
                  src={`http://localhost:8080${post.thumbnail_url}`}
                  alt={post.title}
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostView; 