import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import axios from 'axios';
import dp from '../assets/dp.png';

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndWallet = async () => {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setIsLoading(false);
        setError('Please login to view your profile');
        return;
      }

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            await fetchDashboardData();
          } else {
            setIsLoading(false);
            setError('No wallet connected');
          }
        } catch (err) {
          console.error("Error fetching wallet address:", err);
          setIsLoading(false);
          setError('Failed to connect wallet');
        }
      } else {
        setIsLoading(false);
        setError('MetaMask is not installed');
      }
    };

    checkAuthAndWallet();
  }, []);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const likes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
      const dislikes = posts.reduce((sum, post) => sum + (post.dislikeCount || 0), 0);
      setTotalLikes(likes);
      setTotalDislikes(dislikes);
    }
  }, [posts]);

  const fetchDashboardData = async () => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making request with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get('http://localhost:5000/auth/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        const dashboardData = response.data.dashboard;
        setUserData(dashboardData.userInfo);
        setPosts(dashboardData.posts || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load profile data');
      }
    } finally {
      setIsLoading(false);
      setPostsLoading(false);
    }
  };

  const profilePicture = userData?.profilePicture ? userData.profilePicture : dp;

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      await fetchDashboardData();
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
        <div className="relative z-10 flex flex-col items-center bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
        <div className="relative z-10 max-w-md mx-auto bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500 text-center">
          <div className="text-red-300 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Profile</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Session expired') ? (
              <button
                onClick={handleLogin}
                className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                <span className="relative block bg-black/90 rounded-sm py-2">
                  Go to Login
                </span>
              </button>
            ) : null}
            {!walletAddress && !error.includes('login') && (
              <button
                onClick={handleConnectWallet}
                className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                <span className="relative block bg-black/90 rounded-sm py-2">
                  Connect Wallet
                </span>
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
              <span className="relative block bg-black/90 rounded-sm py-2">
                  Refresh Page
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-2 pt-10">
        <div className="bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 object-cover object-center aspect-square rounded-full border-2 border-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.9)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = dp;
              }}
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4">
                <h2 className="text-xl font-extrabold text-white flex items-center">
                  {userData?.username || 'User ID'}
                  <span className="ml-2 flex items-center border-green-500 border-2 p-2 rounded-full">
                    <span className="text-green-400 text-xs font-semibold">
                      {userData?.userLevel === 'super_active' ? 'Verified' : 
                       userData?.userLevel === 'active' ? 'Verified' : 'Verified'}
                    </span>
                    <svg className="w-4 h-4 ml-1 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                </h2>
              </div>
              <div className="flex space-x-8 mb-2">
                <div className="text-center">
                  <span className="font-bold text-white">{posts?.length || 0}</span>
                  <span className="text-gray-400 block text-sm">Posts</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-white">{totalLikes}</span>
                  <span className="text-gray-400 block text-sm">Likes</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-white">{totalDislikes}</span>
                  <span className="text-gray-400 block text-sm">Dislikes</span>
                </div>
              </div>
              {userData?.walletAddress && (
                <div className="mb-4">
                  <span className="text-gray-400 text-xs">Wallet:</span>
                  <span className="ml-2 text-white text-xs break-all">{userData.walletAddress}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-white mb-4">
                <div>
                  <span className="text-gray-400 text-sm">State: </span>
                  <span className="font-medium capitalize">{userData?.state || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Member since: </span>
                  <span className="font-medium">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Last login: </span>
                  <span className="font-medium">
                    {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">KYC Status: </span>
                  <span className="font-medium">
                    {userData?.kycHash ? 'Verified on-Chain' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t border-gray-700 my-4 max-w-4xl mx-auto" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        ) : postsError ? (
          <div className="text-center py-12 bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
            <div className="text-red-300 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Posts</h3>
            <p className="text-gray-300 mb-4">{postsError}</p>
            <button
              onClick={fetchDashboardData}
              className="relative px-4 py-2 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
              <span className="relative block bg-black/90 rounded-sm py-1">
                Retry
              </span>
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(139,92,246,0.9)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
            <p className="text-gray-300">When you share photos and videos, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <Link
                to={`/posts/${post.postId}`}
                key={post.postId}
                className="group relative block overflow-hidden rounded-sm border border-gray-700 shadow-lg hover:shadow-[0_0_15px_#6b46c1] transition-all duration-300"
              >
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    e.target.className = 'w-full h-full object-cover bg-black/90';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="text-white text-sm truncate w-full">
                    {post.caption || 'Untitled'}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <span className="text-white text-xs bg-black/90 border border-green-600 px-2 py-1 rounded flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
                      </svg>
                      {post.likeCount || 0}
                    </span>
                    <span className="text-white text-xs bg-black/90 border border-red-600 px-2 py-1 rounded flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                      </svg>
                      {post.dislikeCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}