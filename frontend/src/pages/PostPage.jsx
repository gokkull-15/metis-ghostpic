import { useState, useEffect } from 'react';
import { FiUpload, FiHash, FiUser, FiImage, FiType } from 'react-icons/fi';

const PostPage = () => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Auto-detect wallet address from MetaMask
  useEffect(() => {
    async function fetchWallet() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          setMessage({ text: 'Failed to fetch wallet address', type: 'error' });
        }
      } else {
        setMessage({ text: 'MetaMask not detected', type: 'error' });
      }
    }
    fetchWallet();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        setMessage({ text: 'Please upload a valid image (JPEG, PNG, JPG)', type: 'error' });
      }
    }
  };

  const uploadToIPFS = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Please select an image first', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage({ text: 'Uploading to IPFS...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': 'c5f3a546a5f420344f13',
          'pinata_secret_api_key': '4d2785eeba3eda195aaf2aedd953089ac2571db59ccae266ee96170bb6c3c175',
        },
        body: formData,
      });

      const data = await response.json();
      setIpfsHash(data.IpfsHash);
      setMessage({ text: 'Image uploaded to IPFS successfully!', type: 'success' });
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      setMessage({ text: 'Failed to upload to IPFS', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ipfsHash) {
      setMessage({ text: 'Please upload the image first', type: 'error' });
      return;
    }
    if (!caption) {
      setMessage({ text: 'Caption is required', type: 'error' });
      return;
    }
    if (!walletAddress) {
      setMessage({ text: 'Wallet not connected', type: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/savePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption,
          hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
          walletAddress,
          imageUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Post saved successfully!', type: 'success' });
        // Reset form
        setCaption('');
        setHashtags('');
        setSelectedFile(null);
        setIpfsHash('');
      } else {
        setMessage({ text: data.message || 'Failed to save post', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setMessage({ text: 'Failed to save post', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h1>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FiImage className="mr-2" /> Post Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 transition-all rounded-lg cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-7">
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  <p className="pt-1 text-sm tracking-wider text-gray-400">
                    {selectedFile ? selectedFile.name : 'Upload a photo'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="opacity-0" 
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                />
              </label>
            </div>
            {selectedFile && !ipfsHash && (
              <button
                type="button"
                onClick={uploadToIPFS}
                disabled={isUploading}
                className={`mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploading ? 'Uploading...' : 'Upload to IPFS'}
              </button>
            )}
            {ipfsHash && (
              <p className="mt-2 text-sm text-green-600">Image uploaded! IPFS Hash: {ipfsHash}</p>
            )}
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FiType className="mr-2" /> Caption
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here..."
              required
            />
          </div>

          {/* Hashtags */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FiHash className="mr-2" /> Hashtags
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#art #nft #digital"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with spaces</p>
          </div>

          {/* Wallet Address (auto-detected) */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FiUser className="mr-2" /> Wallet Address
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              value={walletAddress ? walletAddress : 'Not Connected'}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!ipfsHash || isUploading}
          >
            Publish Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostPage;