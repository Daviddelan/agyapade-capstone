import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSignInAlt,
  FaChevronDown,
  FaHome,
  FaInfoCircle,
  FaFileAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`bg-white fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4">
              <img
                src="https://res.cloudinary.com/dt3xctihn/image/upload/v1739158845/M_AGYAPADE3_p05vcq.png"
                alt="Logo"
                className="w-12 h-12"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                M'agyapade
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="group flex items-center text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md font-medium transition duration-300"
            >
              <FaHome className="mr-2 text-lg opacity-70 group-hover:opacity-100" />
              Home
            </Link>

            <div className="relative group">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md font-medium transition duration-300"
              >
                <FaFileAlt className="mr-2 text-lg opacity-70 group-hover:opacity-100" />
                Resources
                <FaChevronDown className="ml-2 text-sm mt-1" />
              </button>
              <div
                className={`absolute ${isOpen ? 'block' : 'hidden'} w-48 pt-2`}
              >
                <div className="bg-white rounded-lg shadow-xl py-2">
                  <Link
                    to="/guides"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50"
                  >
                    <span className="mr-2">📚</span>
                    Guides
                  </Link>
                  <Link
                    to="/templates"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50"
                  >
                    <span className="mr-2">📄</span>
                    Templates
                  </Link>
                  <Link
                    to="/faqs"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50"
                  >
                    <span className="mr-2">❓</span>
                    FAQs
                  </Link>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="flex items-center text-gray-600 hover:text-yellow-600 px-3 py-2 rounded-md font-medium transition duration-300"
            >
              <FaInfoCircle className="mr-2 text-lg opacity-70 group-hover:opacity-100" />
              About
            </Link>

            {/* Login & Sign Up Buttons */}
            <Link
              to="/login"
              className="text-gray-600 hover:text-yellow-600 px-4 py-2 rounded-md border border-yellow-600 hover:bg-yellow-50 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-yellow-600"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} pb-4`}>
          <div className="px-2 pt-2 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              Home
            </Link>
            <Link
              to="/guides"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              Guides
            </Link>
            <Link
              to="/templates"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              Templates
            </Link>
            <Link
              to="/faqs"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              FAQs
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              About
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 text-gray-600 hover:bg-yellow-50 rounded-md"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block px-3 py-2 bg-yellow-600 text-white rounded-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
