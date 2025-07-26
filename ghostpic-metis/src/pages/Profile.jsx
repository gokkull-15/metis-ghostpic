import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchUserData(accounts[0]);
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

    checkWalletConnection();
  }, []);

  const fetchUserData = async (wallet) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-user?walletAddress=${wallet}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data.user);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || 'Failed to load profile data');
      setIsLoading(false);
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
      fetchUserData(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Profile</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          {!walletAddress && (
            <button
              onClick={handleConnectWallet}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white alegra">Your Profile</h1>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-purple-200">
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {userData && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-400 mb-1">User ID</p>
                    <p className="text-white font-mono">{userData.userId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}