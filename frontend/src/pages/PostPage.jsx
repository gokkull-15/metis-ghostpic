import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiHash, FiZap } from 'react-icons/fi';

const CreatePost = () => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const navigate = useNavigate();

  // Pinata IPFS configuration (should be in environment variables in production)
  const pinataApiKey = 'c5f3a546a5f420344f13';
  const pinataSecretApiKey = '4d2785eeba3eda195aaf2aedd953089ac2571db59ccae266ee96170bb6c3c175';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    URL.revokeObjectURL(previewUrl);
  };

  const uploadToIPFS = async () => {
    if (!imageFile) {
      throw new Error('No image selected');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const metadata = JSON.stringify({
      name: `ghost-post-${Date.now()}`,
      keyvalues: {
        app: 'ghost-app',
      },
    });
    formData.append('pinataMetadata', metadata);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      return `https://green-obedient-lizard-820.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (err) {
      console.error('Error uploading to IPFS:', err);
      throw new Error('Failed to upload image to IPFS');
    }
  };

  const handleAiSuggest = async () => {
    if (!caption.trim()) {
      setError('Please enter some content in the caption field first');
      return;
    }

    setIsAiSuggesting(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai-suggest-caption',
        {
          content: caption.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setAiSuggestion(response.data);
        // Auto-populate the fields with AI suggestions
        setCaption(response.data.caption);
        // Convert hashtags array to comma-separated string (keep # symbols from AI)
        const hashtagsString = response.data.hashtags
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
          .join(', ');
        setHashtags(hashtagsString);
        setSuccess('AI suggestions applied successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      if (err.response?.status === 400) {
        // Content filtering error
        setError(err.response.data.error || 'Content not appropriate for civic reporting. Please focus on community issues.');
      } else if (err.response?.status === 500) {
        setError('AI service temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to get AI suggestions. Please check your internet connection and try again.');
      }
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!imageFile) {
      setError('Please select an image to upload');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadToIPFS();
      const hashtagsArray = hashtags
        .split(',')
        .map(tag => tag.trim().replace('#', '').trim())
        .filter(tag => tag.length > 0);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await axios.post(
        'http://localhost:5000/api/posts',
        {
          caption: caption.trim(),
          hashtags: hashtagsArray,
          imageUrl,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess('Post created successfully!');
        setTimeout(() => {
          navigate('/explore');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:40px_40px] animate-fade-in"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(139,92,246,0.9)] rounded-md transform hover:scale-110 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide mb-2">
            Create New Post
          </h1>
          <p className="text-gray-300">Share your ghostly creation with the world</p>
        </div>
        <div className="bg-gray-900/75 backdrop-blur-lg p-6 border border-gray-600 rounded-sm shadow-lg hover:shadow-[0_0_30px_#6b46c1] transition-shadow duration-500">
          {error && (
            <div className="mb-4 p-3 bg-red-900/25 border border-red-500 rounded-sm text-red-300 animate-fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-900/25 border border-green-500 rounded-sm text-green-300 animate-fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">Upload Image</label>
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-sm border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-black/90 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-sm cursor-pointer hover:border-purple-600 transition-colors bg-black/90">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF (Max. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="caption" className="text-sm font-medium text-gray-300">
                  Caption
                </label>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting || !caption.trim()}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-purple-300 bg-purple-900/30 border border-purple-600/50 rounded-md hover:bg-purple-800/40 hover:border-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAiSuggesting ? (
                    <>
                      <div className="animate-spin h-3 w-3 border border-purple-300 border-t-transparent rounded-full"></div>
                      Suggesting...
                    </>
                  ) : (
                    <>
                      <FiZap className="w-3 h-3" />
                      AI Suggest
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                placeholder="What's this post about? (e.g., water problem, road damage, etc.)"
                rows="3"
                maxLength="2200"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter a brief description and click "AI Suggest" to get an enhanced caption and hashtags
              </p>
            </div>
            <div className="mb-6">
              <label htmlFor="hashtags" className="block mb-1 text-sm font-medium text-gray-300">
                Hashtags
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHash className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="hashtags"
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                  placeholder="comma,separated,values (include # for AI suggestions)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Separate with commas (e.g., ghost, art, web3) and include # for AI suggestions (e.g., #ghost, #art, #web3)
              </p>
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="relative w-full py-3 uppercase font-bold text-white overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-borderRotate p-[1.5px]"></span>
              <span className="relative block bg-black/90 rounded-sm py-2">
                {isUploading ? (
                  <span className="flex justify-center items-center gap-2">
                    <span className="loader"></span> Uploading...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Post
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;