import React, { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={`fixed w-full ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } shadow-sm z-50 transition-colors duration-300`}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">BlockLoan Ghana</div>
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
