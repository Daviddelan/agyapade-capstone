import React, { useState } from 'react';
import Navbar from '../components/landingpage/Navbar';
import Footer from '../components/landingpage/Footer';

interface FAQ {
  question: string;
  answer: string;
}

const FAQs: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: 'How does the verification process work?',
      answer:
        'Our verification process uses blockchain technology to ensure document authenticity...',
    },
    {
      question: 'What document formats are supported?',
      answer:
        'We accept PDF, JPEG, and PNG formats for all document submissions...',
    },
    {
      question: 'How long does verification take?',
      answer: 'Standard verification typically takes 3-5 business days...',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 pt-32">
        <h1 className="text-4xl font-bold text-yellow-700 mb-8">
          Frequently Asked Questions
        </h1>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 bg-yellow-50 text-left font-medium flex justify-between items-center"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
              >
                {faq.question}
                <span
                  className={`transform transition-transform ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`px-6 py-4 bg-white ${
                  activeIndex === index ? 'block' : 'hidden'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
