import React from 'react';
import {
  FaShieldAlt,
  FaRobot,
  FaLandmark,
  FaFileContract,
  FaUserCheck,
} from 'react-icons/fa';

interface Feature {
  icon: JSX.Element;
  title: string;
  desc: string;
}

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <FaShieldAlt className="w-12 h-12" />,
      title: 'Decentralized & Secure Verification',
      desc: 'Immutable blockchain ledger prevents fraud',
    },
    {
      icon: <FaRobot className="w-12 h-12" />,
      title: 'Automated Processing',
      desc: 'Smart contracts reduce processing time',
    },
    {
      icon: <FaLandmark className="w-12 h-12" />,
      title: 'Transparent Ownership',
      desc: 'Prevents multiple asset claims',
    },
    {
      icon: <FaFileContract className="w-12 h-12" />,
      title: 'Regulatory Compliance',
      desc: "Aligns with Ghana's regulations",
    },
    {
      icon: <FaUserCheck className="w-12 h-12" />,
      title: 'User-Friendly Interface',
      desc: 'Intuitive dashboard for all users',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
