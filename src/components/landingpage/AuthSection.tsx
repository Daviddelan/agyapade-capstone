import React from 'react';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const AuthSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-700 mb-4">Welcome to InstitutionPro</h2>
          <p className="text-lg text-yellow-600 mb-8">Please login or create an account to access our services</p>
          <div className="flex justify-center space-x-6">
            <button className="flex items-center bg-yellow-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-700 transition duration-300">
              <FaSignInAlt className="mr-2" />
              Login
            </button>
            <button className="flex items-center border-2 border-yellow-600 text-yellow-600 px-8 py-3 rounded-lg hover:bg-yellow-50 transition duration-300">
              <FaUserPlus className="mr-2" />
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
