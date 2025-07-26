import { useState, useEffect } from "react";
import { FiUpload, FiHash, FiUser, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { BrowserProvider, Contract, ethers } from "ethers";

// Smart contract ABI and address (replace with your deployed contract address)
const contractABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_imageHash", "type": "string"},
      {"internalType": "string", "name": "_caption", "type": "string"},
      {"internalType": "string", "name": "_hashtags", "type": "string"}
    ],
    "name": "createPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "imageHash", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "caption", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "hashtags", "type": "string"},
      {"indexed": false, "internalType": "address", "name": "walletAddress", "type": "address"}
    ],
    "name": "NewPostCreated",
    "type": "event"
  }
];
const contractAddress = "0xYOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address

export const PostPage = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect wallet address from MetaMask
  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error("Error connecting to MetaMask:", err);
          setError("Please connect to MetaMask to continue");
        }
      } else {
        setError("MetaMask is not installed");
      }
    };

    checkMetaMask();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload only JPG, JPEG, or PNG images");
        return;
      }
      setImage(file);
      setError("");
    }
  };

  const uploadToIPFS = async () => {
    if (!image) {
      setError("Please select an image first");
      return null;
    }

    setStatus("Uploading to IPFS...");
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': 'c5f3a546a5f420344f13',
          'pinata_secret_api_key': '4d2785eeba3eda195aaf2aedd953089ac2571db59ccae266ee96170bb6c3c175',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (err) {
      console.error("IPFS Upload Error:", err);
      setError("Failed to upload image to IPFS");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const storeOnChain = async (ipfsHash) => {
    if (!window.ethereum) {
      setError("MetaMask is not available");
      return false;
    }

    setStatus("Posting on-chain...");
    setIsLoading(true);

    try {
      // Initialize provider and signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize contract
      const contract = new Contract(contractAddress, contractABI, signer);

      // Send transaction
      const tx = await contract.createPost(ipfsHash, caption, hashtag);
      await tx.wait();

      setStatus("Success! Post created on blockchain");
      return true;
    } catch (err) {
      console.error("Blockchain Error:", err);
      setError("Failed to post on blockchain");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    // Basic form validation
    if (!image) {
      setError("Please select an image");
      return;
    }
    if (!caption.trim()) {
      setError("Please enter a caption");
      return;
    }
    if (!hashtag.trim()) {
      setError("Please enter at least one hashtag");
      return;
    }
    if (!walletAddress) {
      setError("Wallet address not detected");
      return;
    }

    // Upload to IPFS
    const ipfsHash = await uploadToIPFS();
    if (!ipfsHash) return;

    // Store on blockchain
    await storeOnChain(ipfsHash);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create a New Post</h2>
            <p className="text-gray-600">Share your content on the blockchain</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {status && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
              <FiCheckCircle className="mr-2" />
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (JPG, PNG)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span className="flex items-center">
                        <FiUpload className="mr-2" />
                        Upload a file
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {image ? image.name : "PNG, JPG up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                Caption
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="caption"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="What's on your mind?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>

            {/* Hashtag */}
            <div>
              <label htmlFor="hashtag" className="block text-sm font-medium text-gray-700">
                Hashtag
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="hashtag"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="blockchain, web3, etc"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="wallet"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-100"
                  value={walletAddress}
                  readOnly
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Post to Blockchain'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};