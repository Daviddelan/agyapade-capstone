import React from 'react';
import Navbar from '../components/landingpage/Navbar';
import Footer from '../components/landingpage/Footer';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Adjusted spacing */}
      <main className="flex-grow pt-20">
        <section className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">About M'agyapade</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Revolutionizing institutional operations through blockchain-powered solutions
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To provide secure, transparent, and efficient document verification solutions
                for financial institutions and government agencies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-yellow-600">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Blockchain Technology</h3>
                    <p className="text-gray-600">Immutable record-keeping for all transactions</p>
                  </div>
                </div>
                {/* Add more features here */}
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">Core Values</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="text-yellow-600 mr-2">•</span>
                  Transparency in all operations
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-600 mr-2">•</span>
                  Security-first approach
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-600 mr-2">•</span>
                  User-centric design
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
