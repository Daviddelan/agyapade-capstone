import React from 'react';
import {
  FaUpload,
  FaBuilding,
  FaShieldAlt,
  FaSearchDollar,
  FaRobot,
  FaCheckCircle,
} from 'react-icons/fa';

interface Step {
  icon: JSX.Element;
  title: string;
  subtitle: string;
  points: string[];
}

const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      icon: <FaUpload className="w-8 h-8 text-yellow-600" />,
      title: 'Upload Documents',
      subtitle: 'Secure Submission Process',
      points: [
        'Applicants submit land titles, tax receipts, IDs',
        '256-bit encryption & blockchain hashing',
        'Supported formats: PDF, JPEG, PNG',
      ],
    },
    {
      icon: <FaBuilding className="w-8 h-8 text-blue-600" />,
      title: 'Government Verification',
      subtitle: 'Official Authentication',
      points: [
        'Land registry & tax office validation',
        'Blockchain-recorded approval status',
        'Immutable verification history',
      ],
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-green-600" />,
      title: 'Secure Access',
      subtitle: 'Financial Institution Portal',
      points: [
        'Document hash verification',
        'Real-time validity checks',
        'AI-powered fraud detection',
      ],
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-700">
              Secure Document Verification
            </span>{' '}
            in 3 Steps
          </h2>
          <p className="text-xl text-gray-600">
            Blockchain-powered assurance for financial transactions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-opacity-10 rounded-full bg-yellow-100">
                  {step.icon}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {step.title}
                </div>
                <p className="text-yellow-600 mb-4 font-medium">{step.subtitle}</p>
                <ul className="text-left space-y-3">
                  {step.points.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Technology Partners Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Powered By Cutting-Edge Technologies
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="flex flex-col items-center">
              <FaRobot className="w-12 h-12 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-600">AI Validation</span>
            </div>
            <img src="/blockchain-tech.png" alt="Blockchain" className="h-12 w-auto opacity-90" />
            <img src="/bank-security.png" alt="Bank Security" className="h-12 w-auto opacity-90" />
            <div className="flex flex-col items-center">
              <FaSearchDollar className="w-12 h-12 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-600">Secure Access</span>
            </div>
            <img src="/government-seal.png" alt="Government" className="h-12 w-auto opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
