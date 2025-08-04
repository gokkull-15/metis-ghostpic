import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Extract initial search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [location.search]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please login.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/posts/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success && response.data.posts) {
          setPosts(response.data.posts);
          setFilteredPosts(response.data.posts);
          
          // If there's an initial search query, filter immediately
          if (searchQuery) {
            filterPostsByHashtags(searchQuery, response.data.posts);
          }
        } else {
          setError('Unexpected response structure');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (err.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load posts');
        }
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts whenever searchQuery changes
  useEffect(() => {
    filterPostsByHashtags(searchQuery, posts);
  }, [searchQuery, posts]);

  const filterPostsByHashtags = (query, postsToFilter) => {
    if (!query) {
      setFilteredPosts(postsToFilter);
      return;
    }

    // Split query into individual search terms (remove # and trim)
    const searchTerms = query.split(/\s+/)
      .map(term => term.replace('#', '').trim().toLowerCase())
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const normalizedQuery = query.replace('#', '').trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const results = postsToFilter.filter(post => {
      // Check each hashtag in the post
      return post.hashtags?.some(tag => {
        // Normalize the tag (remove # if present and convert to lowercase)
        const normalizedTag = tag.startsWith('#') 
          ? tag.substring(1).toLowerCase() 
          : tag.toLowerCase();
        
        // Check if the normalized tag starts with the normalized query
        return normalizedTag.startsWith(normalizedQuery);
      });
    });

    setFilteredPosts(results);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    navigate(`?q=${encodeURIComponent(query)}`, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('', { replace: true });
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

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
          <div className="space-y-3">
            {error.includes('login') || error.includes('Authentication') || error.includes('Session') ? (
              <button
                onClick={handleLoginRedirect}
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Go to Login
              </button>
            ) : null}
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="text-center mb-12">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by hashtags (e.g., ghost art)"
              className="block w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <p className="text-gray-500 mt-3">
              {filteredPosts.length} results for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Posts Grid */}
        {!Array.isArray(filteredPosts) ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Posts data is not available</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              {searchQuery ? (
                <>
                  <p className="text-gray-400 text-lg">No posts found matching your search</p>
                  <p className="text-gray-500 mt-2">Try different hashtags</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">No ghostly posts found yet</p>
                  <p className="text-gray-500 mt-2">Be the first to share something!</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <Link 
                to={`/posts/${post.postId}`} 
                key={post.postId}
                className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
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