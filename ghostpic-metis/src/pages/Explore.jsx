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
        // Use full URL if not using proxy
        const response = await axios.get('http://localhost:5000/api/posts');
        
        // Debug: Log the full response
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Posts array:', response.data.posts);
        console.log('Posts length:', response.data.posts?.length);
        
        // Check if response has the expected structure
        if (response.data && response.data.success && response.data.posts) {
          setPosts(response.data.posts);
        } else {
          console.error('Unexpected response structure:', response.data);
          setError('Unexpected response structure');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">Explore GhostPics</h1>
      {/* Only show images, remove debug info, like/dislike, date, and caption */}
      {!Array.isArray(posts) ? (
        <div className="text-center text-red-500">Posts data is not an array</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500">No posts found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link 
              to={`/explore/${post.postId}`} 
              key={post.postId}
              className="transition-transform duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;