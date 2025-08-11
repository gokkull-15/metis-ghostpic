import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { GrLike, GrDislike } from 'react-icons/gr';

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInteraction, setUserInteraction] = useState(null); // 'like', 'dislike', or null

  // Configure axios with auth token (use the same key as Profile.jsx)
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    } : {};
  };

  // Like handler
  const handleLike = async () => {
    if (!post || userInteraction === 'like') return;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`, 
        {}, 
        getAuthConfig()
      );
      
      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          likeCount: response.data.post.likeCount,
          dislikeCount: response.data.post.dislikeCount
        }));
        setUserInteraction('like');
      }
    } catch (err) {
      console.error('Like error:', err);
      if (err.response?.status === 401) {
        alert('Please log in to like posts.');
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'You have already liked this post.');
      } else {
        alert('Failed to like post.');
      }
    }
  };

  // Dislike handler
  const handleDislike = async () => {
    if (!post || userInteraction === 'dislike') return;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/dislike`, 
        {}, 
        getAuthConfig()
      );
      
      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          likeCount: response.data.post.likeCount,
          dislikeCount: response.data.post.dislikeCount,
          active: response.data.post.active
        }));
        setUserInteraction('dislike');
        
        if (!response.data.post.active) {
          alert('This post has been deactivated due to excessive dislikes.');
        }
      }
    } catch (err) {
      console.error('Dislike error:', err);
      if (err.response?.status === 401) {
        alert('Please log in to dislike posts.');
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'You have already disliked this post.');
      } else {
        alert('Failed to dislike post.');
      }
    }
  };

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/posts/${postId}`,
          getAuthConfig()
        );
        
        if (response.data.success) {
          setPost(response.data.post);
        } else {
          setError(response.data.message || 'Failed to fetch post');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 404) {
          setError('Post not found');
        } else if (err.response?.status === 403) {
          setError('You can only view posts from your state');
        } else if (err.response?.status === 401) {
          setError('Please log in to view posts');
        } else {
          setError(err.response?.data?.message || 'Failed to load post');
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <Link 
            to="/explore" 
            className="inline-flex items-center text-purple-400 hover:text-purple-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-2">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/home" 
          className="inline-flex items-center mb-6 text-purple-400 hover:text-purple-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Posts Explorer
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
          <img 
            src={post.imageUrl} 
            alt={post.caption} 
            className="w-full h-96 object-contain bg-gray-900 border-b border-gray-700"
          />

          <div className="p-6">
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <div className="bg-purple-700/20 text-purple-300 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {post.authorUsername || 
                     (post.walletAddress ? 
                      `${post.walletAddress.substring(0, 6)}...${post.walletAddress.substring(post.walletAddress.length - 4)}` : 
                      'Anonymous'
                     )
                    }
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.authorState && post.authorState !== 'unknown' && (
                      <>
                        <span>•</span>
                        <span>{post.authorState}</span>
                      </>
                    )}
                    {post.authorLevel && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{post.authorLevel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium shadow transition-colors"
                onClick={async () => {
                  try {
                    const response = await fetch(post.imageUrl, { mode: 'cors' });
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = post.caption ? 
                      post.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg' : 
                      `post_${post.postId}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Download error:', err);
                    alert('Failed to download image.');
                  }
                }}
                title="Download image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12" />
                </svg>
                Download
              </button>
            </div>

            <p className="text-lg text-white font-semibold mb-2">{post.caption}</p>

            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="bg-purple-900/40 text-purple-200 px-2 py-1 rounded-full text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-700 pt-4 mt-4">
              <div className="flex space-x-6">
                <button
                  className={`flex items-center focus:outline-none transition-colors ${
                    userInteraction === 'like' 
                      ? 'text-green-400' 
                      : 'text-gray-300 hover:text-green-300'
                  } group`}
                  onClick={handleLike}
                  title="Like"
                  disabled={userInteraction === 'like'}
                >
                  <GrLike className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{post.likeCount || 0}</span>
                </button>
                <button
                  className={`flex items-center focus:outline-none transition-colors ${
                    userInteraction === 'dislike' 
                      ? 'text-red-400' 
                      : 'text-gray-300 hover:text-red-300'
                  } group`}
                  onClick={handleDislike}
                  title="Dislike"
                  disabled={userInteraction === 'dislike'}
                >
                  <GrDislike className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{post.dislikeCount || 0}</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                Post ID: {post.postId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;