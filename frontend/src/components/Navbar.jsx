import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { FaEthereum, FaHeart } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import LOGOS from '../assets/logo.png';
import "../index.css"
import { MdExplore } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click to close menu
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const mobileMenuButton = document.querySelector('#mobile-menu-button');
      const mobileMenu = document.querySelector('#mobile-menu');

      if (
        isMenuOpen &&
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        (!mobileMenuButton || !mobileMenuButton.contains(event.target))
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Close the mobile menu when a menu item is clicked
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ease-in-out backdrop-blur-xl border-b ${
        isScrolled
          ? "bg-[#0c1322]/85 border-cyan-600/30 shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src={LOGOS}
                alt="Ghostpic Metis Logo" 
                className="h-12 w-12 object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                Ghostpic
              </h1>
              <span className="text-xs text-cyan-400 font-medium tracking-wider -mt-1 ml-0.5">METIS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex ml-6">
            <div className="flex items-center gap-2">
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
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center border-sky-400/60 border bg-slate-900/40 px-4 py-2 rounded-xl text-sm font-medium text-cyan-100">
                <FaEthereum className="text-sky-300 mr-2" />
                <span>{shortenAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all group overflow-hidden border border-cyan-600/25 hover:border-sky-400/50 bg-slate-900/20 hover:bg-slate-900/30"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-700/0 via-sky-500/10 to-blue-700/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FaEthereum size={16} className="text-sky-300" />
                <span className="relative text-cyan-100">Connect Wallet</span>
              </button>
            )}

            {/* Mobile Toggle */}
            <button
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative p-2 rounded-lg border border-cyan-600/30 bg-slate-900/40 backdrop-blur-lg text-cyan-200 hover:border-sky-400/60 hover:bg-slate-800/50 transition-all"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Panel */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-all duration-400 ease-out origin-top overflow-hidden ${
          isMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mt-2 mb-4 rounded-2xl border border-cyan-600/30 bg-[#0c1322]/90 backdrop-blur-xl shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)] p-4 space-y-2">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              onClick={closeMenu}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all border overflow-hidden ${
                isActive(path)
                  ? "border-sky-400/60 bg-slate-900/50 shadow-[0_0_18px_-4px_rgba(56,189,248,0.45)]"
                  : "border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/40"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-700/0 via-sky-500/10 to-blue-700/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon size={18} className="text-sky-300" />
              <span className="relative text-cyan-100">{label}</span>
            </Link>
          ))}
          
          {/* Wallet connection in mobile menu */}
          <div className="pt-2 mt-2 border-t border-cyan-600/30">
            {isConnected ? (
              <div className="flex items-center justify-center px-4 py-3 rounded-xl border border-sky-400/60 bg-slate-900/50">
                <FaEthereum className="text-sky-300 mr-2" />
                <span className="text-cyan-100">{shortenAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  closeMenu();
                }}
                className="w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/40"
              >
                <FaEthereum size={18} className="text-sky-300" />
                <span className="text-cyan-100">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;