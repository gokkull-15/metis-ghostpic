import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { GrLike, GrDislike } from 'react-icons/gr';

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  // Like handler
  // Like handler (toggle)
  const handleLike = async () => {
    if (!post || liked) return; // Prevent multiple likes
    try {
      // Add like, remove dislike if set
      const res = await axios.patch(`http://localhost:5000/api/posts/${postId}/like`, { toggle: false });
      let newDislike = post.dislike;
      if (disliked) {
        const res2 = await axios.patch(`http://localhost:5000/api/posts/${postId}/dislike`, { toggle: true });
        newDislike = res2.data.post.dislike;
      }
      setPost((prev) => ({ ...prev, like: res.data.post.like, dislike: newDislike }));
      setLiked(true);
      setDisliked(false);
    } catch (err) {
      alert('Failed to like post.');
    }
  };

  const handleDislike = async () => {
    if (!post || disliked) return; // Prevent multiple dislikes
    try {
      // Add dislike, remove like if set
      const res = await axios.patch(`http://localhost:5000/api/posts/${postId}/dislike`, { toggle: false });
      let newLike = post.like;
      if (liked) {
        const res2 = await axios.patch(`http://localhost:5000/api/posts/${postId}/like`, { toggle: true });
        newLike = res2.data.post.like;
      }
      setPost((prev) => ({ ...prev, dislike: res.data.post.dislike, like: newLike }));
      setDisliked(true);
      setLiked(false);
    } catch (err) {
      alert('Failed to dislike post.');
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
        setPost(response.data.post);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
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
        <div className="text-red-400 text-xl">Error: {error}</div>
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
          to="/explore" 
          className="inline-flex items-center mb-6 text-purple-400 hover:text-purple-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Explore
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
                  <p className="font-semibold text-white">{post.walletAddress.substring(0, 6)}...{post.walletAddress.substring(post.walletAddress.length - 4)}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
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
                    link.download = post.caption ? post.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg' : 'post.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
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

            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="bg-purple-900/40 text-purple-200 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-4 mt-4">
              <div className="flex space-x-6">
                <button
                  className={`flex items-center focus:outline-none ${liked ? 'text-green-400' : 'text-gray-300'} group`}
                  onClick={handleLike}
                  title="Like"
                  disabled={liked}
                >
                  <GrLike className={`h-5 w-5 mr-1 transition-colors ${liked ? 'text-green-400' : 'group-hover:text-green-300'}`} />
                  <span className="font-semibold">{post.like}</span>
                </button>
                <button
                  className={`flex items-center focus:outline-none ${disliked ? 'text-red-400' : 'text-gray-300'} group`}
                  onClick={handleDislike}
                  title="Dislike"
                  disabled={disliked}
                >
                  <GrDislike className={`h-5 w-5 mr-1 transition-colors ${disliked ? 'text-red-400' : 'group-hover:text-red-300'}`} />
                  <span className="font-semibold">{post.dislike}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;