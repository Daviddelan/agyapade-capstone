import React from 'react';
import Navbar from '../components/landingpage/Navbar';
import Footer from '../components/landingpage/Footer';

interface Template {
  name: string;
  format: string;
  size: string;
}

const Templates: React.FC = () => {
  const templates: Template[] = [
    {
      name: 'Verification Request Form',
      format: 'PDF',
      size: '1.2 MB',
    },
    {
      name: 'Document Checklist',
      format: 'DOCX',
      size: '356 KB',
    },
    {
      name: 'Compliance Agreement',
      format: 'PDF',
      size: '890 KB',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 pt-32">
        <h1 className="text-4xl font-bold text-yellow-700 mb-8">Official Templates</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-6 py-4 text-left">Template Name</th>
                <th className="px-6 py-4 text-left">Format</th>
                <th className="px-6 py-4 text-left">Size</th>
                <th className="px-6 py-4 text-left">Download</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 hover:bg-yellow-50"
                >
                  <td className="px-6 py-4">{template.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {template.format}
                    </span>
                  </td>
                  <td className="px-6 py-4">{template.size}</td>
                  <td className="px-6 py-4">
                    <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
