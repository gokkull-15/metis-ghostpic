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

  const checkNullifier = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/check-nullifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
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
      const tx = await contract.storeNullifier(nullifier);
      await tx.wait();
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      <div className="relative w-full max-w-4xl z-10 animate-fade-in p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(139,92,246,0.9)] rounded-md transform hover:scale-110 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide">
            GhostPic Register
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-2">
            Complete your registration in three simple steps to access our decentralized platform
          </p>
        </div>
        <div className="bg-gray-900/75 backdrop-blur-lg p-8 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500 space-y-8">
          {/* Step 1: Check Nullifier */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold text-lg mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-white">Verify Nullifier</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={nullifier}
                    onChange={(e) => setNullifier(e.target.value)}
                    placeholder="Enter your nullifier hash"
                    className="w-full pl-10 pr-4 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={checkNullifier}
                  disabled={loading || !nullifier}
                  className="relative px-6 py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none min-w-[120px]"
                >
                  <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                  <span className="relative block bg-black/90 rounded-sm py-2">
                    {loading ? (
                      <span className="flex justify-center items-center gap-2">
                        <span className="loader"></span> Checking...
                      </span>
                    ) : 'Verify'}
                  </span>
                </button>
              </div>
              {checkResponse && (
                <div className={`p-4 rounded-sm border ${checkResponse.success ? 'bg-green-900/25 border-green-500 text-green-300' : 'bg-red-900/25 border-red-500 text-red-300'} animate-fade-in`}>
                  <div className="flex items-center gap-2">
                    {checkResponse.success ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{checkResponse.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Step 2: Store on Chain */}
          {checkResponse?.success && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-lg mr-4">
                  2
                </div>
                <h2 className="text-2xl font-bold text-white">Store Nullifier on Metis Sepolia</h2>
              </div>
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
                >
                  <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                  <span className="relative block bg-black/90 rounded-sm py-2">
                    <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    Connect Wallet
                  </span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-black/90 p-4 rounded-sm border border-gray-700">
                    <p className="text-gray-300 text-sm mb-1">Connected Wallet:</p>
                    <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                  <button
                    onClick={storeNullifierOnChain}
                    disabled={!!txHash || loading}
                    className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
                  >
                    <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                    <span className="relative block bg-black/90 rounded-sm py-2">
                      {loading ? (
                        <span className="flex justify-center items-center gap-2">
                          <span className="loader"></span> Processing...
                        </span>
                      ) : txHash ? (
                        <>
                          <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Stored Successfully
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Store on Blockchain
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}
              {txHash && (
                <div className="mt-4 p-4 bg-green-900/25 border border-green-500 rounded-sm animate-fade-in">
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
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-bold text-lg mr-4">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Complete Registration</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    Select your State/Union Territory
                  </label>
                  <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition appearance-none"
                    >
                      <option value="">Choose your state...</option>
                      {statesList.map((s) => (
                        <option key={s} value={s} className="py-2">{s}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a secure password"
                      className="w-full pl-10 pr-4 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  onClick={registerUser}
                  disabled={loading || !state || !password}
                  className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
                >
                  <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
                  <span className="relative block bg-black/90 rounded-sm py-2">
                    {loading ? (
                      <span className="flex justify-center items-center gap-2">
                        <span className="loader"></span> Registering...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Complete Registration
                      </>
                    )}
                  </span>
                </button>
                {registerResponse && (
                  <div className={`p-4 rounded-sm border ${registerResponse.success ? 'bg-green-900/25 border-green-500' : 'bg-red-900/25 border-red-500'} animate-fade-in`}>
                    {registerResponse.success ? (
                      <div className="text-green-300">
                        <div className="flex items-center mb-4">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                        <div className="mt-4 p-3 bg-blue-900/25 border border-blue-500 rounded-sm">
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
                        <span>{registerResponse.message}</span>
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