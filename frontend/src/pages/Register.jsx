import { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../abi/NullifierStorageABI.json';

const statesList = [
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal",

  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Contract address (replace with your deployed contract address)
const CONTRACT_ADDRESS = "0x7d444078768BbdBdB42Fb0F001d5d7B3EF3871f0";

const Register = () => {
  const [nullifier, setNullifier] = useState('');
  const [checkResponse, setCheckResponse] = useState(null);
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [registerResponse, setRegisterResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  // Check nullifier with backend
  const checkNullifier = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/check-nullifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nullifier }),
      });
      const data = await response.json();
      setCheckResponse(data);
    } catch (error) {
      console.error('Error checking nullifier:', error);
      setCheckResponse({ success: false, message: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet and initialize contract
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize provider
        const provider = new BrowserProvider(window.ethereum);
        
        // Get signer
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        
        // Initialize contract
        const contractInstance = new Contract(CONTRACT_ADDRESS, abi, signer);
        setContract(contractInstance);
        
        return address;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    } else {
      throw new Error('Please install MetaMask!');
    }
  };

  // Store nullifier on-chain
  const storeNullifierOnChain = async () => {
    if (!contract) {
      try {
        await connectWallet();
      } catch (error) {
        alert(error.message);
        return null;
      }
    }

    try {
      setLoading(true);
      // Call the smart contract function
      const tx = await contract.storeNullifier(nullifier);
      await tx.wait(); // Wait for transaction to be mined
      setTxHash(tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error storing nullifier on chain:', error);
      alert(`Error: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const registerUser = async () => {
    if (!checkResponse?.success) {
      alert('Please verify your nullifier first');
      return;
    }

    if (!txHash) {
      alert('Please store nullifier on chain first');
      return;
    }

    if (!state || !password) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nullifier,
          kycHash: txHash,
          walletAddress,
          state,
          password
        }),
      });
      const data = await response.json();
      setRegisterResponse(data);
      if (data.success) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setRegisterResponse({ success: false, message: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the Network
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Complete your registration in three simple steps to access our decentralized platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1: Check Nullifier */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold text-lg mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-white">Verify Nullifier</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={nullifier}
                    onChange={(e) => setNullifier(e.target.value)}
                    placeholder="Enter your nullifier hash"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <button 
                  onClick={checkNullifier} 
                  disabled={loading || !nullifier}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : 'Verify'}
                </button>
              </div>
              
              {checkResponse && (
                <div className={`p-4 rounded-lg border ${
                  checkResponse.success 
                    ? 'bg-green-900/20 border-green-500/50 text-green-300' 
                    : 'bg-red-900/20 border-red-500/50 text-red-300'
                }`}>
                  <div className="flex items-center">
                    {checkResponse.success ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {checkResponse.message}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Store on Chain */}
          {checkResponse?.success && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-lg mr-4">
                  2
                </div>
                <h2 className="text-2xl font-bold text-white">Store Nullifier on Metis Sepolia</h2>
              </div>
              
              {!walletAddress ? (
                <button 
                  onClick={connectWallet}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Connect Wallet
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                    <p className="text-gray-300 text-sm mb-1">Connected Wallet:</p>
                    <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                  <button 
                    onClick={storeNullifierOnChain} 
                    disabled={!!txHash || loading}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Transaction...
                      </>
                    ) : txHash ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Stored Successfully
                      </>
                    ) : 'Store on Blockchain'}
                  </button>
                </div>
              )}
              
              {txHash && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                  <div className="flex items-center text-green-300 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Transaction Successful!</span>
                  </div>
                  <a 
                    href={`https://sepolia-explorer.metisdevops.link/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Explorer
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Registration */}
          {txHash && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-bold text-lg mr-4">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Complete Registration</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select your State/Union Territory
                  </label>
                  <select 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Choose your state...</option>
                    {statesList.map((s) => (
                      <option key={s} value={s} className="py-2">{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <button 
                  onClick={registerUser} 
                  disabled={loading || !state || !password}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Complete Registration
                    </>
                  )}
                </button>
                
                {registerResponse && (
                  <div className={`p-6 rounded-xl border ${
                    registerResponse.success 
                      ? 'bg-green-900/20 border-green-500/50' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`}>
                    {registerResponse.success ? (
                      <div className="text-green-300">
                        <div className="flex items-center mb-4">
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-semibold">Registration Successful!</span>
                        </div>
                        {registerResponse.user && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-400">User ID:</span>
                                <span className="ml-2 font-mono">{registerResponse.user.id}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Username:</span>
                                <span className="ml-2">{registerResponse.user.username}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-400">KYC Hash:</span>
                                <span className="ml-2 font-mono text-xs break-all">{registerResponse.user.kycHash}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-400">Wallet Address:</span>
                                <span className="ml-2 font-mono text-xs break-all">{registerResponse.user.walletAddress}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">State:</span>
                                <span className="ml-2">{registerResponse.user.state}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <p className="text-blue-300 text-sm">
                            🎉 Redirecting to login page in a moment...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-300">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {registerResponse.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;