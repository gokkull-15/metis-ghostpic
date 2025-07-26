import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostPage = ({ walletAddress }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localWalletAddress, setLocalWalletAddress] = useState(walletAddress || '');
  const fileInputRef = useRef(null);
  // Fetch wallet address from MetaMask if not provided
  useEffect(() => {
    async function fetchWallet() {
      if (!localWalletAddress && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setLocalWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error('Error fetching wallet address:', err);
        }
      }
    }
    fetchWallet();
  }, [localWalletAddress]);

  // Smart contract address and ABI
  const contractAddress = "0xB6CD43CC5aD6C7cb93306eD4CF35662E90f612F2"; // Replace with your contract address
  const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "HashStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserHashCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserHashes",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "storeHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userHashes",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadToIPFS = async (data) => {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': 'c5f3a546a5f420344f13',
          'pinata_secret_api_key': '4d2785eeba3eda195aaf2aedd953089ac2571db59ccae266ee96170bb6c3c175' // In production, keep this secure
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('IPFS upload failed');
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const storeOnChain = async (ipfsHash) => {
    try {
      // Connect to Metis Sepolia
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the storeHash function
      const tx = await contract.storeHash(ipfsHash);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error storing on chain:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!image) {
      toast.error('Please upload an image');
      return;
    }
    
    if (!caption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    setIsUploading(true);

    try {
      // Prepare post data
      const postData = {
        image: imagePreview,
        caption,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        walletAddress,
        timestamp: new Date().toISOString()
      };

      // Step 1: Upload to IPFS
      toast.info('Uploading to IPFS...');
      const ipfsHash = await uploadToIPFS(postData);
      toast.success('Uploaded to IPFS!');

      // Step 2: Store on blockchain
      toast.info('Storing on blockchain...');
      const hash = await storeOnChain(ipfsHash);
      setTxHash(hash);
      toast.success('Post created successfully!');

      // Reset form
      setImage(null);
      setImagePreview(null);
      setCaption('');
      setHashtags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-80 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <>
              <FiCamera className="mx-auto text-gray-400" size={48} />
              <p className="mt-2 text-gray-600">Upload an image</p>
              <p className="text-sm text-gray-500 mb-4">JPG, JPEG, PNG only</p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
                <FiUpload className="mr-2" />
                Select Image
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg, image/jpg, image/png"
                  className="hidden"
                  required
                />
              </label>
            </>
          )}
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-600">Wallet Address</p>
          <p className="font-mono text-sm break-words">{localWalletAddress ? localWalletAddress : 'Not Connected'}</p>
        </div>

        {/* Caption */}
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
            Caption *
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="What's on your mind?"
            required
          />
        </div>

        {/* Hashtags */}
        <div>
          <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-1">
            Hashtags
          </label>
          <input
            type="text"
            id="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#example #tags (space separated)"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${isUploading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isUploading ? 'Posting...' : 'Post'}
        </button>

        {/* Transaction Info */}
        {txHash && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">Post created successfully!</p>
            <p className="text-sm mt-1">
              View transaction: {' '}
              <a 
                href={`https://sepolia-explorer.metisdevops.link/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {txHash.substring(0, 20)}...
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostPage;