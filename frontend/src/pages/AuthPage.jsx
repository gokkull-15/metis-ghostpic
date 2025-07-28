import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

// Replace with your actual contract ABI and address
import KYCContractABI from '../components/KYCContractABI.json';
const KYC_CONTRACT_ADDRESS = "0xDb3CeB37Ffdcf37bc26CE3caDC80323Db2269c7d";

export default function AuthPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('Not Specified');
  const [userId, setUserId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error("Error fetching wallet address:", err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const generateUserId = (wallet) => {
    if (!wallet) return '';
    
    // Extract parts of the wallet address
    const part1 = wallet.substring(2, 6).toLowerCase();
    const part2 = wallet.substring(6, 10).toUpperCase();
    const numbers = wallet.substring(10, 14).replace(/[a-f]/gi, '0');
    
    // Combine parts to create a unique ID with required characteristics
    const generatedId = `METIS-${part1}${part2}${numbers}`;
    
    // Ensure the ID meets all requirements
    if (
      /[A-Z]/.test(generatedId) && 
      /[a-z]/.test(generatedId) && 
      /[0-9].*[0-9]/.test(generatedId)
    ) {
      return generatedId;
    }
    
    // Fallback if the generated ID doesn't meet requirements
    return `METIS-${part1}${part2}${numbers}XX1aA`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!bio || !gender) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(KYC_CONTRACT_ADDRESS, KYCContractABI, signer);

      // Generate user ID
      const generatedUserId = generateUserId(walletAddress);
      setUserId(generatedUserId);

      // Call the smart contract function
      const tx = await contract.completeKYC(bio, gender, generatedUserId);
      await tx.wait();

  await fetch('http://localhost:5000/api/save-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    walletAddress,
    userId: generatedUserId,
    txHash: tx.hash
  })
  });


      setSuccess('KYC completed successfully!');
      setTxHash(tx.hash);
      setBio('');
      setGender('Not Specified');
      // Do not clear userId here so it remains visible in the success message
    } catch (err) {
      console.error("Error completing KYC:", err);
      setError(err.message || 'Failed to complete KYC');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-purple-200">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-200">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 8v-4m0 0H8m4 0h4"/></svg>
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white alegra">Complete Your KYC</h2>
            <p className="mt-2 text-sm text-white">
              Please provide the following information to complete your Know Your Customer verification.
            </p>
          </div>

          {walletAddress && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 flex items-center"><svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z"/></svg>Wallet Address:</p>
              <p className="text-sm text-blue-700 break-words font-mono">{walletAddress}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg flex flex-col gap-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
              {userId && (
                <span className="text-sm text-green-700 font-mono">Your User ID: <span className="font-bold">{userId}</span></span>
              )}
              {txHash && (
                <span className="text-sm text-green-700 font-mono">Transaction Hash: <a href={`https://sepolia-explorer.metisdevops.link/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-bold underline text-blue-700 hover:text-blue-900">{txHash}</a></span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bio" className="block alegra text-sm font-semibold text-white mb-2 flex items-center">
                BIO
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-700 text-base resize-none bg-purple-50"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2 alegra">GENDER</label>
              <div className="mt-1 space-y-2">
                {['Male', 'Female', 'Prefer not to say'].map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`gender-${option}`}
                      name="gender"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      checked={gender === option}
                      onChange={() => setGender(option)}
                    />
                    <label htmlFor={`gender-${option}`} className="ml-2 block text-sm text-gray-100 font-semibold">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow font-bold text-white bg-gradient-to-r from-teal-900 via-blue-700 to-teal-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center"><svg className="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Processing...</span>
                ) : (
                  <span className="flex items-center justify-center"><svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Complete KYC</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}