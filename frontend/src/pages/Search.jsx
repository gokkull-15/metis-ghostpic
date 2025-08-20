import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';

const Search = () => {
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
      return post.hashtags?.some(tag => {
        const normalizedTag = tag.startsWith('#') 
          ? tag.substring(1).toLowerCase() 
          : tag.toLowerCase();
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
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
        <div className="relative z-10 flex flex-col items-center bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading ghostly images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
        <div className="relative z-10 bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Something Went Wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Authentication') || error.includes('Session') ? (
              <button
                onClick={handleLoginRedirect}
                className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                <span className="relative block bg-black/90 rounded-sm py-2">
                  Go to Login
                </span>
              </button>
            ) : null}
            <button
              onClick={() => window.location.reload()}
              className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
              <span className="relative block bg-black/90 rounded-sm py-2">
                Try Again
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by hashtags (e.g., ghost art)"
              className="w-full pl-10 pr-12 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-gray-300 mt-3">
              {filteredPosts.length} results for "{searchQuery}"
            </p>
          )}
        </div>
        <div className="bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
          {!Array.isArray(filteredPosts) ? (
            <div className="text-center py-20">
              <p className="text-red-300 text-lg">Posts data is not available</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-black/90 border border-gray-700 rounded-sm">
                {searchQuery ? (
                  <>
                    <p className="text-gray-300 text-lg">No posts found matching your search</p>
                    <p className="text-gray-400 mt-2">Try different hashtags</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 text-lg">No ghostly posts found yet</p>
                    <p className="text-gray-400 mt-2">Be the first to share something!</p>
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
                  className="group relative block overflow-hidden rounded-sm border border-gray-700 shadow-lg hover:shadow-[0_0_15px_#6b46c1] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-64 sm:h-72 object-cover group-hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        e.target.className = 'w-full h-64 sm:h-72 object-cover bg-black/90';
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
    </div>
  );
};

export default Search;