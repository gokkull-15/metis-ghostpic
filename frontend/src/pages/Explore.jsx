import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        
        if (response.data && response.data.success && response.data.posts) {
          setPosts(response.data.posts);
        } else {
          setError('Unexpected response structure');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-purple-200 font-medium">Loading ghostly images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-gray-800/80 p-8 rounded-xl border border-red-400/30 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something Went Wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl righteous font-bold text-teal-600 mb-4">
            Explore Posts
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto alegra">
            Discover anonymous posts from around the world
          </p>
        </div>

        {/* Posts Grid */}
        {!Array.isArray(posts) ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Posts data is not available</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-lg">No ghostly posts found yet</p>
              <p className="text-gray-500 mt-2">Be the first to share something!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link 
                to={`/explore/${post.postId}`} 
                key={post.postId}
                className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="w-full h-64 sm:h-72 object-cover group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                      e.target.className = 'w-full h-64 sm:h-72 object-cover bg-gray-700';
                    }}
                  />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <p className="font-medium truncate">{post.caption || 'Untitled'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;