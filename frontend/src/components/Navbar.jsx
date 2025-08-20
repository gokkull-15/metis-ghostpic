import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import LOGOS from '../assets/logo.png';
import "../index.css"
import { MdExplore } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const location = useLocation();

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress('');
        setIsConnected(false);
      } else {
        setWalletAddress(accounts[0]);
      }
    });
  }, []);

  const addMetisSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xea06', // 59902 in hexadecimal
          chainName: 'Metis Sepolia Testnet',
          nativeCurrency: {
            name: 'Metis',
            symbol: 'sMETIS',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.metisdevops.link'],
          blockExplorerUrls: ['https://sepolia-explorer.metisdevops.link/']
        }]
      });
    } catch (error) {
      console.error('Error adding Metis Sepolia network:', error);
    }
  };

  const switchToMetisSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xea06' }] // 59902 in hexadecimal
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await addMetisSepoliaNetwork();
      } else {
        console.error('Error switching to Metis Sepolia:', switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to Metis Sepolia
        await switchToMetisSepolia();
        
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path) => location.pathname === path;

  // Navigation items data
  const navItems = [
    { label: 'Explore', icon: MdExplore, path: '/explore' },
    { label: 'Search', icon: FiSearch, path: '/search' },
    { label: 'Create Post', icon: FaPlusCircle, path: '/create-post' },
    { label: 'Profile', icon: FiUser, path: '/profile' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={LOGOS}
              alt="Ghostpic Metis Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Ghostpic Metis
            </h1>
          </Link>

          {/* Navigation Items - Hidden on mobile */}
          <nav className="hidden md:flex">
            <div className="flex items-center gap-8">
              {navItems.map(({ label, icon: Icon, path }) => (
                <Link
                  key={label}
                  to={path}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all group overflow-hidden border ${
                    isActive(path)
                      ? "border-sky-400/60 bg-slate-900/40 shadow-[0_0_18px_-4px_rgba(56,189,248,0.45)]"
                      : "border-cyan-600/25 hover:border-sky-400/50 bg-slate-900/20 hover:bg-slate-900/30"
                  }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-700/0 via-sky-500/10 to-blue-700/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon size={16} className="text-sky-300" />
                  <span className="relative text-cyan-100">{label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center border-white border-2 bg-gray-800 px-4 py-2 rounded-full">
                <FaEthereum className="text-blue-400 mr-2" />
                <span className="text-sm text-white font-medium">{shortenAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Visible only on mobile */}
        <nav className="md:hidden mt-4 flex justify-center space-x-6">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Link 
              key={label}
              to={path}
              className={`transition-colors duration-200 ${
                isActive(path) ? "text-sky-300" : "text-gray-400 hover:text-white"
              }`}
              title={label}
            >
              <Icon className="text-xl" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;