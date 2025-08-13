import React, { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiMail } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { MdFeaturedPlayList } from "react-icons/md";
import LOGOS from '../assets/logo.jpg';
import "../index.css"

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

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
        handleLogout();
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

  const handleLogout = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Navigation items data
  const navItems = [
    { label: 'Features', icon: <MdFeaturedPlayList className="mr-2"/>, className:"alegreya" },
    { label: 'Security', icon: <FiShield className="mr-2" /> },
    { label: 'Community', icon: <FiUsers className="mr-2" /> },
    { label: 'Contact', icon: <FiMail className="mr-2" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <div className="flex items-center space-x-3">
            <img 
              src={LOGOS}
              alt="Ghostpic Metis Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Ghostpic Metis
            </h1>
          </div>

          {/* Navigation Items - Hidden on mobile */}
          <nav className="hidden md:flex space-x-12">
            {navItems.map((item, index) => (
              <a 
                key={index}
                href="#" 
                className="flex items-center alegra text-2xl text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="flex items-center border-white border-2 bg-gray-800 px-4 py-2 rounded-full">
                  <FaEthereum className="text-blue-400 mr-2" />
                  <span className="text-sm text-white font-medium">{shortenAddress(walletAddress)}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-200 hover:text-red-400 transition-colors duration-200"
                  title="Logout"
                >
                  <RiLogoutCircleRLine className="text-xl" />
                </button>
              </>
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
          {navItems.map((item, index) => (
            <a 
              key={index}
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              title={item.label}
            >
              {React.cloneElement(item.icon, { className: 'text-xl' })}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;