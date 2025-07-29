// Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GrLike, GrDislike } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();

  // Track liked/disliked posts
  const [likedPosts, setLikedPosts] = useState({});
  const [dislikedPosts, setDislikedPosts] = useState({});

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkWalletConnection();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      if (response.data && response.data.success && response.data.posts) {
        setPosts(response.data.posts);
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (likedPosts[postId]) return; // Prevent multiple likes

    try {
      const response = await axios.patch(`http://localhost:5000/api/posts/${postId}/like`, { toggle: false });
      
      // If user had disliked this post before, remove the dislike
      if (dislikedPosts[postId]) {
        await axios.patch(`http://localhost:5000/api/posts/${postId}/dislike`, { toggle: true });
        setDislikedPosts(prev => ({ ...prev, [postId]: false }));
      }

      // Update the post in state
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? { ...post, like: response.data.post.like, dislike: dislikedPosts[postId] ? post.dislike - 1 : post.dislike }
          : post
      ));

      // Update liked state
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error liking post:", err);
      alert('Failed to like post.');
    }
  };

  const handleDislike = async (postId, currentDislikes) => {
    if (dislikedPosts[postId]) return; // Prevent multiple dislikes

    try {
      const response = await axios.patch(`http://localhost:5000/api/posts/${postId}/dislike`, { toggle: false });
      
      // If user had liked this post before, remove the like
      if (likedPosts[postId]) {
        await axios.patch(`http://localhost:5000/api/posts/${postId}/like`, { toggle: true });
        setLikedPosts(prev => ({ ...prev, [postId]: false }));
      }

      // Update the post in state
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? { ...post, dislike: response.data.post.dislike, like: likedPosts[postId] ? post.like - 1 : post.like }
          : post
      ));

      // Update disliked state
      setDislikedPosts(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error disliking post:", err);
      alert('Failed to dislike post.');
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return 'Anonymous';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-purple-200 font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
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
    <div className="bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Ghostly</h1>
          {!walletAddress ? (
            <button
              onClick={handleConnectWallet}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              My Profile
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto pb-16">
        {/* Stories/Highlights could go here */}

        {/* Posts Feed */}
        {!Array.isArray(posts) ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Posts data is not available</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-lg">No posts found</p>
              <p className="text-gray-500 mt-2">Be the first to share something!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {posts.map((post) => (
              <article key={post.postId} className="py-4">
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">
                      {formatWalletAddress(post.walletAddress)}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>

                {/* Post Image */}
                <div className="aspect-square bg-black">
                  <Link to={`/explore/${post.postId}`}>
                    <img
                      src={post.imageUrl}
                      alt={post.caption || 'Post image'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x500?text=Image+Not+Found';
                        e.target.className = 'w-full h-full object-cover bg-gray-800';
                      }}
                    />
                  </Link>
                </div>

                {/* Post Actions */}
                <div className="px-4 pt-3">
                  <div className="flex justify-between mb-2">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleLike(post.postId, post.like)}
                        className={`focus:outline-none ${likedPosts[post.postId] ? 'text-green-400' : 'text-gray-300 hover:text-green-400'}`}
                      >
                        <GrLike className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleDislike(post.postId, post.dislike)}
                        className={`focus:outline-none ${dislikedPosts[post.postId] ? 'text-red-400' : 'text-gray-300 hover:text-red-400'}`}
                      >
                        <GrDislike className="h-6 w-6" />
                      </button>
                    </div>
                    <button className="text-gray-300 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Likes and Caption */}
                  <div className="mb-1">
                    <span className="font-semibold text-white">{post.like} likes</span>
                    {post.dislike > 0 && (
                      <span className="text-gray-400 ml-2">{post.dislike} dislikes</span>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="mb-2">
                    <span className="font-semibold text-white mr-2">
                      {formatWalletAddress(post.walletAddress)}
                    </span>
                    <span className="text-white">{post.caption}</span>
                  </div>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.hashtags.map((tag, index) => (
                        <Link 
                          key={index} 
                          to={`/explore?tag=${tag.substring(1)}`}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;