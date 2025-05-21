import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landingpage/Navbar';
import Footer from '../components/landingpage/Footer';

interface Guide {
  title: string;
  description: string;
  category: string;
}

const Guides: React.FC = () => {
  const guides: Guide[] = [
    {
      title: 'Document Verification Process',
      description: 'Step-by-step guide to verifying your institutional documents',
      category: 'Verification',
    },
    {
      title: 'Blockchain Integration Guide',
      description: 'How to integrate with our blockchain verification system',
      category: 'Technical',
    },
    {
      title: 'User Management Best Practices',
      description: 'Managing user roles and permissions in your institution',
      category: 'Administration',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 pt-32">
        <h1 className="text-4xl font-bold text-yellow-700 mb-8">Guides & Resources</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                {guide.category}
              </span>
              <h2 className="text-xl font-semibold mt-4 mb-2">{guide.title}</h2>
              <p className="text-gray-600 mb-4">{guide.description}</p>
              <Link
                to="#"
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Read Guide →
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Guides;
