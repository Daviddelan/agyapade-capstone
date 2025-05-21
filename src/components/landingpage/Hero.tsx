import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[500px] bg-[url('/office-building.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-2xl">
          <h1 className="text-5xl font-bold text-yellow-400 mb-4">
            Transforming Institutional Operations
          </h1>
          <p className="text-lg text-yellow-100 mb-6">
            Streamline your institution's processes with our cutting-edge solutions
            designed for modern organizations
          </p>
          <button className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition duration-300">
            Read More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
